export const loadUpdateDidInterface = (flex, manager) => {
    const Name = styled('div')
        `
        font-size: 14px;
        font-weight: bold;
        margin-top: 10px;
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      `

    flex.Actions.addListener('beforeStartOutboundCall', (payload) => {
        payload.taskAttributes = payload.taskAttributes || {}
        payload.taskAttributes.name = payload.destination
        if (payload.taskAttributes.name.includes('sip:')) {
            payload.taskAttributes.name = payload.taskAttributes.name.replace(
                'sip:', '').split('@')[0]
        }
    })

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
                    '@sbc.vlogic.com.au')
                payload.destination = 'sip:' + payload.destination +
                    '@sbc.vlogic.com.au'
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