//@flow

import React, { useRef, useState, useEffect, useCallback } from 'react'
import { Button, Select } from 'antd'
import MidiHandler from '../../../libs/midi-handler'

const { Option } = Select

type PropTypes = {
  source: string; // `local` or `remote`
  onmidimessage: Function; // callback
}
export default function( props:PropTypes ) {
  const [ _devices, setDevices ] = useState([])
  const [ _deviceId, setDeviceId ] = useState()
  const { source, onmidimessage } = props

  const _source = useRef( source )
  const _handler = useRef()

  useEffect( () => {
    if( _source.current === 'local' ) {
      _handler.current = MidiHandler.create()
      _handler.current.getDevices()
        .then( devices => {
          const _arr = Array.from(devices.values())
          if( _arr.length > 0 ) {
            setDevices(_arr)
            setDeviceId( _arr[0].id )
          }
        }) 
    }
  }, [_source])

  const handleConnect = useCallback( () => {
    if( _handler.current ) {
      const device = _devices.find( o => o.id === _deviceId )
      console.log( device )
      if( device ) {
        device.onmidimessage = mesg => {
          onmidimessage( mesg.data )
        }
      }
    }
  }, [_devices, _deviceId, onmidimessage])

  return (
    <div className="MidiVisualizer">
      <h3>MIDI Visualizer</h3>

      { _devices.length > 0 && (
      <div>
        <Select value={ _deviceId } onChange={setDeviceId}>
          { _devices.map( ({id, name}, idx) => (
            <Option value={id} key={idx}>{name}</Option>
          ))}
        </Select><br/>
        <Button type="primary" shape="round" onClick={handleConnect}>connect</Button>
      </div>
      )}
    </div>
  )
}