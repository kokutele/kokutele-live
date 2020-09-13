import { configureStore } from '@reduxjs/toolkit';
//import counterReducer from '../features/counter/counterSlice';
import scalableLiveReducer from '../features/sclable-live/slice';
import visualizerReducer from '../features/visualizer/slice'

export default configureStore({
  reducer: {
    //counter: counterReducer,
    scalableLive: scalableLiveReducer,
    visualizer: visualizerReducer,
  },
});
