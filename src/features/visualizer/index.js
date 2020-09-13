//@flow

import React from 'react'

import VideoViewer from './video-viewer'
import CodeViewer from './code-viewer'
import WaveViewer from './wave-viewer'

type PropTypes = {
  stream: MediaStream;
}
export default function(props:PropTypes = {}) {
  const { stream } = props
  return (
    <div className="Vusualizer">
      <div style={{position: "relative", width: 640, height: 480}}>
        <VideoViewer stream={stream} />
        <CodeViewer />
        <WaveViewer stream={stream} />
      </div>
    </div>
  )
}