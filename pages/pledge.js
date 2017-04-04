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
import Accordion from '../components/Accordion'
import FieldSet from '../components/FieldSet'
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
      name,
      email,
      birthday
    } = this.state
    const {query, me} = this.props

    const handleChange = field => {
      return event => {
        const value = event.target.value
        this.setState(() => ({
          [field]: value
        }))
      }
    }

    const pledgeOptions = query.pledgeOptions
      ? JSON.parse(query.pledgeOptions)
      : []
    const user = {
      name,
      email,
      birthday
    }

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
                onChange={event => {
                  const url = {
                    pathname: '/pledge',
                    query: {
                      ...query,
                      amount: event.target.value * 100
                    }
                  }
                  Router.replace(url, url, {shallow: true})
                }} />
            </P>
          </div>
        ) : (
          <Accordion onSelect={params => {
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
              <Field label='Dein Name'
                value={name}
                onChange={handleChange('name')} />
              <br />
              <Field label='Deine E-Mail'
                value={email}
                onChange={handleChange('email')} />
              <br /><br />
            </span>
          )}
          <Field label='Geburtsdatum'
            value={birthday}
            onChange={handleChange('birthday')} />
          <br /><br />
          <FieldSet
            values={this.state.values}
            errors={this.state.errors}
            dirty={this.state.dirty}
            fields={[
              {
                label: 'Strasse',
                name: 'line1'
              },
              {
                label: 'Strassenzusatz',
                name: 'line2'
              },
              {
                label: 'PLZ',
                name: 'postalCode'
              },
              {
                label: 'Ort',
                name: 'city'
              },
              {
                label: 'Land',
                name: 'country',
                autocomplete: [
                  'Schweiz',
                  'Deutschland',
                  'Österreich'
                ]
              }
            ]}
            onChange={(fields) => {
              this.setState((state) => {
                const nextState = {
                  values: {
                    ...state.values,
                    ...fields.values
                  },
                  errors: {
                    ...state.errors,
                    ...fields.errors
                  },
                  dirty: {
                    ...state.dirty,
                    ...fields.dirty
                  }
                }

                return nextState
              })
            }} />
        </div>

        <Submit me={me} user={user} pledgeOptions={pledgeOptions} />
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
