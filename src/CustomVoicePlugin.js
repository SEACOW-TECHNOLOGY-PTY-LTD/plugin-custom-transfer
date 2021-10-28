import { FlexPlugin } from 'flex-plugin'

import registerCustomActions from './customActions'
import { loadExternalTransferInterface } from './components/ExternalTransfer'
import { loadInternalCallInterface } from './components/InternalCall'
import { loadCustomDirectoryInterface } from './components/CustomDirectory'
import {loadUpdateDidInterface} from "./components/UpdateDid";
import {loadPlayAnnouncementInterface} from "./components/PlayAnnouncement";
import React from "react";
import {loadRecordingControlInterface} from "./components/RecordingControl";

const PLUGIN_NAME = 'CustomVoicePlugin'

export default class CustomVoicePlugin extends FlexPlugin {
  constructor () {
    super(PLUGIN_NAME)
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  async init (flex, manager) {
    loadExternalTransferInterface.bind(this)(flex, manager)
    loadCustomDirectoryInterface.bind(this)(flex, manager)
    loadPlayAnnouncementInterface.bind(this)(flex, manager)
    loadRecordingControlInterface.bind(this)(flex, manager)
    loadUpdateDidInterface.bind(this)(flex, manager)

    // loadInternalCallInterface.bind(this)(flex, manager)
    registerCustomActions(manager)
  }
}
