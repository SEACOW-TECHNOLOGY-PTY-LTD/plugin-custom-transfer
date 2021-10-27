import { Manager } from "@twilio/flex-ui";

export const insert = (plugin, params) => {
    const {
        operation, 
        result, 
        errorMessage = '', 
        recordingSid = '', 
        recordingUrl = '',
        from = '',
        to = '',
        direction = '',
        taskSid = '',
        callSid = '',
        queueName = ''
    } = params;
    const mgr = Manager.getInstance();
    const worker = mgr.workerClient;
    const workerAttributes = mgr.workerClient.attributes;

    const url = `${process.env.REACT_APP_PLUGIN_LOGS_BASE_URL}/logs/plugin/insert`

    const myHeaders = new Headers();

    myHeaders.append('x-api-key', 'juNKfgV5M32y8PzeqrbmTffJMhEKpXyC');
    myHeaders.append('Content-Type', 'application/json');

    return fetch(url, {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({
            MonitorId: 1,
            Plugin: plugin,
            Result: result,
            ErrorMessage: errorMessage,
            FullName: workerAttributes.full_name,
            Email: workerAttributes.email,
            Roles: workerAttributes.roles,
            WorkerSid: worker.sid,
            Operation: operation,
            Timestamp: (Math.round((new Date()).getTime() / 1000)).toString(),
            TimestampMs: ((new Date()).getTime()).toString(),
            RecordingSid: recordingSid,
            RecordingUrl: recordingUrl,
            From: from,
            To: to,
            Direction: direction,
            TaskSid: taskSid,
            CallSid: callSid,
            QueueName: queueName
        }),
    })
        .catch((err) => {
            return `Error: ${err}`;
        });
}

export const getTo = (task) => {
    let to;
    try {
        to = task.attributes.direction === 'inbound' ? task.attributes.to ?  task.attributes.to : '' : task.attributes.outbound_to ? task.attributes.outbound_to : '';
        to = to.includes('sip') ? to.replace('sip:', '').split('@')[0] : to
    } catch (err) {
        to = ''
    }
    return to
}