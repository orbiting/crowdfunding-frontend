import React, {Component} from 'react'
import {gql, graphql} from 'react-apollo'
import {compose} from 'redux'
import {timeMinute} from 'd3-time'
import {css} from 'glamor'
import {color as d3Color} from 'd3-color'

import Loader from '../Loader'
import SignIn from '../Auth/SignIn'
import SignOut from '../Auth/SignOut'
import RawHtml from '../RawHtml'
import ErrorMessage from '../ErrorMessage'
import {InlineSpinner} from '../Spinner'

import {swissTime} from '../../lib/utils/formats'

import withT from '../../lib/withT'
import withMe from '../../lib/withMe'

import {
  Interaction, Button, Label, mediaQueries,
  H1, P as EP
} from '@project-r/styleguide'

import colors from './colors'

const {H2, H3, P} = Interaction

const endDateFormat = swissTime.format('%d. %B %Y')
const endHourFormat = swissTime.format('%H')

const OPTION_PADDING = 20
const styles = {
  title: css({
    [mediaQueries.onlyS]: {
      fontSize: 36,
      lineHeight: '39px'
    }
  }),
  options: css({
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center'
  }),
  option: css({
    padding: OPTION_PADDING,
    maxWidth: 320,
    [mediaQueries.mUp]: {
      maxWidth: '33.3%'
    },
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column'
  }),
  optionTitle: css({
    flexGrow: 1
  }),
  optionText: css({
    marginTop: 10,
    marginBottom: 10,
    flexGrow: 1
  }),
  optionLabel: css({
    cursor: 'pointer',
    margin: -OPTION_PADDING,
    padding: OPTION_PADDING,
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column'
  })
}

const Checked = ({fill}) => (
  <svg fill={fill} height='24' width='24' viewBox='0 0 24 24'
    style={{verticalAlign: 'middle'}}>
    <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' />
  </svg>
)

const PollButton = ({t, children, optionColor, checked, onClick}) => {
  let backgroundColor
  if (checked) {
    backgroundColor = d3Color(optionColor)
    backgroundColor.opacity = 0.1
  }
  return (
    <label {...styles.optionLabel} style={{
      backgroundColor
    }}>
      {children}
      <P style={{color: optionColor, minHeight: 30}}>
        {checked && <Checked fill={optionColor} />}
        {' '}
        {t(`vote/option/${checked ? 'selected' : 'select'}`)}
      </P>
      <input type='radio' checked={checked} onClick={onClick} hidden />
    </label>
  )
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
            <H1 {...styles.title}>
              {t(`vote/${voting.name}/title`)}
            </H1>
            <RawHtml type={EP} dangerouslySetInnerHTML={{
              __html: t(`vote/${voting.name}/lead`, undefined, '')
            }} />
            <RawHtml type={EP} dangerouslySetInnerHTML={{
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
            <H2 style={{marginTop: 40, textAlign: 'center', marginBottom: 10}}>
              {t(`vote/${voting.name}/options/title/${canVote ? 'canVote' : 'generic'}`)}
            </H2>
            <div {...styles.options}>
              {voting.options.map(option => {
                const title = t(`vote/${voting.name}/options/${option.name}/title`)
                const text = t(`vote/${voting.name}/options/${option.name}`)

                const optionColor = colors[option.name]

                const content = [
                  <H3 key='title' {...styles.optionTitle} style={{color: optionColor}}>
                    {title}
                  </H3>,
                  <div key='text' {...styles.optionText}>
                    {text}
                  </div>
                ]

                return (
                  <div key={option.id} {...styles.option} style={{textAlign: 'center'}}>
                    {canVote ? (
                      <PollButton t={t}
                        checked={(
                          safeSelectedOption.id === option.id
                        )}
                        onClick={() => {
                          this.setState((state) => ({
                            selectedOption: option
                          }))
                        }}
                        optionColor={optionColor}>
                        {content}
                      </PollButton>
                    ) : content}
                  </div>
                )
              })}
            </div>
            <br />
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
                      style={{
                        height: 'auto',
                        minHeight: 60,
                        marginBottom: 10
                      }}
                      onClick={event => {
                        event.preventDefault()
                        this.submit()
                      }}>
                      {t(
                        `vote/submit/text${selectedOption ? '/title' : ''}`,
                        {
                          title: selectedOption && t(`vote/${voting.name}/options/${selectedOption.name}/title`)
                        }
                      )}
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
              !!me && (
                <Label>
                  <br />
                  <RawHtml type='span' dangerouslySetInnerHTML={{
                    __html: t('vote/signedInAs', {
                      email: me.email
                    })
                  }} />
                  {' '}
                  <SignOut />
                </Label>
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
