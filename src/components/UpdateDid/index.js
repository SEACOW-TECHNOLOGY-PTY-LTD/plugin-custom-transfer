import AgentNumber from "./AgentNumber/AgentNumber";

export const loadUpdateDidInterface = (flex, manager) => {
    flex.Actions.addListener('beforeStartOutboundCall', (payload) => {
        payload.taskAttributes = payload.taskAttributes || {}
        payload.taskAttributes.name = payload.destination
        if (payload.taskAttributes.name.includes('sip:')) {
            payload.taskAttributes.name = payload.taskAttributes.name.replace(
                'sip:', '').split('@')[0]
        }
    })

    flex.MainHeader.Content.add(<AgentNumber
            key='navbar-agent-number'
            phoneNumber={ manager.workerClient.attributes.phone }/>,{
            sortOrder:-1,
            align:'end'
        }
    )

    flex.Dialpad.Content.add(<AgentNumber
        key='dailpad-agent-number'
        phoneNumber={ manager.workerClient.attributes.phone }/>
    )

    manager.strings.TaskLineOutboundCallHeader = '{{task.attributes.name}}'

    flex.Actions.replaceAction('StartOutboundCall',
        async (payload, original) => {
            let mapping

            await fetch('https://update-did-1455-dev.twil.io/query', {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: JSON.stringify({
                    QueueSid: payload.queueSid,
                    phone: manager.workerClient.attributes.phone,
                }),
            }).then(response => response.json()).then(data => mapping = data)

            if (payload.destination.includes('+61')) {
                // check if calling Queue is SIP
                const destination = payload.destination
                // sip:{phone number}@img-aiahealth.twilio.colouredlines.net.au;edge=sydney
                console.log('number to call: ', 'sip:' + payload.destination +
                    '@img-aiahealth-staging.twilio.colouredlines.net.au;edge=sydney')
                payload.destination = 'sip:' + payload.destination +
                    '@img-aiahealth-staging.twilio.colouredlines.net.au;edge=sydney'
                payload.callerId = mapping.callerId

                if (payload.callerId) {
                    // Change the Call Canvas Phone Number Format
                    flex.DefaultTaskChannels.Call.templates.TaskListItem.firstLine = destination
                    flex.DefaultTaskChannels.Call.templates.TaskCanvasHeader.title = destination

                    flex.DefaultTaskChannels.Call.templates.ConnectingOutboundCallCanvas.firstLine = destination

                    console.warn('updated outbound call to: ', payload)
                    original(payload)
                }
            }
        })
}