import React, {Component, PropTypes} from 'react'
import withData from '../lib/withData'
import App from '../components/App'
import Accordion from '../components/Accordion'
import Router from 'next/router'

import {
  Button,
  H1, H2, Field, P, A,
  NarrowContainer
} from '@project-r/styleguide'

class Pledge extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }
  render () {
    const {name, email} = this.state
    const {query} = this.props

    const handleChange = field => {
      return event => {
        const value = event.target.value
        this.setState(() => ({
          [field]: value
        }))
      }
    }

    return (
      <div>
        <H2>Belohnungen</H2>

        {query.package ? (
          <div>
            {query.package}
            {' '}
            <A href='/pledge' onClick={event => {
              event.preventDefault()
              Router.replace('/pledge', '/pledge', {shallow: true})
            }}>
              ändern
            </A>
            <Field label='Betrag'
              value={query.amount}
              onChange={event => {
                const url = {
                  pathname: '/pledge',
                  query: {
                    ...query,
                    amount: event.target.value
                  }
                }
                Router.replace(url, url, {shallow: true})
              }} />
          </div>
        ) : (
          <Accordion onSelect={params => {
            const url = {
              pathname: '/pledge',
              query: params
            }
            Router.replace(url, url, {shallow: true})
          }} />
        )}

        <H2>Deine Kontaktinformationen</H2>
        <p style={{marginTop: 0}}>
          <Field label='Dein Name'
            value={name}
            onChange={handleChange('name')} />
          <br />
          <Field label='Deine E-Mail'
            value={email}
            onChange={handleChange('email')} />
        </p>

        <H2>Zahlungsart auswählen</H2>
        <P>
          <label>
            <input type='radio' name='paymentMethod' />
            {' '}Banküberweisung
          </label><br />
          <label>
            <input type='radio' name='paymentMethod' />
            {' '}Mastercard
          </label><br />
          <label>
            <input type='radio' name='paymentMethod' />
            {' '}Visa
          </label><br />
          <label>
            <input type='radio' name='paymentMethod' />
            {' '}Postcard
          </label><br />
          <label>
            <input type='radio' name='paymentMethod' />
            {' '}Postfinance
          </label><br />
          <label>
            <input type='radio' name='paymentMethod' />
            {' '}Paypal
          </label><br />
          <label>
            <input type='radio' name='paymentMethod' />
            {' '}Twint
          </label><br />
        </P>

        <span style={{float: 'right'}}>
          <Button>Weiter</Button>
        </span>
        <br style={{clear: 'both'}} />
      </div>
    )
  }
}

Pledge.propTypes = {
  query: PropTypes.object.isRequired
}

export default withData(({url}) => (
  <App>
    <NarrowContainer>
      <H1>Mitmachen</H1>
      <Pledge query={url.query} />
    </NarrowContainer>
  </App>
))
