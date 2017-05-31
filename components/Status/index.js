import React, {Component} from 'react'
import {css} from 'glamor'
import {gql, graphql} from 'react-apollo'
import {ascending} from 'd3-array'
import {timeMinute} from 'd3-time'
import {compose} from 'redux'

import withT from '../../lib/withT'
import {chfFormat, countFormat} from '../../lib/utils/formats'

import {STATUS_POLL_INTERVAL_MS} from '../../constants'

import {
  P, Label, fontFamilies
} from '@project-r/styleguide'

import Bar from './Bar'

const styles = {
  primaryNumber: css({
    display: 'block',
    marginBottom: -10,
    fontSize: 80,
    fontFamily: fontFamilies.sansSerifRegular,
    lineHeight: 1
  }),
  secondaryNumber: css({
    display: 'block',
    marginBottom: -5,
    fontSize: 43,
    fontFamily: fontFamilies.sansSerifRegular,
    lineHeight: 1
  }),
  smallNumber: css({
    display: 'block',
    marginBottom: -5,
    fontSize: 22,
    fontFamily: fontFamilies.sansSerifRegular,
    lineHeight: 1
  }),
  hoverGoal: css({
    cursor: 'default',
    fontFamily: fontFamilies.sansSerifMedium
  })
}

class Status extends Component {
  constructor (props) {
    super(props)

    this.state = {}
  }
  tick () {
    const now = new Date()

    const msLeft = 1000 - now.getMilliseconds() + 50
    let msToNextTick = (60 - now.getSeconds()) * 1000 + msLeft

    const {crowdfunding: {endDate}} = this.props
    if (endDate) {
      const end = new Date(endDate)
      if (end < now) {
        return
      }
      const totalMinutes = timeMinute.count(now, end)
      const hours = Math.floor(totalMinutes / 60) % 24
      if (hours === 0) {
        msToNextTick = msLeft
      }
    }

    clearTimeout(this.timeout)
    this.timeout = setTimeout(
      () => {
        this.setState({
          now: new Date()
        })
        this.tick()
      },
      msToNextTick
    )
  }
  componentDidMount () {
    if (!this.props.compact) {
      this.tick()
    }
  }
  componentWillUnmount () {
    clearTimeout(this.timeout)
  }
  render () {
    if (!this.props.crowdfunding) {
      return null
    }

    const {crowdfunding: {goals, status, endDate}, t} = this.props
    const now = new Date()
    const end = new Date(endDate)

    const totalMinutes = timeMinute.count(now, end)
    const minutes = totalMinutes % 60
    const hours = Math.floor(totalMinutes / 60) % 24
    const days = Math.floor(totalMinutes / 60 / 24)

    if (!goals.length) {
      return
    }

    const goalsByPeople = [].concat(goals)
      .sort((a, b) => ascending(a.people, b.people))
    const goal = goalsByPeople[goalsByPeople.length - 1]

    const peopleLabel = t.elements('status/goal/people', {
      count: (
        <a key='count' {...styles.hoverGoal}
          onTouchStart={(e) => {
            e.preventDefault()
            this.setState({
              showGoal: true
            })
          }}
          onTouchEnd={() => this.setState({
            showGoal: false
          })}
          onMouseOver={() => this.setState({
            showGoal: true
          })}
          onMouseOut={() => this.setState({
            showGoal: false
          })}>
          {countFormat(goal.people)}
        </a>
      )
    })

    if (this.props.compact) {
      return (
        <div style={{paddingTop: 10}}>
          <P>
            <span {...styles.smallNumber}>{countFormat(status.people)}</span>
            <Label>{peopleLabel}</Label>
          </P>
          <Bar goals={goalsByPeople}
            showLast={this.state.showGoal}
            status={status}
            accessor='people'
            format={countFormat} />
        </div>
      )
    }

    return (
      <div>
        <P>
          <span {...styles.primaryNumber}>{countFormat(status.people)}</span>
          <Label>{peopleLabel}</Label>
        </P>
        <Bar goals={goalsByPeople}
          showLast={this.state.showGoal}
          status={status}
          accessor='people'
          format={countFormat} />
        <P>
          <span {...styles.secondaryNumber}>{chfFormat(status.money / 100)}</span>
          <Label>
            {t('status/goal/money', {
              formattedCHF: chfFormat(goal.money / 100)
            })}
          </Label>
        </P>
        <Bar
          goals={goalsByPeople}
          status={status}
          accessor='money'
          format={(value) => chfFormat(value / 100)} />
        <P>
          <span {...styles.smallNumber}>
            {end > now ? (
              [
                days > 0 && t.pluralize(
                  'status/time/days',
                  {
                    count: days
                  }
                ),
                (days !== 0 || hours > 0) && t.pluralize(
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
                ),
                days === 0 && hours === 0 && this.state.now && t.pluralize(
                  'status/time/seconds',
                  {
                    count: 60 - now.getSeconds()
                  }
                )
              ].filter(Boolean).join(' ')
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

export const RawStatus = Status

const query = gql`{
  crowdfunding(name: "REPUBLIK") {
    id
    goals {
      people
      money
      description
    }
    status {
      people
      money
    }
    endDate
    endVideo {
      hls
      mp4
      subtitles
      poster
    }
    hasEnded
  }
}`

export const withStatus = Component => graphql(query, {
  props: ({data}) => {
    return {
      crowdfunding: data.crowdfunding,
      statusRefetch: data.refetch,
      statusStartPolling: data.startPolling,
      statusStopPolling: data.stopPolling
    }
  },
  options: {
    pollInterval: +STATUS_POLL_INTERVAL_MS
  }
})(Component)

export default compose(
  withStatus,
  withT
)(Status)
