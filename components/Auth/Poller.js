import React, {Component, PropTypes} from 'react'
import {graphql} from 'react-apollo'
import {meQuery} from '../../lib/withMe'

class Status extends Component {
  constructor (props) {
    super(props)
    this.state = {
      start: new Date()
    }
  }
  render () {
    const now = new Date()
    const elapsedMs = now.getTime() - this.state.start.getTime()

    const {onSuccess, data: {error, me}} = this.props
    if (me) {
      onSuccess(me, elapsedMs)
      return null
    }

    return (
      <span>
        {Math.round(elapsedMs / 1000)}s
        {' '}{!!error && error.toString()}
      </span>
    )
  }
}

Status.propTypes = {
  onSuccess: PropTypes.func.isRequired
}

const Poller = graphql(meQuery, {
  options: {
    pollInterval: 1000
  }
})(Status)

export default Poller
