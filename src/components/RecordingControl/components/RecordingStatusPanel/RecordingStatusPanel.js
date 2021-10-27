import React from 'react';
import { connect } from "react-redux";
import { Manager, withTheme, withTaskContext } from '@twilio/flex-ui';
import Button from '@material-ui/core/Button';
import styled from '@emotion/styled';
import { handleRetryRecording } from '../../listeners';

const Status = styled('div')`
  font-size: 14px;
  font-weight: bold;
  margin-top: 10px;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  align-items: center;
  text-align: center;
`;
class RecordingStatusPanel extends React.Component {
  render() {
    return (
      <Status>
        Recording Status: {
        this.props.status == 'paused' ? 'Paused' : 
        this.props.status == 'in-progress' ? 'Recording' : 
        this.props.status == 'completed' ? 'Completed' : 
        this.props.status == 'failed' && ( this.props.task.taskStatus != 'wrapping' &&  this.props.task.taskStatus != 'completed') ? 'Failed To Start' : 
        this.props.status == 'failed' && ( this.props.task.taskStatus == 'wrapping' ||  this.props.task.taskStatus == 'completed') ? 'Not Start' : 
        this.props.status == 'initial' ? 'Initializing' : 
        this.props.status != undefined ? 'Recording' : 
        'Network Issue' } 
        {
          this.props.status == 'failed' && ( this.props.task.taskStatus != 'wrapping' &&  this.props.task.taskStatus != 'completed') && (
            <Button className='ml-2' size="small" variant="contained" color="primary" onClick={() => {
              handleRetryRecording(this.props.task)
            }}>Retry</Button>
          )
        }
      </Status>
    );
  }
}

const mapStateToProps = state => {
  return {
    status: state['recording-control']?.recording?.status
  };
}

export default connect(mapStateToProps)(withTheme(withTaskContext(RecordingStatusPanel)));