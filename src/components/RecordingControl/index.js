import {Notifications, NotificationType} from "@twilio/flex-ui";
import { Actions as RecordingStatusActions } from './states/RecordingState';
import PauseRecordingButton from './components/RecordingButton/PauseRecordingButton';
import { insert, getTo } from './utils/tools';
import reducers, { namespace } from './states';
import './listeners';

const registerReducers = (manager) => {
    if (!manager.store.addReducer) {
        // eslint: disable-next-line
        console.error(`You need FlexUI > 1.9.0 to use built-in redux; you are currently on ${VERSION}`);
        return;
    }

    manager.store.addReducer(namespace, reducers);
}

export const loadRecordingControlInterface = (flex, manager) => {

    // Constants
    const RECORDING_PAUSED = 'RecordingPaused';
    const RECORDING_RESUMED = 'RecordingResumed';
    const PAUSED_FAILED = 'PausedFailed';
    const RESUMED_FAILED = 'ResumedFailed';

    registerReducers(manager);

    // Notification Message
    manager.strings[RECORDING_PAUSED] = (
        'Call recording has been paused, please remember to resume call recording later'
    );

    manager.strings[RECORDING_RESUMED] = (
        'Call recording has been resumed, please remember to pause call recording when collecting privacy information'
    );

    manager.strings[PAUSED_FAILED] = (
        'Failed to pause call recording, please try again later'
    );

    manager.strings[RESUMED_FAILED] = (
        'Failed to resume call recording, please try again later'
    );

    // Register Notification
    Notifications.registerNotification({
        id: RECORDING_PAUSED,
        closeButton: true,
        content: RECORDING_PAUSED,
        timeout: 10000,
        type: NotificationType.warning,
    });

    Notifications.registerNotification({
        id: RECORDING_RESUMED,
        closeButton: true,
        content: RECORDING_RESUMED,
        timeout: 10000,
        type: NotificationType.success,
    });

    Notifications.registerNotification({
        id: PAUSED_FAILED,
        closeButton: true,
        content: PAUSED_FAILED,
        timeout: 10000,
        type: NotificationType.error,
    });

    Notifications.registerNotification({
        id: RESUMED_FAILED,
        closeButton: true,
        content: RESUMED_FAILED,
        timeout: 10000,
        type: NotificationType.error,
    });

    flex.CallCanvasActions.Content.add(
        <PauseRecordingButton icon="Eye" key="recording_button"/>
    );

    // flex.CallCanvas.Content.add(
    //   <RecordingStatusPanel key="recording-status-panel"> </RecordingStatusPanel>, {
    //   sortOrder: -1
    // });

    flex.Actions.addListener("beforeAcceptTask", async (payload) => {
        manager.store.dispatch(RecordingStatusActions.setRecordingStatus('initial'));
    });

    flex.Actions.addListener("afterCompleteTask", async (payload) => {
        manager.store.dispatch(RecordingStatusActions.setRecordingStatus('initial'));
    });

    flex.Actions.addListener("afterHangupCall", async (payload) => {
        console.log('afterHangupCall:', payload)
        // const callSid = payload.task.attributes.call_sid;
        const taskChannelUniqueName = payload.task.taskChannelUniqueName;
        // const direction = payload.task.attributes.direction;
        // const taskStatus = payload.task.taskStatus;
        // const conferenceSid = payload.task.attributes.conference.sid;

        // console.log("heb:", taskChannelUniqueName, direction, taskStatus)
        if (taskChannelUniqueName != 'voice') {
            return
        }

        // async function CheckLeave(conferenceSid, callSid) {
        //     const url = `${process.env.REACT_APP_SERVICE_BASE_URL}/leave`
        //     const body = {
        //         Token: manager.store.getState().flex.session.ssoTokenPayload.token,
        //         conferenceSid,
        //         callSid
        //     };
        //     const options = {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        //         },
        //         body: new URLSearchParams(body)
        //     };
        //
        //     return new Promise(async (resolve, reject) => {
        //         const response = await fetch(url, options);
        //         if (response.ok) {
        //             const data = await response.json();
        //             resolve(data)
        //
        //             console.log("rejected stop recording")
        //             insert('Recording Control', {
        //                 operation: 'Stop Recording',
        //                 result: 'Success',
        //                 errorMessage: '',
        //                 recordingSid: '',
        //                 recordingUrl: '',
        //                 from: payload.task.attributes.from || '',
        //                 to: getTo(payload.task),
        //                 direction: payload.task.attributes.direction || '',
        //                 taskSid: payload.task.taskSid || '',
        //                 callSid: callSid || '',
        //                 queueName: payload.task.queueName || ''
        //             });
        //         } else {
        //             reject()
        //         }
        //     })
        // }

        // async function getData(callSid) {
        //     const url = `${process.env.REACT_APP_SERVICE_BASE_URL}/fetch`
        //     const body = {
        //         Token: manager.store.getState().flex.session.ssoTokenPayload.token,
        //         callSid
        //     };
        //     const options = {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        //         },
        //         body: new URLSearchParams(body)
        //     };
        //
        //     return new Promise(async (resolve, reject) => {
        //         const response = await fetch(url, options);
        //         if (response.ok) {
        //             const data = await response.json();
        //             resolve(data)
        //         } else {
        //             reject()
        //         }
        //     })
        // }
        //
        // await CheckLeave(conferenceSid, callSid);
    });
}