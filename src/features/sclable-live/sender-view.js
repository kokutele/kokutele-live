// @flow

import React, { useState, useRef, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Button, Input, Checkbox
} from 'antd'

import {
  setLiveId,
  setSender,
  selectLiveId,
  selectSender,
  selectWebCodecsSuppoted
} from './slice'

import { setup, addInlineData } from '../../libs/live-sender'
import { getSourceMediaStream } from '../../libs/stream-operator'

import MidiVisualizer from './components/midi-visualizer'

type videoTypes = {
  current: ?HTMLVideoElement
}

export default function(){
  const liveId:string = useSelector( selectLiveId )
  const peerId:string = useSelector( selectSender )
  const isWebCodecsSupported:boolean = useSelector( selectWebCodecsSuppoted )

  const video:videoTypes = useRef()

  const [scalable, setScalable] = useState( isWebCodecsSupported )
  const [playerUrl, setPlayerUrl] = useState('')
  const dispatch = useDispatch()


  const handleClick = useCallback( () => {
    if( !!video.current ) {
      getSourceMediaStream()
        .then( stream => {
          if( video.current ) video.current.srcObject = stream // to prevent flow error
          return setup( { stream, scalable } ) 
        })
        .then( ({liveId, peerId}) => {
          dispatch( setLiveId( liveId ) )
          dispatch( setSender( peerId ) )
          setPlayerUrl(`${window.location.origin}/receiver/${liveId}`)
        })
    }
  }, [video, dispatch, scalable])

  return (
    <div className="SenderView">
      <div>
        <label>
          enable scalable
          <Checkbox 
            onChange={e => {
              setScalable(e.target.checked)
            }} 
            checked={isWebCodecsSupported} 
            disabled={!isWebCodecsSupported}
          />
        </label>
        <br/>
        <Button type="primary" shape="round" onClick={handleClick} danger>
          Start sender
        </Button>
      </div>
      <div>
        <MidiVisualizer source="local" onmidimessage={addInlineData} />
      </div>
      <div>
        <ul>
          <li>liveId: {liveId}</li>
          <li>peerId: {peerId}</li>
        </ul>
      </div>
      <div>
        player url: <Input type="text" value={playerUrl} readOnly/>
      </div>
      <div>
        <video ref={ e => video.current = e } style={{maxWidth: 640}} autoPlay muted />
      </div>
    </div>
  )
}
