//@flow

import React, { useRef, useState, useEffect, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { Button, Select } from 'antd'
import MidiHandler from '../../../libs/midi-handler'
import Visualizer from '../../visualizer'

import { addMidiData } from '../../visualizer/slice'

const { Option } = Select

type PropTypes = {
  stream: ?MediaStream;
  source: string; // `local` or `remote`
  onmidimessage: Function; // callback
}
export default function( props:PropTypes ) {
  const [ _devices, setDevices ] = useState([])
  const [ _deviceId, setDeviceId ] = useState()
  const { source, onmidimessage, stream } = props

  const _source = useRef( source )
  const _handler = useRef()
  const _map = useRef(new Map())

  const dispatch = useDispatch()

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
          const arr = Array.from( mesg.data )
          for( let i = 0; i < arr.length; i+=3 ) {
            const [ note, code, strength ] = arr.slice(i, 3)
            if( note === 144 ) {
              _map.current.set( code, strength )
            } else if ( note === 128 ) {
              _map.current.delete( code )
            }
          }
          dispatch( addMidiData( Array.from(_map.current.entries()).flat() ) )
          onmidimessage( mesg.data )
        }
      }
    }
  }, [_devices, _deviceId, onmidimessage, dispatch])

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
        { stream && (
          <div style={{width: 640}}>
            <Visualizer stream={stream} />
          </div>
        )}
      </div>
      )}
    </div>
  )
}