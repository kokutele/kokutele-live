// @flow

import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { selectMidiData } from './slice'

import './style.css'

const blacks = [-1, 49, 51, -1, 54, 56, 58, -1, 61, 63, -1, 66, 68, 70, -1]
const whites = [48, 50, 52, 53, 55, 57, 59, 60, 62, 64, 65, 67, 69, 71, 72]

type CodeEffectorPropTypes = {
  canvas: HTMLCanvasElement,
}
const useCodeEffector = (props:CodeEffectorPropTypes) => {
  const midiData = useSelector( selectMidiData )
  const { canvas } = props
  const ctx = canvas && canvas.getContext('2d')

  useEffect( () => {
    if( ctx ) {
      const w = canvas.clientWidth
        , h = canvas.clientHeight
      canvas.width = w
      canvas.height = h
      ctx.clearRect( 0, 0, w, h )
      ctx.beginPath()
      // 白鍵盤
      {
        const _w = w / whites.length, _h = h / 5 
        for ( let i = 0; i < whites.length; i++ ) {
          const _c = whites[i]
          const x0 = _w * i, y0 = 3

          const isNote = midiData.find( o => o.code === _c )
          ctx.fillStyle = isNote ? "#fff67f" : "#fff"
          ctx.fillRect(x0, y0, _w, _h)
          ctx.strokeStyle = "#666"
          ctx.strokeRect(x0, y0, _w, _h)
        }
      }
      // 黒鍵盤
      {
        const _w = w / blacks.length, _h = h / 10
        for ( let i = 0; i < blacks.length; i++ ) {
          const _c = blacks[i]
          if( _c !== -1 ) {
            const x0 = ( i - 0.25 ) * _w, y0 = 3

            const isNote = midiData.find( o => o.code === _c )
            ctx.fillStyle = isNote ? "#b7aa00" : "#000"
            ctx.fillRect(x0, y0, _w * 0.5, _h)
          }
        }
      }
    }
  }, [ctx, canvas, midiData])
}

export default function() {
  const canvas = useRef()
  useCodeEffector({ canvas: canvas.current })

  return (
    <div className="CodeViewer">
      <canvas ref={e => canvas.current = e }></canvas>
    </div>
  )
}