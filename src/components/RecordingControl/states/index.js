import { combineReducers } from 'redux';
import { reduce as RecordingReducer } from './RecordingState';

// Register your redux store under a unique namespace
export const namespace = 'recording-control';

// Combine the reducers
export default combineReducers({
    recording: RecordingReducer
});
