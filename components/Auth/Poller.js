import React, {Component} from 'react'
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
    const elapsedMs = now.getTime() - this.state.state.getTime()

    const {onSuccess, data: {error, me}} = this.props
    if (me && me.id) {
      onSuccess(me, elapsedMs)
      return null
    }

    return (
      <span>{Math.round(elapsedMs / 1000)}s {!!error && error}</span>
    )
  }
}

const Poller = graphql(meQuery, {
  options: {
    pollInterval: 1000
  }
})(Status)

export default () => Poller
