import React, {Component} from 'react'
import {gql, graphql} from 'react-apollo'
import withT from '../../lib/withT'
import {validate as isEmail} from 'email-validator'
import {compose} from 'redux'
import {errorToString} from '../../lib/utils/errors'
import Router from 'next/router'

import Accordion from '../Pledge/Accordion'
import {RawStatus} from '../Status'

import {css} from 'glamor'

import {HEADER_HEIGHT, SIDEBAR_WIDTH} from './constants'
import {
  DISABLE_REMINDER, EMAIL_IR
} from '../../constants'

import {
  Button, Field,
  P, A, Label,
  colors, mediaQueries
} from '@project-r/styleguide'

const styles = {
  container: css({
    paddingTop: 10,
    [mediaQueries.onlyS]: {
      marginBottom: 30
    }
  }),
  link: css({
    textDecoration: 'none',
    color: colors.text,
    ':visited': {
      color: colors.text
    },
    ':hover': {
      color: '#ccc'
    }
  }),
  sticky: css({
    display: 'none',
    [mediaQueries.mUp]: {
      display: 'block',
      position: 'fixed',
      zIndex: 1,
      width: SIDEBAR_WIDTH,
      top: HEADER_HEIGHT,
      backgroundColor: '#fff'
    }
  }),
  button: css({
    marginBottom: 10,
    [mediaQueries.onlyS]: {
      display: 'none'
    }
  }),
  reminderActions: css({
    display: 'block',
    textAlign: 'right',
    '& a, & span': {
      cursor: 'pointer'
    }
  })
}

class SidebarInner extends Component {
  componentDidUpdate () {
    if (this.autoFocus && this.field) {
      this.field.input.focus()
      this.autoFocus = false
    }
  }
  componentDidMount () {
    const {email, emailDirty} = this.props.state
    this.handleEmail(email || '', emailDirty || false)
  }
  handleEmail (value, shouldValidate) {
    const {t, onChange} = this.props
    onChange({
      email: value,
      emailError: (
        (value.trim().length <= 0 && t('pledge/contact/email/error/empty')) ||
        (!isEmail(value) && t('pledge/contact/email/error/invalid'))
      ),
      emailDirty: shouldValidate
    })
  }
  render () {
    const {
      t,
      state: {
        reminderOpen,
        email, emailError, emailDirty,
        reminderError, reminderMessage
      },
      onChange, sendReminder,
      crowdfunding
    } = this.props

    const submitReminder = (e) => {
      e.preventDefault()
      if (emailError) {
        onChange({
          emailDirty: true
        })
        return
      }
      sendReminder(email).then(() => {
        onChange({
          reminderOpen: false,
          reminderError: false,
          reminderMessage: t('sidebar/reminder/success')
        })
      }).catch((error) => {
        onChange({
          reminderError: errorToString(error)
        })
      })
    }

    return (
      <div {...styles.container}>
        <Accordion crowdfundingName={crowdfunding.name} links={[
          !!EMAIL_IR && {
            href: `mailto:${EMAIL_IR}?subject=${encodeURIComponent(t('sidebar/investor/subject'))}`,
            text: t('sidebar/investor')
          }
        ]}>
          <div style={{margin: '20px 0'}}>
            <div {...styles.button}>
              <Button block primary onClick={() => {
                Router.push('/pledge').then(() => window.scrollTo(0, 0))
              }}>{t('header/button')}</Button>
            </div>
            {!DISABLE_REMINDER && reminderOpen ? (
              <form onSubmit={submitReminder}>
                <Field label={t('pledge/contact/email/label')}
                  name='email'
                  type='email'
                  error={emailDirty && emailError}
                  value={email}
                  ref={ref => { this.field = ref }}
                  onChange={(_, value, shouldValidate) => {
                    this.handleEmail(value, shouldValidate)
                  }}
                  />
                <Label {...styles.reminderActions}>
                  <span onClick={() => {
                    onChange({
                      reminderOpen: false,
                      reminderError: undefined,
                      reminderMessage: undefined
                    })
                  }}>
                    {t('sidebar/reminder/cancel')}
                  </span>
                  {' '}&nbsp;{' '}
                  <A onClick={submitReminder}>
                    {t('sidebar/reminder/send')}
                  </A>
                </Label>
                {!!reminderError && (
                  <P style={{color: colors.error}}>
                    {reminderError}
                  </P>
                )}
              </form>
            ) : !DISABLE_REMINDER && (
              reminderMessage ? (
                <P style={{textAlign: 'center'}}>
                  {reminderMessage}
                </P>
              ) : (<Button block onClick={() => {
                this.autoFocus = true
                onChange({reminderOpen: true})
              }}>
                {t('sidebar/reminder/button')}
              </Button>)
            )}
          </div>
        </Accordion>
      </div>
    )
  }
}

class Sidebar extends Component {
  constructor (props) {
    super(props)
    this.state = {}

    this.onScroll = () => {
      const y = window.pageYOffset
      const height = window.innerHeight
      const mobile = window.innerWidth < mediaQueries.mBreakPoint
      const {sticky, setSticky} = this.props

      let status = false
      let sidebar = false
      if (y + HEADER_HEIGHT > this.y) {
        status = true
        if (!mobile && height - HEADER_HEIGHT > this.innerHeight) {
          sidebar = true
        }
      }

      if (sticky.status !== status || sticky.sidebar !== sidebar) {
        setSticky({
          status,
          sidebar
        })
      }
    }
    this.innerRef = ref => { this.inner = ref }
    this.measure = () => {
      if (this.inner) {
        const rect = this.inner.getBoundingClientRect()

        this.y = window.pageYOffset + rect.top
        this.innerHeight = rect.height

        const right = window.innerWidth - rect.right

        if (right !== this.state.right) {
          this.setState(() => ({
            right
          }))
        }
      }
      this.onScroll()
    }
  }
  componentDidMount () {
    window.addEventListener('scroll', this.onScroll)
    window.addEventListener('resize', this.measure)
    this.measure()
  }
  componentDidUpdate () {
    this.measure()
  }
  componentWillUnmount () {
    window.removeEventListener('scroll', this.onScroll)
    window.removeEventListener('resize', this.measure)
  }
  render () {
    const {right} = this.state
    const {sticky, sendReminder, t, hasEnded, crowdfunding} = this.props

    const endStyles = hasEnded
      ? {
        pointerEvents: 'none',
        opacity: 0.5
      }
      : {}

    const onChange = state => this.setState(() => (state))
    return (
      <div>
        <RawStatus t={t} crowdfunding={crowdfunding} />

        <div ref={this.innerRef} style={{
          ...endStyles,
          visibility: sticky.sidebar ? 'hidden' : 'visible'
        }}>
          <SidebarInner t={t}
            crowdfunding={crowdfunding}
            onChange={onChange}
            state={this.state}
            sendReminder={sendReminder} />
        </div>

        {!!sticky.sidebar && (
          <div {...styles.sticky} style={{...endStyles, right: right}}>
            <SidebarInner t={t}
              crowdfunding={crowdfunding}
              onChange={onChange}
              state={this.state}
              sendReminder={sendReminder} />
          </div>
        )}
      </div>
    )
  }
}

const remindMeMutation = gql`
mutation remindEmail($email: String!) {
  remindEmail(email: $email)
}
`

export default compose(
  graphql(remindMeMutation, {
    props: ({mutate}) => ({
      sendReminder: email => mutate({variables: {email}})
    })
  }),
  withT
)(Sidebar)
