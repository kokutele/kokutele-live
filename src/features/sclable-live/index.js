//@flow
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { 
  Button,
  Col, 
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

const { Title } = Typography

type videoTypes = {
  current: ?HTMLVideoElement
}
type streamTypes = {
  current: ?MediaStream
}

const SenderView = () => {
  const liveId:string = useSelector( selectLiveId )
  const peerId:string = useSelector( selectSender )
  const video:videoTypes = useRef()
  const dispatch = useDispatch()

  useEffect( ():void => {
    if( !!video.current ) {
      getSourceMediaStream()
        .then( stream => {
          if( video.current ) video.current.srcObject = stream // to prevent flow error
          return setup( { stream } ) 
        })
        .then( ({liveId, peerId}) => {
          dispatch( setLiveId( liveId ) )
          dispatch( setSender( peerId ) )
        })
    }
  }, [video, dispatch])

  return (
    <div className="SenderView">
      <div>
        <video ref={ e => video.current = e } style={{width: "100%"}} autoPlay muted />
      </div>
      <div>
        liveId: {liveId} <br/>
        peerId: {peerId}
      </div>
    </div>
  )
}

const ReceiverView = () => {
  const liveId:string = useSelector( selectLiveId )
  const [peerId:string, setPeerId:Function] = useState('')
  const video:videoTypes = useRef()
  const stream:streamTypes = useRef( new MediaStream() )

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
            stream.current.addTrack( t )
          })
          receiver.start()
        })
    }
  }, [liveId])

  return (
    <div className="ReceiverView">
      <Button type="primary" shape="round" onClick={handleClick}>start</Button>
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
  return (
    <div className="ScalableLive">
      <Title level={2}>ScalableLive</Title>
      <Row gutter={16}>
        <Col span={12}>
          <SenderView />
        </Col>
        <Col span={12}>
          <ReceiverView />
        </Col>
      </Row>
    </div>
  )
}