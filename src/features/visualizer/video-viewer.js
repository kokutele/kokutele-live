//@flow
import React, { useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectMidiDataLength } from './slice'

type VideoEffectorType = {
  canvas: HTMLCanvasElement,
  stream: MediaStrea,
}

const useVideoEffector = (props:VideoEffectorType): void => {
  const { canvas, stream } = props

  const len = useSelector( selectMidiDataLength )
  const video = useRef()

  useEffect(() => {
    if( stream ) {
      video.current = window.document.createElement( 'video' )
      video.current.srcObject = stream
      video.current.width = 640
      video.current.height = 480
      video.current.autoplay = true
      video.current.playsInline = true
    }
  }, [stream])

  useEffect(() => {
    let reqId
    const ctx = canvas && canvas.getContext('2d')
    if( ctx ) {
      const w = canvas.clientWidth, h = canvas.clientHeight
      canvas.width = w
      canvas.height = h
      const num = !!len ? len : 1
      const _draw = () => {
        ctx.clearRect( 0, 0, w, h )

        let _w = w / num, _h = h / num

        for( let y = 0; y < num; y++ ) {
          for( let x = 0; x < num; x++ ) {
            if( video.current ) {
              ctx.drawImage( video.current, x * _w, y * _h, w / num, h / num )
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
  }, [len, canvas])
}

type PropTypes = {
  stream: MediaStream,
}

export default function(props:PropTypes) {
  const { stream } = props
  const canvas = useRef(null)

  useVideoEffector({
    canvas: canvas.current,
    stream
  })


  return (
    <div>
      <canvas style={{filter: "grayscale()" }} ref={e => canvas.current = e }></canvas>
    </div>
  )
}