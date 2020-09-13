//@flow
import React, { useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectMidiDataLength } from './slice'

type VideoEffectorType = {
  ctx: Object,
  stream: MediaStream
}
const VideoEffector = (props:VideoEffectorType) => {
  const { ctx, stream } = props
  const len = useSelector( selectMidiDataLength )
  const video = useRef()

  useEffect(() => {
    if( stream ) {
      video.current = window.document.createElement( 'video' )
      video.current.srcObject = stream
      video.current.width = 640
      video.current.height = 480
      if( video.current && video.current.setAttribute ) {
        video.current.setAttribute('autoplay', true)
        // video.current.setAttribute('muted', true)
        video.current.setAttribute('playsinline', true)
        // video.current.muted = true
      }
    }
  }, [stream])

  useEffect(() => {
    let reqId
    const w = 640, h = 480
    if( ctx ) {
      const num = !!len ? len : 1
      const _draw = () => {
        ctx.clearRect( 0, 0, w, h )

        let _w = w / num, _h = h / num

        for( let y = 0; y < num; y++ ) {
          for( let x = 0; x < num; x++ ) {
            if( video.current ) {
              ctx.drawImage( video.current, x * _w, y * _h, 640 / num, 480 / num )
            }
          }
        }
        reqId = requestAnimationFrame( _draw )
      }
      _draw()
    }
    return function cleanup() {
      cancelAnimationFrame( reqId )
    }
  }, [video, ctx, len])


  return (
    <span>
    </span>
  )
}

export default function(props) {
  const { stream } = props
  const canvas = useRef(null)
  const ctx = canvas.current ?
    canvas.current.getContext('2d') : null


  return (
    <div style={{position: "absolute", width: 640, height: 520}}>
      <canvas style={{filter: "grayscale()" }} ref={e => canvas.current = e } width={640} height={480}></canvas>
      <VideoEffector ctx={ctx} stream={stream} />
    </div>
  )
}