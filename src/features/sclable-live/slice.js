import { createSlice } from '@reduxjs/toolkit';

export const scalableLiveSlice = createSlice({
  name: 'scalableLive',
  initialState: {
    liveId: '',
    sender: ''
  },
  reducers: {
    setLiveId: (state, action) => {
      state.liveId = action.payload
    },
    setSender: (state, action) => {
      state.sender = action.payload
    }
  }
})

export const { setLiveId, setSender } = scalableLiveSlice.actions

export const selectLiveId = state => {
  return state.scalableLive.liveId
}
export const selectSender = state => {
  return state.scalableLive.sender
}

export default scalableLiveSlice.reducer