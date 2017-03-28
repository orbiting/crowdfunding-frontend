import React, {Component, PropTypes} from 'react'
import withData from '../lib/withData'
import App from '../components/App'
import Accordion from '../components/Accordion'
import Router from 'next/router'
import { gql, withApollo, graphql } from 'react-apollo'
import withMe from '../lib/withMe'
import SignIn from '../components/Auth/SignIn'

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
    this.state = {
      emailFree: true,
      isLoggingIn: false
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
    const {me} = nextProps
    const {email, name} = this.state

    if (me) {
      let nextState = {}
      if (!email) {
        nextState.email = me.email
      }
      if (!name) {
        nextState.name = me.name
      }
      this.setState(nextState)
    }
  }
  render () {
    const {
      name,
      email,
      emailFree,
      paymentMethod,
      cardNumber,
      cardMonth,
      cardYear,
      cardCVC
    } = this.state
    const {query, client, me} = this.props

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
          const {data} = await client.query({
            query: gql`
              query checkEmail($email: String!) {
                checkEmail(email: $email) {
                  free
                }
              }
            `,
            variables: { email: value }
          })
          this.setState(
            { emailFree: data.checkEmail.free }
          )
        }, 300)
      }
    }

    const choosePaymentMethod = field => {
      return event => {
        const value = event.target.value
        this.setState({paymentMethod: value})
      }
    }

    const submitPledge = event => {
      window.Stripe.setPublishableKey('pk_test_sgFutulewhWC8v8csVIXTMea')
      // TODO validate card fields
      window.Stripe.source.create({
        type: 'card',
        card: {
          number: cardNumber,
          cvc: cardCVC,
          exp_month: cardMonth,
          exp_year: cardYear
        }
      }, (status, source) => {
        console.log('response from stripe!')
        console.log(status)
        console.log(source)
        // TODO handle error
        if (status === 200) {
          // TODO implement 3D secure
          if (source.card.three_d_secure === 'required') {
            window.alert('Cards requiring 3D secure are not supported yet.')
          } else {
            const total = query.amount
            const pledgeOptions = JSON.parse(query.pledgeOptions)
            let user = {email, name}
            if (me) { // don't provide a user if logged in
              user = null
            }
            // TODO adapt for other paymentMethods
            const payment = {
              method: paymentMethod,
              stripeSourceId: source.id
            }
            this.props
              .mutate({ variables: { total, options: pledgeOptions, user, payment } })
              .then(({ data }) => {
                window.alert('Pledge successfull')
                console.log(data)
              })
              .catch(error => {
                window.alert('Pledge error')
                console.log(error)
              })
          }
        }
      })
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
          {me && (
            <strong>Du bist eingeloggt als:</strong>
          )}
          <Field label='Dein Name'
            value={name}
            disabled={me}
            onChange={handleChange('name')} />
          <br />
          <Field label='Deine E-Mail'
            value={email}
            disabled={me}
            onChange={handleEmailChange()} />
        </p>

        {(!emailFree && !me) && (
          <div key='needsLogin'>
            <p>Es existiert bereits ein Account mit dieser Email adresse bei uns. Um weiter zu fahren, müssen Sie sich erst einloggen. Klicken Sie auf Einloggen oder wählen sie eine andere email adresse.</p>
            <SignIn email={email} />
          </div>
        )}

        <script src='https://js.stripe.com/v2/' />
        {(emailFree || me) && (
          <span key='payment'>
            <H2>Zahlungsart auswählen</H2>
            <P>
              {PAYMENT_METHODS.map((pm) => (
                <span key={'span' + pm.key}>
                  <label>
                    <input type='radio' name='paymentMethod' onChange={choosePaymentMethod()} key={pm.key} value={pm.key} />
                    {' '}{pm.name}
                  </label><br />
                </span>
              ))}
            </P>

            {(paymentMethod === 'VISA' || paymentMethod === 'MASTERCARD') && (
              <span key='stripe'>
                <Field label='number' key='number' value={cardNumber} onChange={handleChange('cardNumber')} /> <br />
                <Field label='month' key='month' value={cardMonth} onChange={handleChange('cardMonth')} /> <br />
                <Field label='year' key='year' value={cardYear} onChange={handleChange('cardYear')} /> <br />
                <Field label='cvc' key='cvc' value={cardCVC} onChange={handleChange('cardCVC')} />
              </span>
            )}

            <Button onClick={submitPledge}>Weiter</Button>
          </span>
        )}

      </div>
    )
  }
}

Pledge.propTypes = {
  query: PropTypes.object.isRequired,
  client: React.PropTypes.object.isRequired,
  mutate: PropTypes.func.isRequired
}

const submitPledge = gql`
  mutation submitPledge($total: Int!, $options: [PackageOptionInput!]!, $user: PledgeUserInput, $payment: PledgePaymentInput!) {
    submitPledge(pledge: {total: $total, options: $options, user: $user, payment: $payment} ) {
      id
      total
      status
      packageId
      options {
        amount
        price
        templateId
      }
    }
  }
`

const PledgeWithSubmit = graphql(submitPledge)(withApollo(withMe(Pledge)))

export default withData(({url, session}) => (
  <App>
    <NarrowContainer>
      <H1>Mitmachen</H1>
      <PledgeWithSubmit query={url.query} session={session} />
    </NarrowContainer>
  </App>
))
