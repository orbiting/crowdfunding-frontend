import React, {Component} from 'react'
import {css} from 'glamor'
import {gql, graphql} from 'react-apollo'
import withT from '../lib/withT'
import {chfFormat} from '../lib/utils/formats'
import {errorToString} from '../lib/utils/errors'

import {
  P, Label, colors
} from '@project-r/styleguide'

import {timeMinute} from 'd3-time'

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
      return <P>{errorToString(this.props.error)}</P>
    }
    const {crowdfunding: {goal, status, endDate}, t} = this.props
    const now = new Date()
    const end = new Date(endDate)

    const totalMinutes = timeMinute.count(now, end)
    const minutes = totalMinutes % 60
    const hours = Math.floor(totalMinutes / 60) % 24
    const days = Math.floor(totalMinutes / 60 / 24)

    if (this.props.compact) {
      return (
        <div style={{paddingTop: 10}}>
          <P>
            <span {...styles.smallNumber}>{status.people}</span>
            <Label>{t('status/goal/people', {
              count: goal.people
            })}</Label>
          </P>
          <div {...styles.bar}>
            <div {...styles.barInner} style={{
              width: `${Math.ceil(
                Math.min(1, status.people / goal.people) * 100
              )}%`
            }} />
          </div>
        </div>
      )
    }

    return (
      <div>
        <P>
          <span {...styles.primaryNumber}>{status.people}</span>
          <Label>{t('status/goal/people', {
            count: goal.people
          })}</Label>
        </P>
        <div {...styles.bar}>
          <div {...styles.barInner} style={{
            width: `${Math.ceil(
              Math.min(1, status.people / goal.people) * 100
            )}%`
          }} />
        </div>
        <P>
          <span {...styles.secondaryNumber}>{chfFormat(status.money / 100)}</span>
          <Label>
            {t('status/goal/money', {
              formattedCHF: chfFormat(goal.money / 100)
            })}
          </Label>
        </P>
        <div {...styles.bar}>
          <div {...styles.barInner} style={{
            width: `${Math.ceil(
              Math.min(1, status.money / goal.money) * 100
            )}%`
          }} />
        </div>
        <P>
          <span {...styles.smallNumber}>
            {end > now ? (
              [
                t.pluralize(
                  'status/time/days',
                  {
                    count: days
                  }
                ),
                t.pluralize(
                  'status/time/hours',
                  {
                    count: hours
                  }
                ),
                t.pluralize(
                  'status/time/minutes',
                  {
                    count: minutes
                  }
                )
              ].join(' ')
            ) : (
              t('status/time/ended')
            )}
          </span>
          <Label>{t('status/time/label')}</Label>
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
})(withT(Status))

export default StatusWithQuery
