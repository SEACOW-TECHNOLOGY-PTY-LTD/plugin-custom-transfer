import { Manager } from '@twilio/flex-ui';
import { getTo, insert } from './tools';
const manager = Manager.getInstance();

export const startCallRecording = async (callSid, task) => {
    const url = `${process.env.REACT_APP_SERVICE_BASE_URL}/start`
    const body = {
        Token: manager.store.getState().flex.session.ssoTokenPayload.token,
        callSid: callSid
    };
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: new URLSearchParams(body)
    };

    let recording;
    try {
        let response = await fetch(url, options);
        if (response.ok){
            recording = await response.json();
            console.debug(`Start call recording for call ${callSid}`, recording);
            insert('Recording Control', {
                operation: 'Start Recording',
                result: 'Success',
                errorMessage: '',
                recordingSid: recording.sid || '',
                recordingUrl: '',
                from: task.attributes.from || '',
                to: getTo(task),
                direction: task.attributes.direction || '',
                taskSid: task.taskSid || '',
                callSid: callSid || '',
                queueName: task.queueName || ''
            });
        } else {
            switch (response.status) {
                case 500:
                    throw response.statusText;
            }
        }
    } catch (error) {
        console.log(`Error start call recording for call ${callSid}`, error);
        insert('Recording Control', {
            operation: 'Start Recording',
            result: 'Failed',
            errorMessage: error || '',
            recordingSid: '',
            recordingUrl: '',
            from: task.attributes.from || '',
            to: getTo(task),
            direction: task.attributes.direction || '',
            taskSid: task.taskSid || '',
            callSid: callSid || '',
            queueName: task.queueName || ''
        });
    }

    return recording;
}

export const pauseCallRecording = (task) => {
    return new Promise((resolve, reject) => {
        const url = `${process.env.REACT_APP_SERVICE_BASE_URL}/pause`
        const body = {
            Token: manager.store.getState().flex.session.ssoTokenPayload.token,
            callSid: task.attributes.call_sid
        };
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            body: new URLSearchParams(body)
        };

        fetch(url, options)
            .then((response) => response.json())
            .then((data) => {
                insert('Recording Control', {
                    operation: 'Pause Recording',
                    result: 'Success',
                    errorMessage: '',
                    recordingSid: data.sid || '',
                    recordingUrl: '',
                    from: task.attributes.from || '',
                    to: getTo(task),
                    direction: task.attributes.direction || '',
                    taskSid: task.taskSid || '',
                    callSid: task.attributes.call_sid || '',
                    queueName: task.queueName || ''
                });
                resolve(data)
            })
            .catch((err) => {
                console.log('Failed to pause call recording', err);
                insert('Recording Control', {
                    operation: 'Pause Recording',
                    result: 'Failed',
                    errorMessage: err || '',
                    recordingSid: '',
                    recordingUrl: '',
                    from: task.attributes.from || '',
                    to: getTo(task),
                    direction: task.attributes.direction || '',
                    taskSid: task.taskSid || '',
                    callSid: task.attributes.call_sid || '',
                    queueName: task.queueName || ''
                });
                reject(err);
            });
    });
}

export const resumeCallRecording = (task) => {
    return new Promise((resolve, reject) => {
        const url = `${process.env.REACT_APP_SERVICE_BASE_URL}/resume`
        const body = {
            Token: manager.store.getState().flex.session.ssoTokenPayload.token,
            callSid: task.attributes.call_sid
        };
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            body: new URLSearchParams(body)
        };

        fetch(url, options)
            .then((response) => response.json())
            .then((data) => {
                insert('Recording Control', {
                    operation: 'Resume Recording',
                    result: 'Success',
                    errorMessage: '',
                    recordingSid: data.sid || '',
                    recordingUrl: '',
                    from: task.attributes.from || '',
                    to: getTo(task),
                    direction: task.attributes.direction || '',
                    taskSid: task.taskSid || '',
                    callSid: task.attributes.call_sid || '',
                    queueName: task.queueName || ''
                });
                resolve(data)
            })
            .catch((err) => {
                console.log('Failed to resume call recording', err);
                insert('Recording Control', {
                    operation: 'Resume Recording',
                    result: 'Failed',
                    errorMessage: err || '',
                    recordingSid: '',
                    recordingUrl: '',
                    from: task.attributes.from || '',
                    to: getTo(task),
                    direction: task.attributes.direction || '',
                    taskSid: task.taskSid || '',
                    callSid: task.attributes.call_sid || '',
                    queueName: task.queueName || ''
                });
                reject(err);
            });
    });
}

export const getCallRecording = (task) => {
    return new Promise((resolve, reject) => {
        const url = `${process.env.REACT_APP_SERVICE_BASE_URL}/list`
        const body = {
            Token: manager.store.getState().flex.session.ssoTokenPayload.token,
            callSid: task.attributes.call_sid
        };
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            body: new URLSearchParams(body)
        };

        fetch(url, options)
            .then((response) => response.json())
            .then((data) => resolve(data))
            .catch((err) => {
                console.log('Failed to fetch call recording', err);
                reject(err);
            });
    });
}

export const retryCallRecording = async (callSid, task) => {
    const url = `${process.env.REACT_APP_SERVICE_BASE_URL}/start`
    const body = {
        Token: manager.store.getState().flex.session.ssoTokenPayload.token,
        callSid: callSid
    };
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: new URLSearchParams(body)
    };

    let recording;
    try {
        let response = await fetch(url, options);
        if (response.ok){
            recording = response.json();
            console.debug(`Start call recording for call ${callSid}`, recording);
            insert('Recording Control', {
                operation: 'Retry Start Recording',
                result: 'Success',
                errorMessage: '',
                recordingSid: recording.sid || '',
                recordingUrl: '',
                from: task.attributes.from || '',
                to: getTo(task),
                direction: task.attributes.direction || '',
                taskSid: task.taskSid || '',
                callSid: callSid || '',
                queueName: task.queueName || ''
            });
        } else {
            switch (response.status) {
                case 500:
                    throw response.statusText;
            }
        }
    } catch (error) {
        console.log(`Error start call recording for call ${callSid}`, error);
        insert('Recording Control', {
            operation: 'Retry Start Recording',
            result: 'Failed',
            errorMessage: error || '',
            recordingSid: '',
            recordingUrl: '',
            from: task.attributes.from || '',
            to: getTo(task),
            direction: task.attributes.direction || '',
            taskSid: task.taskSid || '',
            callSid: callSid || '',
            queueName: task.queueName || ''
        });
    }

    return recording;
}