import React, {Component} from 'react'
import {gql, graphql} from 'react-apollo'
import {compose} from 'redux'
import {timeMinute} from 'd3-time'

import Loader from '../Loader'

import {swissTime} from '../../lib/utils/formats'

import withT from '../../lib/withT'
import withMe from '../../lib/withMe'
import {css} from 'glamor'

import {
  Interaction
} from '@project-r/styleguide'

const {H1, P} = Interaction

const endFormat = swissTime.format('%d. %B %Y')

const Icons = {
  DATA: require('./Icons/D').default,
  CORRESPONDENT: require('./Icons/K').default,
  SATIRE: require('./Icons/S').default
}

const styles = {
  options: css({
    margin: '0 -10px',
    display: 'flex'
  }),
  option: css({
    padding: 10,
    width: '33.3%'
  })
}

class Poll extends Component {
  render () {
    const {data: {loading, error, voting}, t} = this.props

    return (
      <Loader loading={loading} error={error} render={() => {
        const endDate = new Date(voting.endDate)

        const now = new Date()
        const minutes = timeMinute.count(now, endDate)

        let timeLeft
        if (minutes > 60 * 24) {
          timeLeft = t.pluralize('status/time/days', {
            count: Math.floor(minutes / 60 / 24)
          })
        } else if (minutes > 60) {
          timeLeft = t.pluralize('status/time/hours', {
            count: Math.floor(minutes / 60)
          })
        } else {
          timeLeft = t.pluralize('status/time/minutes', {
            count: minutes
          })
        }

        return (
          <div>
            <H1>
              {t(`vote/poll/title/${voting.name}`)}
            </H1>
            <P>
              {t.pluralize('vote/poll/submittedStatus', {
                count: voting.turnout.submitted
              })}
            </P>
            <P>
              {t('vote/poll/timeStatus', {
                endDate: endFormat(endDate),
                timeLeft
              })}
            </P>
            <div {...styles.options}>
              {voting.options.map(option => {
                const Icon = Icons[option.name]
                return (
                  <div key={option.id} {...styles.option}>
                    {!!Icon && (
                      <div>
                        <Icon />
                      </div>
                    )}
                    {t(`vote/${voting.name}/options/${option.name}`)}
                  </div>
                )
              })}
            </div>
          </div>
        )
      }} />
    )
  }
}

const query = gql`
query($name: String!) {
  voting(name: $name) {
    id
    name
    userIsEligitable
    userHasSubmitted
    endDate
    options {
      id
      name
    }
    turnout {
      eligitable
      submitted
    }
  }
}
`

export default compose(
  graphql(query),
  withMe,
  withT
)(Poll)
