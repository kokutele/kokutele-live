// @flow

import React from 'react'
import { useSelector } from 'react-redux'
import { 
  selectWebCodecsSuppoted, 
  selectInsertableStreamsSuppoted 
} from '../slice'

export default function() {
  const isWebCodecsSupported: boolean = useSelector( selectWebCodecsSuppoted )
  const isInsertableStreamsSupported: boolean = useSelector( selectInsertableStreamsSuppoted )
  return(
    <div className="CheckSupported">
      <ul>
        <li>WebCodecs: { isWebCodecsSupported ? 'supported': 'not supported' }</li>
        <li>InsertableStreams: { isInsertableStreamsSupported ? 'supported': 'not supported' }</li>
      </ul>
    </div>
  )
}