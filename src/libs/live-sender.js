//@flow
import protooClient from 'protoo-client'

const server:string  = process.env.REACT_APP_SERVER || 'localhost'
const port:string    = process.env.REACT_APP_PORT   || '5000'
const useTls:boolean = process.env.REACT_APP_USE_TLS === 'true' || false

const wsEndpoint:string   = `${useTls ? 'wss' : 'ws'}://${server}:${port}`
const httpEndpoint:string = `${useTls ? 'https' : 'http'}://${server}:${port}`

type PropTypes = {
  stream: MediaStream;
  liveId: string;
  peerId: string;
  receiver: string;
  transport: Object;
  peer: Object;
}

type SetupPropTypes = {
  stream: MediaStream;
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



const senders:Map<string, Object> = new Map()

export function setup(createProps:SetupPropTypes):Promise<Object> {
  return new Promise( (resolve, rejct) => {
    const { stream } = createProps
    window.fetch( `${httpEndpoint}/live`, {method: 'post'} )
      .then( res => res.json() )
      .then( ({ liveId, peerId }) => {
        const transport = new protooClient.WebSocketTransport( `${wsEndpoint}/${liveId}?peerId=${peerId}` )
        const peer = new protooClient.Peer( transport )

        peer.on('open', async () => {
          peer.on('request', (req, accept, reject) => {
            if( req.method === "join" ) {
              const obj = req.data
              const sender = new LiveSender({ stream, liveId, peerId, transport, peer, receiver: obj.src })
              sender.start()
              senders.set( obj.src, sender )
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
  _pc: Object;
  _stream: MediaStream;
  _transport: Object; // protooClientTransport
  _peer: Object;
  _liveId: string;
  _peerId: string;
  _receiver: string;


  constructor(props:PropTypes) {
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

  async start() {
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

    this._pc.getSenders().forEach( this._setupSenderTransform.bind(this) )
 }

  _setupSenderTransform(sender: Object) {
    // const kind = sender.track.kind
    const senderStreams = sender.createEncodedStreams();
    const readableStream = senderStreams.readableStream;
    const writableStream = senderStreams.writableStream;

    const transformStream = new window.TransformStream({
      transform: (chunk, controller) => {
        controller.enqueue( chunk )
      },
    });
    readableStream
      .pipeThrough(transformStream)
      .pipeTo(writableStream);
  }

}