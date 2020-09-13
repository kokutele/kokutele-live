// @flow

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { addMidiData } from '../visualizer/slice'
import {
  Button, Input
} from 'antd'

import Visualizer from '../visualizer'

import LiveReceiver from '../../libs/live-receiver'

type videoTypes = {
  current: ?HTMLVideoElement
}
type streamTypes = {
  current: ?MediaStream
}
type ReceiverViewPropsTypes = {
  liveId: string;
}

export default function(props:ReceiverViewPropsTypes){
  const [peerId:string, setPeerId:Function] = useState('')
  const [ liveId, setLiveId ] = useState(props.liveId)
  const [ videoBitrate,      setVideoBitrate ]      = useState(0)
  const [ videoFractionLost, setVideoFractionLost ] = useState(0)
  const [ videoJitter,       setVideoJitter ]       = useState(0)
  const video:videoTypes = useRef()
  const stream:streamTypes = useRef( new MediaStream() )
  const liveIdInput = useRef()

  const dispatch = useDispatch()

  useEffect( () => {
    if(video.current && stream.current ) {
      video.current.srcObject = stream.current
    }
  }, [video, stream])

  const handleClick = useCallback( ():void => {
    if( !!liveId ) {
      LiveReceiver.create({liveId, onmidimessage: midis => {
        dispatch( addMidiData( Array.from(midis).reverse() ))
      }}) 
        .then( receiver => {
          setPeerId( receiver.peerId )
          receiver.on('track', t => {
            if( stream.current && stream.current.addTrack ) {
              stream.current.addTrack( t )
            }
          })
          receiver.start()

          receiver.on('momentReport', report => {
            const rate = report.receive.video.bitrate
            const fractionLost = report.receive.video.fractionLost
            const jitter = report.receive.video.jitterBufferDelay

            if (!rate) {
              setVideoBitrate( 0 )
            } else {
              setVideoBitrate( (rate / 1000000).toFixed(2) )
            }
            if (!fractionLost) {
              setVideoFractionLost( 0 )
            } else {
              setVideoFractionLost( fractionLost.toFixed(2) )
            }
            if (!jitter) {
              setVideoJitter( 0 )
            } else {
              setVideoJitter( jitter.toFixed(2) )
            }
          })
        })
    }
  }, [liveId, dispatch])

  return (
    <div className="ReceiverView">
      <Input 
        ref={ e => liveIdInput.current = e } 
        placeholder="liveId here" 
        onChange={ e => {
          setLiveId(e.target.value)
        }}
        value={liveId} 
      /><br/>
      <Button type="primary" shape="round" onClick={handleClick}>Start Receiver</Button>
      <div>
        <ul>
          <li>peerId: {peerId}</li>
          <li>Inbound Video moment bitrate: {videoBitrate} Mbps</li>
          <li>Inbound Video fraction lost : {videoFractionLost}</li>
          <li>Inbound Video Jitter : {videoJitter}</li>
        </ul>
      </div>
      <div>
      { stream.current && (
      <Visualizer stream={stream.current} />
      )}        
      </div>
      <div>
        <video ref={ e => video.current = e } style={{maxWidth: 640}} autoPlay/>
      </div>
    </div>
  )
}

