import * as React from 'react'
import Url from 'url'
import Axios from 'axios'
import ConferenceService from '../../helpers/ConferenceService'

import { templates, withTaskContext } from '@twilio/flex-ui'

import DirectoryItem from './DirectoryItem'
import {
  TabContainer, InputContainer, StyledInput, ItemContainer,
} from './CustomDirectoryComponents'
import { post } from '../../utils/api'

class CustomDirectory extends React.Component {
  state = {
    searchTerm: '',
  }

  /**
   * Builtin React Component Method that gets run whenever this component
   * updates. We're using it here to ensure that our directory updates
   * whenever the directory is opened
   */
  componentDidMount () {
    // Every time this component mounts, pull the team directory from Twilio
    this.getDirectoryEntries()
  }

  /**
   * Pulls the list of all workers on this worker's team, then updates this
   * component's State with the list
   */
  async getDirectoryEntries () {
    // Build out the config blocks for Axios
    post('directory/get-contact-list', {
      value: '',
    }).then(response => {
      this.setState({
        directoryEntries: response,
      })
    }).catch(error => {
      console.log(error)
    })
  }

  /**
   * Returns a list of workers from this component's State, filtered through
   * the entered search term and the `skipWorkerIf` funciton from props
   */
  filteredDirectory () {
    if (!this.state.directoryEntries) {
      return []
    }
    const { searchTerm } = this.state
    return this.state.directoryEntries.filter(worker => {
      if (!searchTerm) {
        return true
      }
      return worker.name.toLowerCase().includes(searchTerm.toLowerCase())
    }).sort((a, b) => {
      let a_name = a.fullName
      let b_name = b.fullName
      return (a_name > b_name) ? 1 : -1
    })
  }

  /**
   * Listener function for changes in the Search field. Updates this component's
   * State with the input search term
   *
   * @param {Event} e - the change event
   */
  onSearchInputChange (e) {
    this.setState({ searchTerm: e.target.value })
  }

  /**
   * Listener function for Transfer Button clicks. Handles both warm and cold
   * transfers via the `options` parameter. For more, see:
   * https://www.twilio.com/docs/flex/ui/actions#agent
   * https://twilio.github.io/twilio-taskrouter.js/Task.html#.TransferOptions
   *
   * @param {object} worker - The worker object to transfer to
   * @param {object} options - A dictionary object send to the "TransferTask" Action as defined by the TaskRouter SDK
   */

  addConferenceParticipant = async (worker) => {
    const to = worker.phone
    const { from, task, task: { taskSid } } = this.props
    const conference = task && (task.conference || {})
    const { conferenceSid } = conference

    // Adding entered number to the conference
    console.log(`Adding ${to} to conference`)
    let participantCallSid
    try {
      participantCallSid = await ConferenceService.addParticipant(taskSid,
        '+61287902720', to)
      ConferenceService.addConnectingParticipant(conferenceSid,
        participantCallSid, 'unknown')
    } catch (error) {
      console.error('Error adding conference participant:', error)
    }
    this.setState({ conferenceTo: '' })
  }

  onTransferClick (worker, options) {
    switch (options.mode) {
      case 'WARM':
        this.addConferenceParticipant(worker)
        break

      case 'COLD':

        break
    }
  }

  /**
   * Render function
   */
  render () {
    if (!this.state.directoryEntries) {
      return <div/>
    }
    return (
      <TabContainer key="custom-directory-container">
        <InputContainer key="custom-directory-input-container">
          <StyledInput
            key="custom-directory-input-field"
            onChange={this.onSearchInputChange}
            placeholder={templates.WorkerDirectorySearchPlaceholder()}
          />
        </InputContainer>
        <ItemContainer
          key="custom-directory-item-container"
          className="Twilio-WorkerDirectory-Workers"
          vertical
        >
          {this.state.directoryEntries.map(item => {
            return (
              <DirectoryItem
                item={item}
                key={item.sid}
                onTransferClick={this.onTransferClick.bind(this)}
              />
            )
          })}
        </ItemContainer>
      </TabContainer>
    )
  }
}

export default withTaskContext(CustomDirectory)
