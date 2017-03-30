import React, {Component} from 'react'
import {css} from 'glamor'
import {gql, graphql} from 'react-apollo'

import {
  P
} from '@project-r/styleguide'

const styles = {
  primaryNumber: css({
    fontSize: 86
  }),
  secondaryNumber: css({
    fontSize: 43
  })
}

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
        <P>
          <span {...styles.primaryNumber}>{status.people}</span><br />
          von {goal.people} Mitglieder
        </P>
        <P>
          <span {...styles.secondaryNumber}>CHF {status.money / 100}</span><br />
          von CHF {goal.money / 100} finanziert
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
