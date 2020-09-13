import React, {useRef, useEffect} from 'react'
import { useSelector } from 'react-redux'
import { selectMidiData } from './slice'



// fixup vendor prefix
window.AudioContext = window.AudioContext || window.webkitAudioContext;

const WaveEffector = ({ctx}) => {
  const midiData = useSelector( selectMidiData )
  useEffect( () => {
    const sources = []
    const audioCtx = new AudioContext()
    let reqId = 0
    if( ctx ) {
      for( let {code} of midiData ) {
        const f = Math.pow( 2, (( code - 69 ) / 12 )) * 440
        const source = audioCtx.createOscillator()
        source.frequency.value = f
        sources.push( source )
      }
      const analyser = audioCtx.createAnalyser()
      const gain = audioCtx.createGain()

      analyser.connect( gain )
      gain.connect( audioCtx.destination )

      for( let source of sources ) {
        source.connect( analyser )
        source.start()
      }

      analyser.fftSize = 2048

      gain.gain.value = 0

      const w = 640, h = 480
      const x0 = 0, y0 = Math.floor( h / 2 )

      const _draw = _ => {
        const times = new Uint8Array(analyser.fftSize);
        const d = w / times.length

        analyser.getByteTimeDomainData(times);

        ctx.clearRect(0, 0, w, h)

        ctx.beginPath()
        ctx.strokeStyle = `rgba(240, 230, 140, 1)`//'#008b8b'
        ctx.moveTo(x0, y0)
        for( let i = 0; i < times.length; i++) {
          const _x = x0 + d * i
          const _y = y0 + (times[i] - 128)
          ctx.lineTo(_x, _y)
        }
        ctx.stroke()

        reqId = requestAnimationFrame(_draw)
      }
      _draw()
    } 

    return function cleanup() {
      if(!!reqId) cancelAnimationFrame(reqId)
      if( sources.length > 0 ) {
        for( let source of sources ) {
          source.stop()
        }
      }
      audioCtx.close()
    }
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
    <div className="WaveViewer" style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}>
      <canvas ref={e => canvas.current = e } width={640} height={480}></canvas>
      { ctx && (
        <WaveEffector ctx={ctx} />
      )}
    </div>
  )
}