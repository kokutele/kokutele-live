//@flow
import React from 'react'
import { useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
import { 
  Typography 
} from 'antd'

import SenderView from './sender-view'
import ReceiverView from './receiver-view'

import CheckSupported from './components/check-supported'

import {
  setWebCodecsSupported,
  setInsertableStreamsSupported,
} from './slice'

import { 
  checkWebCodecsSupported,
  checkInsertableStreamsSupported
} from '../../libs/utils'

const { Title } = Typography


type PropTypes = {
  mode: string; // `sender` or `receiver`
}
export default function ScalableLive( props:PropTypes ) {
  const { mode } = props
  const { liveId } = useParams()
  const dispatch = useDispatch()

  dispatch( setWebCodecsSupported( checkWebCodecsSupported()) )
  dispatch( setInsertableStreamsSupported( checkInsertableStreamsSupported()) )

  return (
    <div className="ScalableLive">
      <Title level={2}>ScalableLive</Title>
      <CheckSupported />
      { mode==="sender" ? (
        <SenderView />
      ):(
        <ReceiverView liveId={liveId} />
      ) }
    </div>
  )
}