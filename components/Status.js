import React, {Component} from 'react'
import {css} from 'glamor'
import {gql, graphql} from 'react-apollo'

import {
  P, Label, colors
} from '@project-r/styleguide'

import {formatLocale} from 'd3-format'
import {timeDay} from 'd3-time'

const swissNumbers = formatLocale({
  decimal: '.',
  thousands: "'",
  grouping: [3],
  currency: ['CHF\u00a0', '']
})
const chfFormat = swissNumbers.format('$,.0f')

const styles = {
  primaryNumber: css({
    display: 'block',
    marginBottom: -10,
    fontSize: 80,
    fontFamily: 'sans-serif',
    lineHeight: 1
  }),
  secondaryNumber: css({
    display: 'block',
    marginBottom: -5,
    fontSize: 43,
    fontFamily: 'sans-serif',
    lineHeight: 1
  }),
  smallNumber: css({
    display: 'block',
    marginBottom: -5,
    fontSize: 22,
    fontFamily: 'sans-serif',
    lineHeight: 1
  }),
  bar: css({
    height: 8,
    marginTop: -20,
    marginBottom: 20,
    backgroundColor: '#EAEDEB'
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
    endDate
  }
}
`

class Status extends Component {
  render () {
    if (this.props.loading && !this.props.crowdfunding) {
      return <P>…</P>
    }
    if (this.props.error) {
      return <P>{this.props.error}</P>
    }
    const {crowdfunding: {goal, status, endDate}} = this.props
    const now = new Date()
    const end = new Date(endDate)

    let days = timeDay.count(now, end)
    let hours = end.getHours() - now.getHours()
    if (hours < 0 || (hours === 0 && end.getMinutes() < now.getMinutes())) {
      days -= 1
      if (hours < 0) {
        hours += 24
      }
    }

    if (this.props.compact) {
      return (
        <div style={{paddingTop: 10}}>
          <P>
            <span {...styles.smallNumber}>{status.people}</span>
            <Label>von {goal.people} Mitglieder</Label>
          </P>
          <div {...styles.bar}>
            <div {...styles.barInner} style={{width: `${Math.ceil(status.people / goal.people * 100)}%`}} />
          </div>
        </div>
      )
    }

    return (
      <div>
        <P>
          <span {...styles.primaryNumber}>{status.people}</span>
          <Label>von {goal.people} Mitglieder</Label>
        </P>
        <div {...styles.bar}>
          <div {...styles.barInner} style={{width: `${Math.ceil(status.people / goal.people * 100)}%`}} />
        </div>
        <P>
          <span {...styles.secondaryNumber}>{chfFormat(status.money / 100)}</span>
          <Label>von {chfFormat(goal.money / 100)} finanziert</Label>
        </P>
        <div {...styles.bar}>
          <div {...styles.barInner} style={{width: `${Math.ceil(status.money / goal.money * 100)}%`}} />
        </div>
        <P>
          <span {...styles.smallNumber}>
            {end > now ? (
              `${days} Tage ${hours} Stunden`
            ) : (
              'Vorbei'
            )}
          </span>
          <Label>Zeit verbleibend</Label>
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
  },
  options: {
    pollInterval: 2500
  }
})(Status)

export default StatusWithQuery
