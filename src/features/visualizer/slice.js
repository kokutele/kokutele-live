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
      // `arr` is [ 60, 40 ] or [ 62, 64 ] or something like this.
      //   `60` or `62` : code (it may vary)
      //   `40` or `64` : strength (it may vary)
      //
      const arr = action.payload

      state.midiData.length = 0
      for ( let offset = 0; offset < arr.length; offset += 2) {
        const [ code, strength ] = arr.slice( offset, offset + 2 )
        state.midiData.push( {code, strength} )
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