import React, {Component, PropTypes} from 'react'
import withData from '../lib/withData'
import Router from 'next/router'
import withMe from '../lib/withMe'
import SignOut from '../components/Auth/SignOut'

import {
  H1, H2, Field, P, A,
  NarrowContainer
} from '@project-r/styleguide'

import Frame from '../components/Frame'
import Accordion from '../components/Pledge/Accordion'
import Submit from '../components/Pledge/Submit'

class Pledge extends Component {
  constructor (props) {
    super(props)
    this.state = {
      values: {},
      errors: {},
      dirty: {}
    }
    this.amountRefSetter = (ref) => {
      this.amountRef = ref
    }
  }
  componentDidMount () {
    if (this.amountRef && this.amountRef.input) {
      this.amountRef.input.focus()
    }
  }
  render () {
    const {
      values,
      errors,
      dirty
    } = this.state
    const {query, me} = this.props

    const handleChange = (field, label, isRequired) => {
      return (_, value, shouldValidate) => {
        this.setState((state) => ({
          values: {
            ...state.values,
            [field]: value
          },
          errors: {
            ...state.errors,
            [field]: isRequired
              ? (!value && `${label} fehlt`)
              : undefined
          },
          dirty: {
            ...state.dirty,
            [field]: shouldValidate
          }
        }))
      }
    }

    const pledgeOptions = query.pledgeOptions
      ? JSON.parse(query.pledgeOptions)
      : []

    return (
      <div>
        <H2>Belohnungen</H2>

        {query.package ? (
          <div style={{marginBottom: 40}}>
            <P>
              {query.packageName}
              {' '}
              <A href='/pledge' onClick={event => {
                event.preventDefault()
                Router.replace('/pledge', '/pledge', {shallow: true})
              }}>
                ändern
              </A>
            </P>
            <P>
              {pledgeOptions
                .filter(option => option.configurable && option.amount)
                .map(option => (
                  <span key={option.id}>
                    {option.amount}
                    {' x '}
                    {option.name}
                    <br />
                  </span>
                ))
              }
            </P>
            {!!query.userPrice && (<P>
              Journalismus kostet. Wir haben ausgerechnet dass wir initial mindestens 3000 Abonnenten à CHF 240.- brauchen um dauerhaft zu bestehen. Trotzdem wollen wir niemanden ausschliessen. Wie viel könnten Sie den zahlen pro Jahr?
            </P>)}
            <P>
              <Field label='Betrag'
                ref={this.amountRefSetter}
                value={query.amount / 100}
                onChange={(_, value) => {
                  const url = {
                    pathname: '/pledge',
                    query: {
                      ...query,
                      amount: value * 100
                    }
                  }
                  Router.replace(url, url, {shallow: true})
                }} />
            </P>
          </div>
        ) : (
          <Accordion extended onSelect={params => {
            const url = {
              pathname: '/pledge',
              query: params
            }
            Router.replace(url, url, {shallow: true})
              .then(() => {
                window.scrollTo(0, 0)
                if (this.amountRef && this.amountRef.input) {
                  this.amountRef.input.focus()
                }
              })
          }} />
        )}

        <H2>Deine Kontaktinformationen</H2>
        <div style={{marginTop: 0, marginBottom: 40}}>
          {me ? (
            <span>
              <strong>Du bist eingeloggt als:</strong><br />
              {me.name}<br />
              {me.email}<br /><br />
              <SignOut />
            </span>
          ) : (
            <span>
              <Field label='Ihr Name'
                error={dirty.name && errors.name}
                value={values.name}
                onChange={handleChange('name', 'Ihr Name', true)} />
              <br />
              <Field label='Ihre E-Mail'
                error={dirty.email && errors.email}
                value={values.email}
                onChange={handleChange('email', 'Ihre E-Mail', true)} />
              <br /><br />
            </span>
          )}
        </div>

        <Submit
          me={me}
          user={{
            name: values.name,
            email: values.email
          }}
          pledgeOptions={pledgeOptions}
          amount={query.amount}
          reason={values.reason} />
      </div>
    )
  }
}

Pledge.propTypes = {
  query: PropTypes.object.isRequired
}

const PledgeWithSubmit = withMe(Pledge)

export default withData(({url, session}) => (
  <Frame url={url} sidebar={false}>
    <NarrowContainer>
      <H1>Mitmachen</H1>
      <PledgeWithSubmit query={url.query} session={session} />
    </NarrowContainer>
  </Frame>
))
