//@flow
import protooClient from 'protoo-client'
import LiveEncoder from './encoder'

const server:string  = process.env.REACT_APP_SERVER || 'localhost'
const port:string    = process.env.REACT_APP_PORT   || '5000'
const useTls:boolean = process.env.REACT_APP_USE_TLS === 'true' || false

const wsEndpoint:string   = `${useTls ? 'wss' : 'ws'}://${server}:${port}`
const httpEndpoint:string = `${useTls ? 'https' : 'http'}://${server}:${port}`

type PropTypes = {
  encoder: ?LiveEncoder;
  stream: MediaStream;
  liveId: string;
  peerId: string;
  receiver: string;
  transport: Object;
  peer: Object;
}

type SetupPropTypes = {
  stream: MediaStream;
  scalable: boolean;
}

type offerOptionsTypes = {
  offerToReceiveVideo: number;
  offerToReceiveVideo: number;
}

type configTypes = {
  // forceEncodedVideoInsertableStreams: boolean;
  // forceEncodedAudioInsertableStreams: boolean;
  encodedInsertableStreams: boolean;
}



const config:configTypes = {
  encodedInsertableStreams: true
}

const offerOptions:offerOptionsTypes = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 1
}


const chunksMap:Map<string, Array<Object>> = new Map()


export function setup(props:SetupPropTypes):Promise<Object> {
  const senders:Map<string, Object> = new Map()
  const dummyStream:MediaStream = new MediaStream()

  return new Promise( (resolve, rejct) => {
    const { stream, scalable } = props
    let encoderStarted = false
    window.fetch( `${httpEndpoint}/live`, {method: 'post'} )
      .then( res => res.json() )
      .then( ({ liveId, peerId }) => {
        const transport = new protooClient.WebSocketTransport( `${wsEndpoint}/${liveId}?peerId=${peerId}` )
        const peer = new protooClient.Peer( transport )

        peer.on('open', async () => {
          peer.on('request', (req, accept, reject) => {
            if( req.method === "join" ) {
              let encoder
              if( scalable ) {
                if( !encoderStarted ) {
                  console.log( 'start encoder' )

                  encoder = LiveEncoder.create( stream )


                  encoder.on('chunk', chunk => {
                    for( let chunks of chunksMap.values() ) {
                      chunks.push(chunk)
                    }
                  })
                  encoder.on('error', err => {
                    throw(err)
                  })
                  console.log( 'start encoder',1 )
                  console.log( encoder )
                  encoder.start()


                  const dummyVideoTrack = stream.getVideoTracks()[0].clone()
                  dummyVideoTrack.enabled = false
                  dummyStream.addTrack( dummyVideoTrack )
                  dummyStream.addTrack( stream.getAudioTracks()[0] )
                  encoderStarted = true
                }
              }
              const obj = req.data
              const sender = scalable ?
                new LiveSender({ encoder, stream: dummyStream, liveId, peerId, transport, peer, receiver: obj.src }) :
                new LiveSender({ encoder, stream, liveId, peerId, transport, peer, receiver: obj.src })
              sender.start(scalable)
              senders.set( obj.src, sender )
              chunksMap.set( obj.src, [] )
              accept() // todo - rejct when either obj.liveId or obj.dst is invalid.
            } else if( req.method === "leave" ) {
              const obj = req.data
              senders.delete( obj.src )
              accept() // todo - rejct when either obj.liveId or obj.dst is invalid.
            }
          })
        })
        resolve( { liveId, peerId } )
      })
  })
}


export default class LiveSender {
  _encoder: ?LiveEncoder;
  _pc: Object;
  _stream: MediaStream;
  _transport: Object; // protooClientTransport
  _peer: Object;
  _liveId: string;
  _peerId: string;
  _receiver: string;


  constructor(props:PropTypes) {
    this._encoder = props.encoder
    this._stream = props.stream
    this._liveId = props.liveId
    this._peerId = props.peerId
    this._receiver = props.receiver
    this._transport = props.transport
    this._peer = props.peer
  }

  get liveId():string {
    return this._liveId
  }

  get peerId():string {
    return this._peerId
  }

  async start(scalable: boolean) {
    this._pc = new window.RTCPeerConnection( config )
    this._stream.getTracks().forEach( t => this._pc.addTrack( t, this._stream ) )
    this._pc.addEventListener('icecandidate', e => {
      const candidate = e.candidate
      this._peer.notify('icecandidate', { dst: this._receiver, src: this._peerId, sdp: candidate }) 
    })

    this._peer.on('notification', ( req, accept, reject ) => {
      if( req.method === 'icecandidate' ) {
        const sdp = req.data.sdp
        if( sdp ) this._pc.addIceCandidate( sdp )
      }
    })

    const offer = await this._pc.createOffer( offerOptions )
    this._pc.setLocalDescription( offer )
    const { sdp } = await this._peer.request('offer', { src: this._peerId, dst: this._receiver, sdp: offer })
    this._pc.setRemoteDescription( sdp )

    this._pc.getSenders().forEach( sender => this._setupSenderTransform(sender, scalable) )
 }

  _setupSenderTransform(sender: Object, scalable: boolean) {
    const senderStreams = sender.createEncodedStreams();
    const readableStream = senderStreams.readableStream;
    const writableStream = senderStreams.writableStream;

    let idx = 0
    const transformStream = new window.TransformStream({
      transform: (chunk, controller) => {
        if( scalable ) {
          const kind = chunk instanceof window.RTCEncodedVideoFrame ? 'video' : 'audio'
          if( kind === "video" && chunk.type === "key") {
            console.log( chunk.type )
            if( this._encoder ) {
              this._encoder.reqKeyFrame = true
            }
          }

          // todo - remvoe transformed _chunk
          const _chunks = chunksMap.get(this._receiver)
          const _chunk = (_chunks && _chunks.length > 0) && _chunks[idx++]

          if( _chunk ) {
            if( kind === "video") {
              if( typeof _chunk === 'object' && _chunk.data ) {
                chunk.data = _chunk.data
                controller.enqueue( chunk )
              }
            } else {
              controller.enqueue( chunk )
            }
          }
        } else {
          controller.enqueue( chunk )
        }
      },
    });
    readableStream
      .pipeThrough(transformStream)
      .pipeTo(writableStream);
  }

}