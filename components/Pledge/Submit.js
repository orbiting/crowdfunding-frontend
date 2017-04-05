import React, {Component, PropTypes} from 'react'
import SignIn from '../Auth/SignIn'
import { gql, graphql } from 'react-apollo'
import Router from 'next/router'
import FieldSet from '../FieldSet'
import {mergeFields} from '../../lib/utils/fieldState'
import {compose} from 'redux'

import {
  H2, P, Button,
  colors
} from '@project-r/styleguide'

const PAYMENT_METHODS = [
  {disabled: true, key: 'PAYMENTSLIP', name: 'Einzahlungsschein'},
  {disabled: false, key: 'STRIPE', name: 'Visa/MasterCard'},
  {disabled: true, key: 'POSTFINANCECARD', name: 'PostfFinance Card'},
  {disabled: true, key: 'PAYPAL', name: 'PayPal'}
]

const errorToString = error => error.graphQLErrors && error.graphQLErrors.length
  ? error.graphQLErrors.map(e => e.message).join(', ')
  : error.toString()

class Submit extends Component {
  constructor (props) {
    super(props)
    this.state = {
      emailFree: true,
      values: {},
      errors: {},
      dirty: {}
    }
    this.amountRefSetter = (ref) => {
      this.amountRef = ref
    }
  }
  render () {
    const {
      email,
      emailFree,
      paymentMethod,
      paymentError,
      submitError
    } = this.state
    const {me, user, total, options} = this.props

    const payPledge = pledgeId => {
      const {values} = this.state

      window.Stripe.setPublishableKey('pk_test_sgFutulewhWC8v8csVIXTMea')
      window.Stripe.source.create({
        type: 'card',
        currency: 'CHF',
        usage: 'reusable',
        card: {
          number: values.cardNumber,
          cvc: values.cardCVC,
          exp_month: values.cardMonth,
          exp_year: values.cardYear
        }
      }, (status, source) => {
        console.log('stripe', status, source)
        if (status !== 200) {
          // source.error.type
          // source.error.param
          // source.error.message
          // see https://stripe.com/docs/api#errors
          this.setState(() => ({
            paymentError: source.error.message
          }))
          return
        }
        this.setState({
          paymentError: undefined
        })

        // TODO implement 3D secure
        if (source.card.three_d_secure === 'required') {
          window.alert('Cards requiring 3D secure are not supported yet.')
          return
        }

        this.props.pay({
          pledgeId,
          method: 'STRIPE',
          sourceId: source.id,
          pspPayload: JSON.stringify(source)
        })
          .then(({data}) => {
            Router.push({
              pathname: '/merci',
              query: {
                id: data.payPledge.id,
                email: email
              }
            })
          })
          .catch(error => {
            console.error('pay', error)
            this.setState(() => ({
              paymentError: errorToString(error)
            }))
          })
      })
    }

    const submitPledge = () => {
      // TODO: check for client validation errors

      this.props.submit({
        total,
        options,
        user: me || {
          ...user,
          birthday: '2017-05-31T23:59:59.999Z' // TODO: Remove!
        }
      })
        .then(({ data }) => {
          this.setState(() => ({
            pledgeId: data.submitPledge.id,
            submitError: undefined
          }))
          payPledge(data.submitPledge.id)
        })
        .catch(error => {
          console.error('submit', error)
          this.setState(() => ({
            pledgeId: undefined,
            submitError: errorToString(error)
          }))
        })
    }

    return (
      <div>
        {(!emailFree && !me) && (
          <div>
            <p>Es existiert bereits ein Account mit dieser Email adresse bei uns. Um weiter zu fahren, müssen Sie sich erst einloggen. Klicken Sie auf Einloggen oder wählen sie eine andere email adresse.</p>
            <SignIn email={email} />
          </div>
        )}

        <H2>Zahlungsart auswählen</H2>
        <P>
          {PAYMENT_METHODS.map((pm) => (
            <span key={pm.key} style={{opacity: pm.disabled ? 0.5 : 1}}>
              <label>
                <input
                  type='radio'
                  name='paymentMethod'
                  disabled={pm.disabled}
                  onChange={(event) => {
                    const value = event.target.value
                    this.setState(() => ({
                      paymentMethod: value
                    }))
                  }}
                  value={pm.key} />
                {' '}{pm.name}
              </label><br />
            </span>
          ))}
        </P>

        {(paymentMethod === 'STRIPE') && (
          <div>
            <FieldSet
              values={this.state.values}
              errors={this.state.errors}
              dirty={this.state.dirty}
              fields={[
                {
                  label: 'Kreditkarten-Nummer',
                  name: 'cardNumber',
                  mask: '1111 1111 1111 1111',
                  validator: (value) => (
                    (
                      !value &&
                      'Kreditkarten-Nummer fehlt'
                    ) || (
                      !window.Stripe.card.validateCardNumber(value) &&
                      'Kreditkarten-Nummer ungültig'
                    )
                  )
                },
                {
                  label: 'Ablauf Monat',
                  name: 'cardMonth'
                },
                {
                  label: 'Ablauf Jahr',
                  name: 'cardYear'
                },
                {
                  label: 'Prüfnummer (CVC)',
                  name: 'cardCVC',
                  validator: (value) => (
                    (
                      !value &&
                      'Prüfnummer (CVC) fehlt'
                    ) || (
                      !window.Stripe.card.validateCVC(value) &&
                      'Prüfnummer (CVC) ungültig'
                    )
                  )
                }
              ]}
              onChange={(fields) => {
                this.setState((state) => {
                  const nextState = mergeFields(fields)(state)

                  const month = nextState.values.cardMonth
                  const year = nextState.values.cardYear

                  if (
                    year && month &&
                    nextState.dirty.cardMonth &&
                    nextState.dirty.cardYear &&
                    !window.Stripe.card.validateExpiry(month, year)
                  ) {
                    nextState.errors.cardMonth = 'Ablauf Monat ungültig'
                    nextState.errors.cardYear = 'Ablauf Jahr ungültig'
                  } else {
                    nextState.errors.cardMonth = (
                      !month && 'Ablauf Monat fehlt'
                    )
                    nextState.errors.cardYear = (
                      !year && 'Ablauf Jahr fehlt'
                    )
                  }

                  return nextState
                })
              }} />
            <br /><br />
          </div>
        )}

        {!!paymentError && (
          <P style={{color: colors.error}}>
            {paymentError}
          </P>
        )}
        {!!submitError && (
          <P style={{color: colors.error}}>
            {submitError}
          </P>
        )}
        <Button onClick={submitPledge}>Weiter</Button>
      </div>
    )
  }
}

Submit.propTypes = {
  me: PropTypes.object,
  user: PropTypes.object,
  total: PropTypes.number,
  reason: PropTypes.string,
  options: PropTypes.array.isRequired,
  submit: PropTypes.func.isRequired
}

const submitPledge = gql`
  mutation submitPledge($total: Int!, $options: [PackageOptionInput!]!, $user: UserInput) {
    submitPledge(pledge: {total: $total, options: $options, user: $user}) {
      id
    }
  }
`

const payPledge = gql`
  mutation payPledge($pledgeId: ID!, $method: PaymentMethod!, $sourceId: String, $pspPayload: String!) {
    payPledge(pledgePayment: {pledgeId: $pledgeId, method: $method, sourceId: $sourceId, pspPayload: $pspPayload}) {
      id
    }
  }
`

const SubmitWithMutations = compose(
  graphql(submitPledge, {
    props: ({mutate}) => ({
      submit: variables => mutate({variables})
    })
  }),
  graphql(payPledge, {
    props: ({mutate}) => ({
      pay: variables => mutate({variables})
    })
  })
)(Submit)

export default SubmitWithMutations
