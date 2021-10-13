import { FlexPlugin } from 'flex-plugin';

import registerCustomActions from './customActions'
import { loadExternalTransferInterface } from './components/ExternalTransfer'
import { loadInternalCallInterface } from './components/InternalCall'
import { loadCustomDirectoryInterface } from './components/CustomDirectory'

const PLUGIN_NAME = 'CustomTransferPlugin';

export default class CustomTransferPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  async init(flex, manager) {
    loadExternalTransferInterface.bind(this)(flex, manager)
    loadInternalCallInterface.bind(this)(flex, manager)
    loadCustomDirectoryInterface.bind(this)(flex, manager)
    registerCustomActions(manager)
  }
}
