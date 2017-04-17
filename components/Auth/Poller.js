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
  componentDidUpdate () {
    const {me, onSuccess} = this.props
    if (me) {
      const now = new Date()
      const elapsedMs = now.getTime() - this.state.start.getTime()
      this.props.data.stopPolling()

      onSuccess && onSuccess(me, elapsedMs)
    }
  }
  componentWillUnmount () {
    // refetch everything with user context
    const client = this.props.client
    // nextTick to avoid in-flight queries
    setTimeout(
      () => {
        client.resetStore()
      },
      0
    )
  }
  render () {
    const now = new Date()
    const elapsedMs = now.getTime() - this.state.start.getTime()

    const {data: {error, me}} = this.props
    if (me) {
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
  onSuccess: PropTypes.func
}

export default compose(
  graphql(meQuery),
  withApollo
)(Status)
