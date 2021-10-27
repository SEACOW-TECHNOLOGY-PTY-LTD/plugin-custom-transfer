import React from 'react';
import { Notifications, TaskHelper, IconButton, withTaskContext } from '@twilio/flex-ui';
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import { Actions as RecordingStatusActions, } from '../../states/RecordingState';
import { pauseCallRecording, resumeCallRecording } from '../../utils/api';

const RECORDING_PAUSED = 'RecordingPaused';
const RECORDING_RESUMED = 'RecordingResumed';
const PAUSED_FAILED = 'PausedFailed';
const RESUMED_FAILED = 'ResumedFailed';

const pauseState = {
    icon: 'Voice',
    color: 'yellow',
    label: 'Resume'
};

const recordingState = {
    icon: 'VoiceBold',
    color: 'red',
    label: 'Pause'
};
class PauseRecordingButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = recordingState;
    }

    handleClick = async () => {
        if (this.props.status == 'paused') {
            try {
                const recording = await resumeCallRecording(this.props.task);
                this.setState(recordingState);
                console.log("Resume Recording", recording);
                //Update app state in Redux store
                this.props.setRecordingStatus(recording.status);
                Notifications.showNotification(RECORDING_RESUMED);
            } catch (err) {
                console.log('Failed to resume recording', err);
                Notifications.showNotification(RESUMED_FAILED);
            }
        } else {
            try { 
                const recording = await pauseCallRecording(this.props.task);
                this.setState(pauseState);
                console.log("Pause Recording", recording);
                //Update app state in Redux store
                this.props.setRecordingStatus(recording.status);
                Notifications.showNotification(RECORDING_PAUSED);
            } catch (err) {
                console.log('Failed to pause recording', err);
                Notifications.showNotification(PAUSED_FAILED);
            }
        }
    }

    render() {
        const isLiveCall = TaskHelper.isLiveCall(this.props.task);
        return (isLiveCall &&
            <div id="recordControlsStatusBar" key="recordControlsStatusBar">
                <div id="recordControlsStatus" style={{ fontSize: "14px" }}>
                    Status:{" "}
                    {this.props.status == 'paused' ? 'Paused' :
                        this.props.status == 'completed' ? 'Completed' :
                            this.props.status == 'failed' ? 'Failed To Start' :
                                this.props.status == 'initial' ? 'Initializing' : 'Recording'}
                </div>

                <div id="recordControlsButtons">
                    {this.props.status === "in-progress" && (
                        <input
                            type="button"
                            value="Pause"
                            onClick={() => this.handleClick()}
                            style={{
                                backgroundColor: "#4CAF50",
                                border: "none",
                                color: "white",
                                padding: "12px 16px",
                                textAlign: "center",
                                textDecoration: "none",
                                display: "inline-block",
                                fontSize: "14px",
                                margin: "4px 2px",
                                cursor: "pointer",
                                WebkitTransitionDuration: "0.4s",
                                transitionDuration: "0.4s",
                                boxShadow:
                                    "0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19)",
                            }}
                        />
                    )}
                    {this.props.status === "paused" && (
                        <input
                            type="button"
                            value="Resume"
                            onClick={() => this.handleClick()}
                            style={{
                                backgroundColor: "#4CAF50",
                                border: "none",
                                color: "white",
                                padding: "12px 16px",
                                textAlign: "center",
                                textDecoration: "none",
                                display: "inline-block",
                                fontSize: "14px",
                                margin: "4px 2px",
                                cursor: "pointer",
                                WebkitTransitionDuration: "0.4s",
                                transitionDuration: "0.4s",
                                boxShadow:
                                    "0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19)",
                            }}
                        />
                    )}
                </div>
            </div>
        );
    }
}
//recording object contains status
const mapStateToProps = state => {
    return {
        status: state['recording-control']?.recording?.status
    };
}
const mapDispatchToProps = (dispatch) => ({
    setRecordingStatus: bindActionCreators(RecordingStatusActions.setRecordingStatus, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(withTaskContext(PauseRecordingButton));
