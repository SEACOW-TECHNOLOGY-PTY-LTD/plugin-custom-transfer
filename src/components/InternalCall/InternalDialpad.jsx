import React from 'react'

import sharedTheme from '../../styling/theme.js'
import FormControl from '@material-ui/core/FormControl'
import Select from 'react-select'
import Button from '@material-ui/core/Button'
import { Icon } from '@twilio/flex-ui'
import { withStyles } from '@material-ui/core/styles'
import { makeInternalCall } from './index'
import { debounce } from 'lodash'
import { post } from '../../utils/api'

const styles = theme => (sharedTheme(theme))

class InternalDialpad extends React.Component {

  state = {
    workerList: [],
    selectedWorker: null,
    inputText: '',
  }

  async componentDidMount () {
    this.setWorkers()
  }

  setWorkers = (query = '') => {
    post('internal-call/get-worker-list', {
      value: '',
    }).
      then(response => {
        this.setState({
          workerList: response,
        })
      }).
      catch(error => {
        console.log(error)
      })
  }

  handleChange = event => {
    console.log('hey')
    this.setState({ selectedWorker: event })
  }

  handleInputChange = event => {
    this.setState({ inputText: event })
    this.handleWorkersListUpdate(event)

    if (event !== '') {
      this.setState({ selectedWorker: null })
    }
  }

  handleWorkersListUpdate = debounce((e) => {
      if (e) {
        this.setWorkers(`data.attributes.full_name CONTAINS "${e}"`)
      }
    }, 250, { 'maxWait': 1000 },
  )

  handleOnFocus = () => {
    if (this.state.inputText === '' && this.state.workerList.length === 0) {
      this.setWorkers()
    }
  }

  makeCall = () => {
    if (this.state.selectedWorker != null) {
      const { manager } = this.props
      makeInternalCall({
        manager,
        selectedWorker: this.state.selectedWorker.value,
        workerList: this.state.workerList,
      })
    }
  }

  render () {
    const { classes } = this.props

    const workers = this.state.workerList.map((worker) => {
        const { activityName, sid } = worker
        const { contact_uri, full_name } = worker.attributes

        return (
          activityName !== 'Offline' && sid !==
          this.props.manager.workerClient.sid
        ) ? (
          { label: full_name, value: contact_uri }
        ) : null
      },
    ).filter(elem => elem)

    return (
      <div className={classes.boxDialpad}>
        <div className={classes.titleAgentDialpad}>Call Agent</div>
        <div className={classes.subtitleDialpad}>Select agent</div>
        <FormControl className={classes.formControl}>
          <Select
            className="basic-single"
            classNamePrefix="select"
            isSearchable={true}
            name="workers"
            maxMenuHeight={150}
            onChange={this.handleChange}
            onInputChange={this.handleInputChange}
            onMenuOpen={this.handleOnFocus}
            options={workers}
            inputValue={this.state.inputText}
            value={this.state.selectedWorker || null}
          />
          <div className={classes.buttonAgentDialpad}>
            <Button
              variant="contained"
              color="primary"
              disabled={!this.state.selectedWorker}
              onClick={this.makeCall}
              className={classes.dialPadBtn}
            >
              <Icon icon="Call"/>
            </Button>
          </div>
        </FormControl>
      </div>
    )
  }
}

export default withStyles(styles)(InternalDialpad)