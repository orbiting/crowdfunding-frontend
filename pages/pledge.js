import React, {Component, PropTypes} from 'react'
import withData from '../lib/withData'
import App from '../components/App'
import Accordion from '../components/Accordion'
import Router from 'next/router'
import { gql, withApollo } from 'react-apollo'
import withSession from '../lib/auth/with-session'
import Session from '../lib/auth/session'

import {
  Button,
  H1, H2, Field, P, A,
  NarrowContainer
} from '@project-r/styleguide'

const PAYMENT_METHODS = [
  { key: 'EZS', name: 'Einzahlungsschein' },
  { key: 'VISA', name: 'Visa' },
  { key: 'MASTERCARD', name: 'MasterCard' },
  { key: 'PFC', name: 'PostfFinance Card' }
]
let CHECK_EMAIL_TIMEOUT = null

class Pledge extends Component {
  constructor (props) {
    super(props)
    const session = this.props.session || {}
    const isLoggedIn = (!!session.user)
    this.state = {
      emailFree: true,
      isLoggingIn: false,
      isLoggedIn
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
  componentWillReceiveProps (nextProps) {
    const {session } = this.props
    // set email & name if logged in
    if (session && session.user && !email) {
      // TODO name
      this.setState({email: session.user.email})
    }
  }
  render () {
    const {
      name,
      email,
      emailFree,
      isLoggingIn,
      isLoggedIn
    } = this.state
    const {query, client, session } = this.props


    const handleChange = field => {
      return event => {
        const value = event.target.value
        this.setState(() => ({
          [field]: value
        }))
      }
    }
    const handleEmailChange = field => {
      return event => {
        const value = event.target.value
        this.setState({email: value})
        // check if email is untaken or we need to login
        // throttle
        if (CHECK_EMAIL_TIMEOUT) { clearTimeout(CHECK_EMAIL_TIMEOUT) }
        CHECK_EMAIL_TIMEOUT = setTimeout(async () => {
          const {loading, data} = await client.query({
            query: gql`
              query checkEmail($email: String!) {
                checkEmail(email: $email) {
                  free
                }
              }
            `,
            variables: { email: value }
          })
          console.log('free: ' + data.checkEmail.free)
          this.setState(
            { emailFree: data.checkEmail.free }
          )
        }, 300)
      }
    }

    const continueWithLogin = field => {
      return async (event) => {
        this.setState({isLoggingIn: true })
        const session = new Session()
        await session.signin(this.state.email)
        try {
          const authenticatedSession = await session.authenticatedSession()
          this.setState({
            isLoggingIn: false,
            isLoggedIn: true
          })
        } catch (e) {
          console.log('timeout')
          this.setState({isLoggingIn: false })
        }
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
              ref={this.amountRefSetter}
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
              .then(() => {
                window.scrollTo(0, 0)
                if (this.amountRef && this.amountRef.input) {
                  this.amountRef.input.focus()
                }
              })
          }} />
        )}

        <H2>Deine Kontaktinformationen</H2>
        <p style={{marginTop: 0}}>
          {isLoggedIn && (
            <strong>Du bist eingeloggt als:</strong>
          )}
          <Field label='Dein Name'
            value={name}
            disabled={isLoggedIn}
            onChange={handleChange('name')} />
          <br />
          <Field label='Deine E-Mail'
            value={email}
            disabled={isLoggedIn}
            onChange={handleEmailChange()} />
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
        {(!emailFree && !isLoggedIn && !isLoggingIn) && (
          <div key='needsLogin'>
            <p>Es existiert bereits ein Account mit dieser Email adresse bei uns. Um weiter zu fahren, müssen Sie sich erst einloggen. Klicken Sie auf Einloggen oder wählen sie eine andere email adresse.</p>
            <Button onClick={continueWithLogin()}>Einloggen</Button>
          </div>
        )}
        {(!emailFree && !isLoggedIn && isLoggingIn) && (
          <div key='waitingForLogin'>
            Wir haben Ihnen eine email geschickt. Bitte klicken Sie den Link darin an um einzuloggen.
          </div>
        )}

        {(emailFree || isLoggedIn) && (
          <span key='payment'>
            <H2>Zahlungsart auswählen</H2>

            <Button onClick={submitPledge}>Weiter</Button>
          </span>
        )}

      </div>
    )
  }
}

Pledge.propTypes = {
  query: PropTypes.object.isRequired,
  client: PropTypes.object.isRequired,
  session: PropTypes.object.isRequired
}

const PledgeWithApollo = withApollo(Pledge)

export default withSession(withData(({url, session}) => (
  <App>
    <NarrowContainer>
      <H1>Mitmachen</H1>
      <PledgeWithApollo query={url.query} session={session} />
    </NarrowContainer>
  </App>
)))
