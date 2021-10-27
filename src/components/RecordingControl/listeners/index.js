import { Actions, Manager, TaskHelper } from '@twilio/flex-ui';
import { ParticipantType, ReservationEvents } from '../enums';
import states from '../states';
import { Actions as RecordingStatusActions } from '../states/RecordingState';
import { retryCallRecording, startCallRecording } from '../utils/api';
const manager = Manager.getInstance();
const reservationListeners = new Map();

export const addCallDataToTask = async (task, callSid, recording) => {
    const { attributes, conference } = task;

    const newAttributes = { ...attributes };
    let shouldUpdateTaskAttributes = false;

    if (TaskHelper.isOutboundCallTask(task)) {
        shouldUpdateTaskAttributes = true;
        newAttributes.conference = {
            sid: conference.conferenceSid
        };
        newAttributes.call_sid = callSid;
    }

    if (recording) {
        shouldUpdateTaskAttributes = true;
        const conversations = attributes.conversations || {};

        const state = manager.store.getState();
        const flexState = state && state.flex;
        const workerState = flexState && flexState.workerState;
        const accountSid = workerState && workerState.source.accountSid;

        const {
            sid: recordingSid
        } = recording;
        const twilioApiBase = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}`;
        const recordingUrl = `${twilioApiBase}/Recording/${recordingSid}`;

        const { dateUpdated } = task;

        const recordingStartTime = new Date(dateUpdated).valueOf() - 1000;

        newAttributes.conversations = {
            ...conversations,
            media: [
                {
                    url: recordingUrl,
                    type: 'VoiceRecording',
                    start_time: recordingStartTime,
                    channels: ['customer', 'others']
                }
            ]
        }
    }

    if (shouldUpdateTaskAttributes) {
        await task.setAttributes(newAttributes);
    }
}

const isTaskActive = (task) => {
    const { sid: reservationSid, taskStatus } = task;
    if (taskStatus === 'canceled') return false;
    return manager.workerClient.reservations.has(reservationSid);
}

const waitForConferenceParticipants = (task) => new Promise((resolve) => {
    const waitTimeMs = 100;

    const maxWaitTimeMs = 60000;
    let waitForConferenceInterval = setInterval(async () => {
        const { conference } = task;

        if (!isTaskActive(task)) {
            // Call Canceled
            waitForConferenceInterval = clearInterval(waitForConferenceInterval);
            return;
        }

        if (conference === undefined) return;

        const { participants } = conference;
        if (Array.isArray(participants) && participants.length < 2) return;
        const worker = participants.find(p => p.participantType === ParticipantType.worker);
        const customer = participants.find(p => p.participantType === ParticipantType.customer);

        if (!worker || !customer) return;

        waitForConferenceInterval = clearInterval(waitForConferenceInterval);

        resolve(participants);
    }, waitTimeMs);

    setTimeout(() => {
        if (waitForConferenceInterval) {
            clearInterval(waitForConferenceInterval)

            resolve([])
        }
    }, maxWaitTimeMs);
});

const addMissingCallDataIfNeeded = async (task) => {
    const { attributes } = task;
    const { conference } = attributes;

    if (TaskHelper.isOutboundCallTask(task) && !conference) {
        await addCallDataToTask(task);
    }
}

Actions.addListener('beforeCompleteTask', async (payload) => {
    addMissingCallDataIfNeeded(payload.task);
});

Actions.addListener('beforeHangupCall', async (payload) => {
    addMissingCallDataIfNeeded(payload.task)
});

export const handleAcceptedCall = async (task) => {
    const { attributes } = task;
    const { conversations } = attributes;

    // if (conversations && conversations.media) return;

    console.debug('Waiting for customer and worker to join the conference');
    const participants = await waitForConferenceParticipants(task);

    const customer = participants.find(p => p.participantType === ParticipantType.customer);

    if (!customer) return;

    const { callSid } = customer;

    const recording = await startCallRecording(callSid, task);
    if (recording) {
        await addCallDataToTask(task, callSid, recording);

        console.log('Recording status:', recording.status);
        manager.store.dispatch(RecordingStatusActions.setRecordingStatus((recording.status)));
    } else {
        manager.store.dispatch(RecordingStatusActions.setRecordingStatus(('failed')));
    }
};

const handleReservationAccepted = async (reservation) => {
    const task = TaskHelper.getTaskByTaskSid(reservation.sid);

    if (TaskHelper.isCallTask(task)) await handleAcceptedCall(task);
}

const handleReservationUpdated = (event, reservation) => {
    console.debug('Event, reservation updated', event, reservation);
    switch (event) {
        case ReservationEvents.accepted: {
            handleReservationAccepted(reservation);
            break;
        }
        case ReservationEvents.wrapup:
        case ReservationEvents.completed:
        case ReservationEvents.rejected:
        case ReservationEvents.timeout:
        case ReservationEvents.canceled:
        case ReservationEvents.rescinded: {
            stopReservationListeners(reservation);
            break;
        }
        default:
            break;
    }
};

const stopReservationListeners = (reservation) => {
    const listeners = reservationListeners.get(reservation);
    if (listeners) {
        listeners.forEach(listener => {
            reservation.removeListener(listener.event, listener.callback);
        });
        reservationListeners.delete(reservation);
    }
};

const initReservationListeners = (reservation) => {
    const trueReservation = reservation.addListener ? reservation : reservation.source;
    stopReservationListeners(trueReservation);
    const listeners = [];
    Object.values(ReservationEvents).forEach(event => {
        const callback = () => handleReservationUpdated(event, trueReservation);
        trueReservation.addListener(event, callback);
        listeners.push({ event, callback });
    });
    reservationListeners.set(trueReservation, listeners);
};

const handleNewReservation = (reservation) => {
    console.debug('new reservation', reservation);
    initReservationListeners(reservation);
};

const handleReservationCreated = (reservation) => {
    handleNewReservation(reservation);
};

manager.workerClient.on('reservationCreated', reservation => {
    console.log("resOK:")
    handleReservationCreated(reservation);
});

export const handleRetryRecording = async (task) => {
    const { attributes } = task;
    const { conversations } = attributes;

    if (conversations && conversations.media) return;

    console.debug('Waiting for customer and worker to join the conference');
    const participants = await waitForConferenceParticipants(task);

    const customer = participants.find(p => p.participantType === ParticipantType.customer);

    if (!customer) return;

    const { callSid } = customer;

    const recording = await retryCallRecording(callSid, task);
    if (recording) {
        await addCallDataToTask(task, callSid, recording);

        console.log('Recording status:', recording.status);
        manager.store.dispatch(RecordingStatusActions.setRecordingStatus((recording.status)));
    } else {
        manager.store.dispatch(RecordingStatusActions.setRecordingStatus(('failed')));
    }
};
