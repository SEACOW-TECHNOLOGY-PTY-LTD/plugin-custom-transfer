import * as React from 'react'
import { connect } from 'react-redux'
import styled from '@emotion/styled'
import { Manager, withTheme } from '@twilio/flex-ui'
import { post } from '../../utils/api'

const Name = styled('div')`
  font-size: 14px;
  font-weight: bold;
  margin-top: 10px;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const NameListItem = styled('div')`
  font-size: 12px;
  font-weight: bold;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`

class ParticipantName extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
    }
  }

  componentDidMount () {
    const { participant, task } = this.props
    console.warn(task.attributes)

    if (participant.participantType === 'customer') {
      this.setState(
        { name: task.attributes.outbound_to || task.attributes.name })
      return
    }

    if (participant.participantType === 'unknown') {
      post('external-transfer/get-call-properties', {
        callSid: participant.callSid,
      }).then(response => {
        if (response) {
          const name = (response && response.to) || 'unknown'
          this.setState({ name })
        }
      })
    } else {
      this.setState(
        { name: participant.worker ? participant.worker.fullName : 'unknown' })
    }
  }

  render () {
    return this.props.listMode
      ? (
        <NameListItem className="ParticipantCanvas-Name">
          {this.state.name && this.state.name.includes('sip') ? this.state.name.split('@')[0].split(':')[1] : this.state.name}
        </NameListItem>
      ) : (
        <Name className="ParticipantCanvas-Name">
          {this.state.name && this.state.name.includes('sip') ? this.state.name.split('@')[0].split(':')[1] : this.state.name}
        </Name>
      )
  }
}

const mapStateToProps = state => {
  const { serviceBaseUrl } = state.flex.config

  return {
    serviceBaseUrl,
  }
}

export default connect(mapStateToProps)(withTheme(ParticipantName))
