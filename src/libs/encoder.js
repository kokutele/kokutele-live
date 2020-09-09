// @flow

import EventEmiiter from 'events'

type PropTypes = {
  stream: MediaStream;
}



export default class LiveEncoder extends EventEmiiter {
  _stream: MediaStream;
  _reqKeyFrame: boolean;

  static create(stream:MediaStream):LiveEncoder {
    const encoder = new LiveEncoder( {stream} )
    return encoder
  }

  constructor( props: PropTypes ) {
    super()

    this._stream = props.stream
    // this._onChunk = props.onChunk
    // this._onError = props.onError
    this._reqKeyFrame = false
  }

  start():void {
    const [track]:Array<MediaStreamTrack> = this._stream.getVideoTracks()

    const videoEncoder = new window.VideoEncoder({
      output: chunk => {
        this.emit('chunk', chunk)
      },
      error: err => {
        this.emit('error', err)
      }
    })
    videoEncoder.configure({
      codec: 'vp8',
      width: 640,
      height: 480,
      framerate: 30
    })

    const videoReader = new window.VideoTrackReader(track)

    let idx = 0
    const interval = 10 * 30 // 10 sec
    videoReader.start( frame => {
      const _reqKeyFrame = this._reqKeyFrame || !(idx++ % interval)
      videoEncoder.encode(frame, {keyFrame: _reqKeyFrame})
      this._reqKeyFrame = false
    })

    console.log('constructed')
  }

  set reqKeyFrame( req:boolean ) {
    this._reqKeyFrame = req
  }
}

