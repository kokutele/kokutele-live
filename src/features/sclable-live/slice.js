import { createSlice } from '@reduxjs/toolkit';

export const scalableLiveSlice = createSlice({
  name: 'scalableLive',
  initialState: {
    liveId: '',
    sender: '',
    webcodecsSupported: false,
    insertablestreamsSupported: false,
  },
  reducers: {
    setWebCodecsSupported: (state, action) => {
      state.webcodecsSupported = action.payload
    },
    setInsertableStreamsSupported: (state, action) => {
      state.insertablestreamsSupported = action.payload
    },
    setLiveId: (state, action) => {
      state.liveId = action.payload
    },
    setSender: (state, action) => {
      state.sender = action.payload
    }
  }
})

export const { setLiveId, setSender, setWebCodecsSupported, setInsertableStreamsSupported } = scalableLiveSlice.actions

export const selectWebCodecsSuppoted = state => {
  return state.scalableLive.webcodecsSupported
}

export const selectInsertableStreamsSuppoted = state => {
  return state.scalableLive.insertablestreamsSupported
}

export const selectLiveId = state => {
  return state.scalableLive.liveId
}
export const selectSender = state => {
  return state.scalableLive.sender
}

export default scalableLiveSlice.reducer