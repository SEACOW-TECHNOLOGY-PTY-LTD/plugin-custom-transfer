import { ConferenceParticipant, Manager } from '@twilio/flex-ui'
import { post } from '../utils/api'

class ConferenceService {

  manager = Manager.getInstance()

  _toggleParticipantHold = (conference, participantSid, hold) => {
    return new Promise((resolve, reject) => {
      post('external-transfer/hold-conference-participant', {
        conference,
        participant: participantSid,
        hold,
      }).then(response => {
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  }

  setEndConferenceOnExit = (
    conference, participantSid, endConferenceOnExit) => {
    return new Promise((resolve, reject) => {
      post('external-transfer/update-conference-participant', {
        conference,
        participant: participantSid,
        endConferenceOnExit,
      }).then(response => {
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  }

  addParticipant = (taskSid, from, to) => {
    return new Promise((resolve, reject) => {
      post('external-transfer/add-conference-participant', {
        taskSid,
        from,
        to,
      }).then(response => {
        resolve(response.callSid)
      }).catch(error => {
        reject(error)
      })
    })
  }

  addConnectingParticipant = (conferenceSid, callSid, participantType) => {
    const flexState = this.manager.store.getState().flex
    const dispatch = this.manager.store.dispatch

    const conferenceStates = flexState.conferences.states
    const conferences = new Set()

    conferenceStates.forEach(conference => {
      const currentConference = conference.source
      if (currentConference.conferenceSid !== conferenceSid) {
        conferences.add(currentConference)
      } else {
        const participants = currentConference.participants
        const fakeSource = {
          connecting: true,
          participant_type: participantType,
          status: 'joined',
        }
        const fakeParticipant = new ConferenceParticipant(fakeSource, callSid)
        participants.push(fakeParticipant)
        conferences.add(conference.source)
      }
    })
    dispatch({ type: 'CONFERENCE_MULTIPLE_UPDATE', payload: { conferences } })
  }

  holdParticipant = (conference, participantSid) => {
    return this._toggleParticipantHold(conference, participantSid, true)
  }

  unholdParticipant = (conference, participantSid) => {
    return this._toggleParticipantHold(conference, participantSid, false)
  }

  removeParticipant = (conference, participantSid) => {
    return new Promise((resolve, reject) => {
      post('external-transfer/remove-conference-participant', {
        conference,
        participant: participantSid,
      }).then(response => {
        resolve(response.callSid)
      }).catch(error => {
        reject(error)
      })
    })
  }
}

const conferenceService = new ConferenceService()

export default conferenceService