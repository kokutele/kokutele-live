// @flow
import { createSlice } from '@reduxjs/toolkit';

// type MidiObj = {
//   code: number,
//   strength: number
//}
// type initialStateType = {
//   midiData: Array<MidiObj>; // <code_num, strength_num>
// }

export const visualizerSlice = createSlice({
  name: 'visualizer',
  initialState: {
    midiData: [] // @type Array<MidiObj>
  },
  reducers: {
    addMidiData: (state, action) => {
      // `arr` is [ 144, 60, 40 ] or [128, 62, 64] or something like this.
      //   `144` : noteOn
      //   `128` : noteOff
      //   `60`  : code (it may vary)
      //   `40` or `64` : strength (it may vary)
      //
      const arr = action.payload

      for ( let offset = 0; offset < arr.length; offset += 3) {
        const [ type, code, strength] = arr.slice( offset, 3 )

        if( type === 144 ) {
          state.midiData.push( {code, strength})
        } else if ( type === 128 ) {
          state.midiData = state.midiData.filter( o => o.code !== code )
        }
      }
    }
  }
})

export const { addMidiData } = visualizerSlice.actions

export const selectMidiData = (state: Object) => {
  return state.visualizer.midiData
}

export const selectMidiDataLength = (state: Object) => {
  return state.visualizer.midiData.length
}



export default visualizerSlice.reducer