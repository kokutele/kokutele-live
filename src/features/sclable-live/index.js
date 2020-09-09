//@flow
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { 
  Button,
  Col, 
  Checkbox,
  Input,
  Row, 
  Typography 
} from 'antd'

import { getSourceMediaStream } from '../../libs/stream-operator'
import { setup }   from '../../libs/live-sender'
import LiveReceiver from '../../libs/live-receiver'
import {
  setLiveId,
  setSender,
  selectLiveId,
  selectSender,
} from './slice'
import { useSelector, useDispatch } from 'react-redux'

import { 
  checkWebCodecsSupported,
  checkInsertableStreamsSupported
} from '../../libs/utils'

const { Title } = Typography

type videoTypes = {
  current: ?HTMLVideoElement
}
type streamTypes = {
  current: ?MediaStream
}
type ReceiverViewPropsTypes = {
  liveId: string;
}

const CheckSupported = () => {
  const isWebCodecsSupported = checkWebCodecsSupported()
  const isInsertableStreamsSupported = checkInsertableStreamsSupported()
  return(
    <div className="CheckSupported">
      <ul>
        <li>WebCodecs: { isWebCodecsSupported ? 'supported': 'not supported' }</li>
        <li>InsertableStreams: { isInsertableStreamsSupported ? 'supported': 'not supported' }</li>
      </ul>
    </div>
  )
}

const SenderView = () => {
  const liveId:string = useSelector( selectLiveId )
  const peerId:string = useSelector( selectSender )
  const video:videoTypes = useRef()
  const [scalable, setScalable] = useState(true)
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
          setPlayerUrl(`${window.location.origin}/?liveId=${liveId}`)
        })
    }
  }, [video, dispatch, scalable])

  return (
    <div className="SenderView">
      <div>
        <label>
          enable scalable
          <Checkbox onChange={e => {
            console.log( e.target.checked)
            setScalable(e.target.checked)
          }} checked={scalable} />
        </label>
        <br/>
        <Button type="primary" shape="round" onClick={handleClick} danger>
          Start sender
        </Button>
      </div>
      <div>
        <video ref={ e => video.current = e } style={{width: "100%"}} autoPlay muted />
      </div>
      <div>
        liveId: {liveId} <br/>
        peerId: {peerId}
      </div>
      <div>
        player url: {playerUrl}
      </div>
    </div>
  )
}

const ReceiverView = (props:ReceiverViewPropsTypes) => {
  const [peerId:string, setPeerId:Function] = useState('')
  const [ liveId, setLiveId ] = useState(props.liveId)
  const video:videoTypes = useRef()
  const stream:streamTypes = useRef( new MediaStream() )
  const liveIdInput = useRef()

  useEffect( () => {
    if(video.current && stream.current ) {
      video.current.srcObject = stream.current
    }
  }, [video, stream])

  const handleClick = useCallback( ():void => {
    if( !!liveId ) {
      LiveReceiver.create({liveId}) 
        .then( receiver => {
          setPeerId( receiver.peerId )
          receiver.on('track', t => {
            if( stream.current && stream.current.addTrack ) {
              stream.current.addTrack( t )
            }
          })
          receiver.start()
        })
    }
  }, [liveId])

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
        peerId: {peerId}
      </div>
      <div>
        <video ref={ e => video.current = e } style={{width: "100%"}} autoPlay/>
      </div>
    </div>
  )
}



export default function ScalableLive() {
  const queryString = window.location.search
  const params:any = [...new URLSearchParams(queryString).entries()].reduce((obj, e) => ({...obj, [e[0]]: e[1]}), {});
  let liveId = ''
  if( (typeof params === "object") && (typeof params.liveId === "string") ) {
    liveId = params.liveId
  }

  return (
    <div className="ScalableLive">
      <Title level={2}>ScalableLive</Title>
      <CheckSupported />
      <Row gutter={16}>
        { !liveId ? (
          <Col span={24}>
            <SenderView />
          </Col>
        ):(
          <Col span={24}>
            <ReceiverView liveId={liveId} />
          </Col>
        )}
      </Row>
    </div>
  )
}