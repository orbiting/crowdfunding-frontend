import React, {Component, PropTypes} from 'react'
import SignIn from '../Auth/SignIn'
import { gql, graphql } from 'react-apollo'
import Router from 'next/router'
import FieldSet from '../FieldSet'
import {mergeFields} from '../../lib/utils/fieldState'
import {compose} from 'redux'
import {InlineSpinner} from '../Spinner'

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

const objectValues = (object) => Object.keys(object).map(key => object[key])
const simpleHash = (object, delimiter = '|') => {
  return objectValues(object).map(value => {
    if (value && typeof value === 'object') {
      return simpleHash(value, delimiter === '|' ? '$' : `$${delimiter}`)
    }
    return `${value}`
  }).join(delimiter)
}

class Submit extends Component {
  constructor (props) {
    super(props)
    this.state = {
      emailFree: true,
      values: {},
      errors: {},
      dirty: {},
      loading: false
    }
    this.amountRefSetter = (ref) => {
      this.amountRef = ref
    }
  }
  render () {
    const {
      emailFree,
      paymentMethod,
      paymentError,
      submitError,
      signInError,
      loading
    } = this.state
    const {me, user, total, options} = this.props

    const errors = objectValues(this.props.errors)
      .concat(objectValues(this.state.errors))
      .concat(!paymentMethod && 'Zahlungsart auswählen')
      .filter(Boolean)

    const payPledge = pledgeId => {
      const {values} = this.state

      this.setState(() => ({
        loading: 'bezahlen'
      }))
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
            loading: false,
            paymentError: source.error.message
          }))
          return
        }
        this.setState({
          loading: false,
          paymentError: undefined
        })

        // TODO implement 3D secure
        if (source.card.three_d_secure === 'required') {
          window.alert('Cards requiring 3D secure are not supported yet.')
          return
        }

        this.setState(() => ({
          loading: 'verarbeiten'
        }))
        this.props.pay({
          pledgeId,
          method: 'STRIPE',
          sourceId: source.id,
          pspPayload: JSON.stringify(source)
        })
          .then(({data}) => {
            const gotoMerci = () => {
              Router.push({
                pathname: '/merci',
                query: {
                  id: data.payPledge.id,
                  email: me ? me.email : user.email
                }
              })
            }
            if (!me) {
              this.props.signIn(user.email)
                .then(() => gotoMerci())
                .catch(error => {
                  console.error('signIn', error)
                  this.setState(() => ({
                    loading: false,
                    signInError: errorToString(error)
                  }))
                })
            } else {
              gotoMerci()
            }
          })
          .catch(error => {
            console.error('pay', error)
            this.setState(() => ({
              loading: false,
              paymentError: errorToString(error)
            }))
          })
      })
    }

    const submitPledge = () => {
      // TODO: check for client validation errors

      const variables = {
        total,
        options,
        user: me ? null : {
          ...user,
          birthday: '2017-05-31T23:59:59.999Z' // TODO: Remove!
        }
      }
      const hash = simpleHash(variables)

      if (!submitError && hash === this.state.pledgeHash) {
        payPledge(this.state.pledgeId)
        return
      }

      this.setState(() => ({
        loading: 'einreichen'
      }))
      this.props.submit(variables)
        .then(({data}) => {
          this.setState(() => ({
            loading: false,
            pledgeId: data.submitPledge.id,
            pledgeHash: hash,
            submitError: undefined
          }))
          payPledge(data.submitPledge.id)
        })
        .catch(error => {
          console.error('submit', error)
          const submitError = errorToString(error)

          // TODO: Better Backend Error
          if (submitError === 'a user with the email adress pledge.user.email already exists, login!') {
            this.setState(() => ({
              loading: false,
              emailFree: false
            }))
            return
          }

          this.setState(() => ({
            loading: false,
            pledgeId: undefined,
            pledgeHash: undefined,
            submitError
          }))
        })
    }

    return (
      <div>
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
                      showErrors: false,
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

        {(!emailFree && !me) && (
          <div style={{marginBottom: 40}}>
            <P>Sie müssen Ihre Email-Adresse verifizieren. Klicken Sie auf jetzt verifizieren oder wählen sie eine andere Email-Adresse.</P>
            <SignIn email={user.email} />
          </div>
        )}
        {!!submitError && (
          <P style={{color: colors.error}}>
            {submitError}
          </P>
        )}
        {!!paymentError && (
          <P style={{color: colors.error}}>
            {paymentError}
          </P>
        )}
        {!!signInError && (
          <P style={{color: colors.error}}>
            {signInError}
          </P>
        )}
        {loading ? (
          <div style={{textAlign: 'center'}}>
            <InlineSpinner />
            <br />
            {loading}
          </div>
        ) : (
          <div>
            {!!this.state.showErrors && errors.length > 0 && (
              <P style={{color: colors.error}}>
                Fehler<br />
                <ul>
                  {errors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </P>
            )}
            <div style={{opacity: errors.length ? 0.5 : 1}}>
              <Button
                onClick={() => {
                  if (errors.length) {
                    this.setState(() => ({showErrors: true}))
                  } else {
                    submitPledge()
                  }
                }}>
                Bezahlen
              </Button>
            </div>
          </div>
        )}
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
  submit: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired
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

const signInMutation = gql`
mutation signIn($email: String!) {
  signIn(email: $email) {
    phrase
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
  }),
  graphql(signInMutation, {
    props: ({mutate}) => ({
      signIn: email => mutate({variables: {email}})
    })
  })
)(Submit)

export default SubmitWithMutations
