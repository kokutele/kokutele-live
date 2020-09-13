import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { selectMidiData } from './slice'

const upper = [49, 51, 54, 56, 58, 61, 63, 66, 68, 70]

const CodeEffector = ({ctx}) => {
  const midiData = useSelector( selectMidiData )

  useEffect( () => {
    ctx.clearRect( 0, 0, 640, 480 )
    ctx.beginPath()
    for( let {code, strength} of midiData ) {
      const offsetX = 5 + Math.floor(640 * ( code - 48 ) / 26)
      const offsetY = upper.includes( code ) ? 70 : 450
      const r = 20
      const opacity = strength / 127

      ctx.fillStyle = `rgba(255,255,0,${opacity})`  // yello with opacity
      ctx.arc( offsetX + r, offsetY - r, r, 0, 2 * Math.PI )
    }
    ctx.fill()
  }, [ctx, midiData])

  return (
    <span></span>
  )
}

export default function() {
  const canvas = useRef()
  const ctx = canvas.current ?
    canvas.current.getContext('2d') : null

  return (
    <div className="CodeViewer" style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}>
      <canvas ref={e => canvas.current = e } width={640} height={480}></canvas>
      { ctx && (
        <CodeEffector ctx={ctx} />
      )}
    </div>
  )
}