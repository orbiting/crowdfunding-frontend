import React, {Component} from 'react'
import {css} from 'glamor'
import {gql, graphql} from 'react-apollo'

import {
  P, colors
} from '@project-r/styleguide'

import {formatLocale} from 'd3-format'

const swissNumbers = formatLocale({
  decimal: '.',
  thousands: "'",
  grouping: [3],
  currency: ['CHF\u00a0', '']
})
const chfFormat = swissNumbers.format('$,.0f')

const styles = {
  primaryNumber: css({
    fontSize: 86,
    lineHeight: 1
  }),
  secondaryNumber: css({
    fontSize: 43,
    lineHeight: 1
  }),
  bar: css({
    height: 5,
    marginTop: -20,
    marginBottom: 20,
    backgroundColor: '#ccc'
  }),
  barInner: css({
    backgroundColor: colors.primary,
    height: '100%'
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
        <div {...styles.bar}>
          <div {...styles.barInner} style={{width: `${Math.ceil(status.people / goal.people * 100)}%`}} />
        </div>
        <P>
          <span {...styles.secondaryNumber}>{chfFormat(status.money / 100)}</span><br />
          von {chfFormat(goal.money / 100)} finanziert
        </P>
        <div {...styles.bar}>
          <div {...styles.barInner} style={{width: `${Math.ceil(status.money / goal.money * 100)}%`}} />
        </div>
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
