//@flow

import React from 'react'

import VideoViewer from './video-viewer'
import CodeViewer from './code-viewer'

import './style.css'

type PropTypes = {
  stream: MediaStream;
}

export default function(props:PropTypes = {}) {
  const { stream } = props
  return (
    <div className="Vusualizer">
      <div className="wrapper">
        <VideoViewer stream={stream} />
        <CodeViewer />
      </div>
    </div>
  )
}