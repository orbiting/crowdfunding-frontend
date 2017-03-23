import React from 'react'
import withData from '../lib/withData'
import App from '../components/App'
import Accordion from '../components/Accordion'

import {
  Button,
  H1, H2, Field, P,
  NarrowContainer
} from '@project-r/styleguide'

export default withData(({url}) => (
  <App>
    <NarrowContainer>
      <H1>Mitmachen</H1>
      <H2>Belohnungen</H2>
      <Accordion />

      <H2>Deine Kontaktinformationen</H2>
      <p style={{marginTop: 0}}>
        <Field label='Dein Name' />
        <br />
        <Field label='Deine E-Mail' />
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
    </NarrowContainer>
  </App>
))
