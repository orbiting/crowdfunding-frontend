import React, {Component} from 'react'
import {gql, graphql} from 'react-apollo'
import {compose} from 'redux'
import {timeMinute} from 'd3-time'
import {css} from 'glamor'

import Loader from '../Loader'
import SignIn from '../Auth/SignIn'
import RawHtml from '../RawHtml'
import ErrorMessage from '../ErrorMessage'
import {InlineSpinner} from '../Spinner'

import {swissTime} from '../../lib/utils/formats'

import withT from '../../lib/withT'
import withMe from '../../lib/withMe'

import {
  Interaction, Radio, Button, Label
} from '@project-r/styleguide'

const {H1, H2, P} = Interaction

const endDateFormat = swissTime.format('%d. %B %Y')
const endHourFormat = swissTime.format('%H')

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
  constructor (...args) {
    super(...args)

    this.state = {}
  }
  submit () {
    this.setState({
      submitting: true
    })
    this.props.submitBallot(this.state.selectedOption.id)
      .then(({data}) => {
        this.setState({
          submitting: false,
          hasSubmitted: data
        })
      })
      .catch(error => {
        this.setState({
          submitting: false,
          error
        })
      })
  }
  componentWillReceiveProps (nextProps) {
    if (nextProps.me !== this.props.me) {
      this.props.data && this.props.data.refetch({
        name: this.props.name
      })
    }
  }
  render () {
    const {data: {loading, error, voting}, t, me} = this.props

    return (
      <Loader loading={loading} error={error} render={() => {
        const endDate = new Date(voting.endDate)

        const now = new Date()
        const minutes = timeMinute.count(now, endDate)

        let timeLeft
        if (minutes > 60 * 24) {
          timeLeft = {
            unit: 'days',
            count: Math.floor(minutes / 60 / 24)
          }
        } else if (minutes > 60) {
          timeLeft = {
            unit: 'hours',
            count: Math.floor(minutes / 60)
          }
        } else {
          timeLeft = {
            unit: 'minutes',
            count: minutes
          }
        }

        const canVote = !!(
          me &&
          voting.userIsEligitable &&
          !voting.userHasSubmitted
        )
        const {
          selectedOption
        } = this.state
        const safeSelectedOption = selectedOption || {}

        if (voting.result) {
          return (
            <pre>
              <code>{JSON.stringify(voting.result, null, 2)}</code>
            </pre>
          )
        }

        return (
          <div>
            <H1>
              {t(`vote/${voting.name}/title`)}
            </H1>
            <RawHtml type={P} dangerouslySetInnerHTML={{
              __html: t(`vote/${voting.name}/lead`, undefined, '')
            }} />
            <RawHtml type={P} dangerouslySetInnerHTML={{
              __html: [
                t.pluralize(`vote/${voting.name}/time/${timeLeft.unit}`, {
                  count: timeLeft.count,
                  endDate: endDateFormat(endDate),
                  endHour: endHourFormat(endDate)
                }),
                t.pluralize(`vote/${voting.name}/turnout`, {
                  count: voting.turnout.submitted,
                  eligitable: voting.turnout.eligitable,
                  roundTurnoutPercent: Math.round(
                    voting.turnout.submitted / voting.turnout.eligitable * 100
                  )
                })
              ].join(' ')
            }} />
            <H2 style={{marginTop: 20}}>
              {t(`vote/${voting.name}/options/title/${canVote ? 'canVote' : 'generic'}`)}
            </H2>
            <div {...styles.options}>
              {voting.options.map(option => {
                const Icon = Icons[option.name]
                const text = t(`vote/${voting.name}/options/${option.name}`)

                const content = (
                  <span style={{display: 'block', marginTop: 10}}>
                    {!!Icon && [
                      <Icon key='icon' />,
                      <br key='br' />
                    ]}
                    {text}
                  </span>
                )

                return (
                  <div key={option.id} {...styles.option} style={{textAlign: 'center'}}>
                    {canVote ? (
                      <Radio
                        checked={(
                          safeSelectedOption.id === option.id
                        )}
                        onChange={() => {
                          this.setState((state) => ({
                            selectedOption: option
                          }))
                        }}>
                        {content}
                      </Radio>
                    ) : content}
                  </div>
                )
              })}
            </div>
            {canVote && (
              <div>
                {this.state.submitting
                  ? (
                    <div style={{textAlign: 'center'}}>
                      <InlineSpinner />
                    </div>
                  )
                  : (
                    <Button primary block
                      disabled={!selectedOption}
                      onClick={event => {
                        event.preventDefault()
                        this.submit()
                      }}>
                      {t.first([
                        `vote/submit/${voting.name}/${safeSelectedOption.name}`,
                        'vote/submit/text'
                      ])}
                    </Button>
                  )
                }
                <Label>
                  {t('vote/submit/note')}
                </Label>
              </div>
            )}
            {
              !!this.state.error && (
                <ErrorMessage error={this.state.error} />
              )
            }
            {
              (!!this.state.hasSubmitted || (!canVote && voting.userHasSubmitted)) && (
                this.state.hasSubmitted
                ? (
                  <RawHtml type={P} dangerouslySetInnerHTML={{
                    __html: t('vote/submit/merci')
                  }} />
                )
                : (
                  <RawHtml type={P} dangerouslySetInnerHTML={{
                    __html: t('vote/hasSubmitted')
                  }} />
                )
              )
            }
            {
              !!me && !voting.userIsEligitable && (
                <RawHtml type={P} dangerouslySetInnerHTML={{
                  __html: t('vote/notEligitable')
                }} />
              )
            }
            {
              !me && (
                <div>
                  <RawHtml type={P} dangerouslySetInnerHTML={{
                    __html: t('vote/signIn/before')
                  }} />
                  <SignIn />
                  <RawHtml type={P} dangerouslySetInnerHTML={{
                    __html: t('vote/signIn/after')
                  }} />
                </div>
              )
            }
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
    result {
      options {
        id
        name
        count
        winner
      }
      message
      createdAt
      updatedAt
    }
  }
}
`

const submitBallot = gql`
mutation submitBallot($optionId: ID!) {
  submitBallot(optionId: $optionId)
}
`
export default compose(
  graphql(submitBallot, {
    props: ({mutate, ownProps}) => ({
      submitBallot: optionId => mutate({
        variables: {
          optionId
        },
        refetchQueries: [{
          query: query,
          variables: {
            name: ownProps.name
          }
        }]
      })
    })
  }),
  graphql(query),
  withMe,
  withT
)(Poll)
