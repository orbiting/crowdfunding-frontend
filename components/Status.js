import React, {Component} from 'react'
import {gql, graphql} from 'react-apollo'

import {
  P
} from '@project-r/styleguide'

const query = gql`
{
  crowdfunding(name: "REPUBLIK") {
    id
    goal {people, money}
    status {people, money}
  }
}
`

class Status extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }
  render () {
    if (this.props.loading) {
      return <P>…</P>
    }
    if (this.props.error) {
      return <P>{this.props.error}</P>
    }
    const {crowdfunding: {goal, status}} = this.props

    return (
      <div>
        <P>Goal<br />
           people: {goal.people} money: {goal.money}
        </P>
        <P>Status<br />
           people: {status.people} money: {status.money}
        </P>
      </div>
    )
  }
}

const StatusWithQuery = graphql(query, {
  props: ({ data }) => {
    return {
      loading: data.loading,
      error: data.error,
      crowdfunding: data.crowdfunding
    }
  }
})(Status)

export default StatusWithQuery
