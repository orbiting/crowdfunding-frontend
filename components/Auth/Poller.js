import React, {Component, PropTypes} from 'react'
import {graphql, withApollo} from 'react-apollo'
import {meQuery} from '../../lib/withMe'
import {compose} from 'redux'

class Status extends Component {
  constructor (props) {
    super(props)
    this.state = {
      start: new Date()
    }
  }
  componentDidMount () {
    this.props.data.startPolling(1000)
  }
  render () {
    const now = new Date()
    const elapsedMs = now.getTime() - this.state.start.getTime()

    const {onSuccess, data: {error, me, stopPolling}, client} = this.props
    if (me) {
      stopPolling()
      // refetch everything with user context
      client.resetStore()
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

export default compose(
  graphql(meQuery),
  withApollo
)(Status)
