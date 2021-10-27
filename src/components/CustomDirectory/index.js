import React from 'react'
import CustomDirectory from './CustomDirectory'

export const loadCustomDirectoryInterface = (flex, manager) => {
  const PluginConfig = {
    runtimeDomain: process.env.REACT_APP_SERVICE_TRANSFER_BASE_URL,
  }

  flex.WorkerDirectory.Tabs.Content.add(
    <flex.Tab
      key="custom-directory"
      label="Directory"
    >
      <CustomDirectory
        runtimeDomain={PluginConfig.runtimeDomain}
        getToken={() => manager.store.getState().flex.session.ssoTokenPayload.token}
        teamLeadSid={manager.workerClient.attributes.team_lead_sid ||
        manager.workerClient.sid}
        skipWorkerIf={(worker) => worker.sid === manager.workerClient.sid}
        invokeTransfer={(params) => {
          flex.Actions.invokeAction('TransferTask', params)
          flex.Actions.invokeAction('HideDirectory')
        }}
      />
    </flex.Tab>
    , {
      sortOrder: -1,
    })
}