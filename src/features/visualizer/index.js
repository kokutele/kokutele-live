//@flow

import React from 'react'

import VideoViewer from './video-viewer'
import CodeViewer from './code-viewer'

import './style.css'

type PropTypes = {
  stream: MediaStream;
  muted: boolean;
}

export default function(props:PropTypes = {}) {
  const { stream, muted } = props
  return (
    <div className="Vusualizer">
      <div className="wrapper">
        <VideoViewer stream={stream} muted={muted} />
        <CodeViewer />
      </div>
    </div>
  )
}