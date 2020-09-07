//@flow
import protooClient from 'protoo-client'
import EventEmitter from 'events'

const server:string  = process.env.REACT_APP_SERVER || 'localhost'
const port:string    = process.env.REACT_APP_PORT   || '5000'
const useTls:boolean = process.env.REACT_APP_USE_TLS === 'true' || false

const wsEndpoint:string   = `${useTls ? 'wss' : 'ws'}://${server}:${port}`
const httpEndpoint:string = `${useTls ? 'https' : 'http'}://${server}:${port}`

type PropTypes = {
  liveId: string;
  sender: string;
  peerId: string;
  transport: Object;
  peer: Object;
}

type configTypes = {
  encodedInsertableStreams: boolean;
}


const config:configTypes = {
  encodedInsertableStreams: true
}

export default class LiveReceiver extends EventEmitter {
  _pc: Object;
  _stream: MediaStream;
  _transport: Object; // protooClientTransport
  _peer: Object;
  _liveId: string;
  _sender: string;
  _peerId: string;

  static create( props: Object ):Promise<LiveReceiver> {
    return new Promise( (resolve, rejct) => {
      const liveId = props.liveId
      const transport = new protooClient.WebSocketTransport( `${wsEndpoint}/${liveId}` )

      transport.on('open', async () => {
        const peer = new protooClient.Peer( transport )
        await new Promise( r => setTimeout(r, 500) )
        const peerId = await peer.request( 'peerId' )
        const obj = await fetch(`${httpEndpoint}/live/${liveId}`).then( res => res.json() )
        await peer.request('join', { dst: obj.sender, src: peerId, liveId: liveId })
        resolve(new LiveReceiver({ liveId, sender: obj.sender, peerId, transport, peer}))
      })
    })
  }
  constructor(props:PropTypes) {
    super()

    this._liveId = props.liveId
    this._sender = props.sender
    this._peerId = props.peerId
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
    this._pc.addEventListener('icecandidate', e => {
      const candidate = e.candidate
      this._peer.notify('icecandidate', { dst: this._sender, src: this._peerId, sdp: candidate }) 
    })
    this._pc.addEventListener('track', e => {
      this.emit( 'track', e.track )
      this._pc.getReceivers().forEach( this._setupReceiverTransform.bind( this ))
    })

    this._peer.on('notification', ( req, accept, reject ) => {
      if( req.method === 'icecandidate' ) {
        const sdp = req.data.sdp
        if( sdp ) this._pc.addIceCandidate( sdp )
      }
    })
     
    this._peer.on('request', async (req, accept, reject) => {
      switch( req.method ) {
      case 'offer':
        const { src, dst, sdp } = req.data
        this._pc.setRemoteDescription( sdp )
        const answer = await this._pc.createAnswer()
        this._pc.setLocalDescription( answer )

        accept( { dst: src, src: dst, sdp: answer } )
        break;
      default:
        reject(400, `unknown method '${req.method}'`)
      }
    })
  }

  _setupReceiverTransform( receiver:Object ) {
    try {
      const kind = receiver.track.kind
      const receiverStreams = receiver.createEncodedStreams()
      const readableStream = receiverStreams.readableStream;
      const writableStream = receiverStreams.writableStream;

      const transformStream = new window.TransformStream({
        transform: (chunk, controller) => {
          controller.enqueue(chunk)
        },
      });
      readableStream
        .pipeThrough(transformStream)
        .pipeTo(writableStream);
      console.log( `setup ReceiverTransform finished - ${kind}`)
    } catch(err) {
      console.warn( err.message)
    }
  }
}
