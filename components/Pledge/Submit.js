import React, {Component, PropTypes} from 'react'
import SignIn, {withSignIn} from '../Auth/SignIn'
import {withSignOut} from '../Auth/SignOut'

import { gql, graphql } from 'react-apollo'
import Router from 'next/router'
import FieldSet from '../FieldSet'
import {mergeFields} from '../../lib/utils/fieldState'
import {errorToString} from '../../lib/utils/errors'
import {compose} from 'redux'
import {InlineSpinner} from '../Spinner'
import withT from '../../lib/withT'
import {meQuery} from '../../lib/withMe'
import * as postfinance from './postfinance'
import * as paypal from './paypal'
import {pastPledgesQuery} from './queries'
import AddressForm, {COUNTRIES} from '../Me/AddressForm'

import {
  PUBLIC_BASE_URL,
  PF_FORM_ACTION,
  PAYPAL_FORM_ACTION,
  STRIPE_PUBLISHABLE_KEY
} from '../../constants'

import {
  H2, P, Button,
  colors
} from '@project-r/styleguide'

const PAYMENT_METHODS = [
  {disabled: false, key: 'PAYMENTSLIP'},
  {disabled: false, key: 'STRIPE'},
  {disabled: false, key: 'POSTFINANCECARD'},
  {disabled: false, key: 'PAYPAL'}
]

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
      emailVerify: false,
      values: {
        country: COUNTRIES[0],
        name: props.user.name
      },
      errors: {},
      dirty: {},
      loading: false
    }
    if (props.basePledge) {
      const variables = this.submitVariables(props.basePledge)
      const hash = simpleHash(variables)

      this.state.pledgeHash = hash
      this.state.pledgeId = props.basePledge.id
    }
    this.amountRefSetter = (ref) => {
      this.amountRef = ref
    }
    this.postFinanceFormRef = (ref) => {
      this.postFinanceForm = ref
    }
    this.payPalFormRef = (ref) => {
      this.payPalForm = ref
    }
  }
  componentWillReceiveProps (nextProps) {
    if (
      nextProps.user.name !== this.state.values.name &&
      !this.state.dirty.name
    ) {
      this.setState((state) => ({
        values: {
          ...state.values,
          name: nextProps.user.name
        }
      }))
    }
  }
  submitVariables (props) {
    const {user, total, options, reason} = props

    return {
      total,
      options,
      reason,
      user
    }
  }
  submitPledge () {
    const {t, me} = this.props

    const variables = this.submitVariables(this.props)
    if (me && me.email !== variables.user.email) {
      this.props.signOut().then(() => {
        this.submitPledge()
      })
    }

    const hash = simpleHash(variables)

    if (!this.state.submitError && hash === this.state.pledgeHash) {
      this.payPledge(this.state.pledgeId)
      return
    }

    this.setState(() => ({
      loading: t('pledge/submit/loading/submit')
    }))
    this.props.submit(variables)
      .then(({data}) => {
        if (data.submitPledge.emailVerify) {
          this.setState(() => ({
            loading: false,
            emailVerify: true
          }))
          return
        }
        this.setState(() => ({
          loading: false,
          pledgeId: data.submitPledge.pledgeId,
          pledgeHash: hash,
          submitError: undefined
        }))
        this.payPledge(
          data.submitPledge.pledgeId,
          data.submitPledge.userId
        )
      })
      .catch(error => {
        console.error('submit', error)
        const submitError = errorToString(error)

        this.setState(() => ({
          loading: false,
          pledgeId: undefined,
          pledgeHash: undefined,
          submitError
        }))
      })
  }
  payPledge (pledgeId, userId) {
    const {paymentMethod} = this.state

    if (paymentMethod === 'PAYMENTSLIP') {
      this.payWithPaymentSlip(pledgeId, userId)
    } else if (paymentMethod === 'POSTFINANCECARD') {
      this.payWithPostFinance(pledgeId, userId)
    } else if (paymentMethod === 'STRIPE') {
      this.payWithStripe(pledgeId, userId)
    } else if (paymentMethod === 'PAYPAL') {
      this.payWithPayPal(pledgeId, userId)
    }
  }
  payWithPayPal (pledgeId, userId) {
    const {t} = this.props

    this.setState(() => ({
      loading: t('pledge/submit/loading/paypal'),
      pledgeId: pledgeId,
      userId: userId
    }), () => {
      this.payPalForm.submit()
    })
  }
  payWithPostFinance (pledgeId, userId) {
    const {t} = this.props

    this.setState(() => ({
      loading: t('pledge/submit/loading/postfinance'),
      pledgeId: pledgeId,
      userId: userId
    }), () => {
      this.postFinanceForm.submit()
    })
  }
  payWithPaymentSlip (pledgeId, userId) {
    const {values} = this.state
    this.pay({
      pledgeId,
      method: 'PAYMENTSLIP',
      paperInvoice: values.paperInvoice || false,
      address: {
        name: values.name,
        line1: values.line1,
        line2: values.line2,
        postalCode: values.postalCode,
        city: values.city,
        country: values.country
      }
    })
  }
  pay (data) {
    const {t, me, user} = this.props

    this.setState(() => ({
      loading: t('pledge/submit/loading/pay')
    }))
    this.props.pay(data)
      .then(({data}) => {
        const gotoMerci = (phrase) => {
          Router.push({
            pathname: '/merci',
            query: {
              id: data.payPledge.pledgeId,
              email: user.email,
              phrase
            }
          })
        }
        if (!me) {
          this.props.signIn(user.email)
            .then(({data}) => gotoMerci(data.signIn.phrase))
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
  }
  payWithStripe (pledgeId) {
    const {t, total} = this.props
    const {values} = this.state

    this.setState(() => ({
      loading: t('pledge/submit/loading/stripe')
    }))
    window.Stripe.setPublishableKey(STRIPE_PUBLISHABLE_KEY)
    window.Stripe.source.create({
      type: 'card',
      currency: 'CHF',
      amount: total,
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

      if (source.card.three_d_secure === 'required') {
        this.setState(() => ({
          loading: t('pledge/submit/loading/stripe/3dsecure')
        }))
        window.Stripe.source.create({
          type: 'three_d_secure',
          currency: 'CHF',
          amount: total,
          three_d_secure: {
            card: source.id
          },
          redirect: {
            return_url: `${PUBLIC_BASE_URL}/pledge?pledgeId=${pledgeId}&stripe=1`
          }
        }, (status, source3d) => {
          console.log('stripe 3d secure', status, source3d)
          if (status !== 200) {
            this.setState(() => ({
              loading: false,
              paymentError: t.first([
                `pledge/3dsecure/${source3d.error.code}`,
                'pledge/3dsecure/unkown'
              ])
            }))
            return
          }
          if (source3d.redirect.status === 'succeeded') {
            // can charge immediately
            this.pay({
              pledgeId,
              method: 'STRIPE',
              sourceId: source3d.id,
              pspPayload: JSON.stringify(source3d)
            })
          } else if (source3d.redirect.status === 'failed') {
            // no support or bank 3D Secure down
            this.setState(() => ({
              loading: false,
              paymentError: t('pledge/3dsecure/redirect/failed')
            }))
          } else {
            window.location = source3d.redirect.url
          }
        })

        return
      }

      this.pay({
        pledgeId,
        method: 'STRIPE',
        sourceId: source.id,
        pspPayload: JSON.stringify(source)
      })
    })
  }
  render () {
    const {
      emailVerify,
      paymentMethod,
      paymentError,
      submitError,
      signInError,
      loading
    } = this.state
    const {me, user, t} = this.props

    const errors = objectValues(this.props.errors)
      .concat(objectValues(this.state.errors))
      .concat(!paymentMethod && t('pledge/submit/payMethod/error'))
      .filter(Boolean)

    return (
      <div>
        <H2>{t('pledge/submit/payMethod/title')}</H2>
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
                    this.setState((state) => {
                      const next = {
                        showErrors: false,
                        paymentMethod: value
                      }
                      if (value !== state.paymentMethod) {
                        next.errors = {}
                      }

                      return next
                    })
                  }}
                  value={pm.key} />
                {' '}{t(`pledge/submit/pay/method/${pm.key}`)}
              </label><br />
            </span>
          ))}
        </P>

        {(paymentMethod === 'PAYMENTSLIP') && (
          <div>
            <P>{t('pledge/submit/paymentslip/title')}</P>
            <AddressForm
              values={this.state.values}
              errors={this.state.errors}
              dirty={this.state.dirty}
              onChange={(fields) => {
                this.setState(mergeFields(fields))
              }} />
            <br />
            <P>
              <label>
                <input
                  type='checkbox'
                  checked={this.state.values.paperInvoice || false}
                  onChange={(event) => {
                    const checked = event.target.checked
                    this.setState((state) => ({
                      values: {
                        ...state.values,
                        paperInvoice: checked
                      }
                    }))
                  }} />
                {' '}{t('pledge/submit/paymentslip/paperInvoice')}
              </label>
            </P>
            <br />
          </div>
        )}
        {(paymentMethod === 'STRIPE') && (
          <div>
            <FieldSet
              values={this.state.values}
              errors={this.state.errors}
              dirty={this.state.dirty}
              fields={[
                {
                  label: t('pledge/submit/stripe/card/label'),
                  name: 'cardNumber',
                  mask: '1111 1111 1111 1111',
                  validator: (value) => (
                    (
                      !value &&
                      t('pledge/submit/stripe/card/error/empty')
                    ) || (
                      !window.Stripe.card.validateCardNumber(value) &&
                      t('pledge/submit/stripe/card/error/invalid')
                    )
                  )
                },
                {
                  label: t('pledge/submit/stripe/month/label'),
                  name: 'cardMonth'
                },
                {
                  label: t('pledge/submit/stripe/year/label'),
                  name: 'cardYear'
                },
                {
                  label: t('pledge/submit/stripe/cvc/label'),
                  name: 'cardCVC',
                  validator: (value) => (
                    (
                      !value &&
                      t('pledge/submit/stripe/cvc/error/empty')
                    ) || (
                      !window.Stripe.card.validateCVC(value) &&
                      t('pledge/submit/stripe/cvc/error/invalid')
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
                    nextState.errors.cardMonth = t('pledge/submit/stripe/month/error/invalid')
                    nextState.errors.cardYear = t('pledge/submit/stripe/year/error/invalid')
                  } else {
                    nextState.errors.cardMonth = (
                      !month && t('pledge/submit/stripe/month/error/empty')
                    )
                    nextState.errors.cardYear = (
                      !year && t('pledge/submit/stripe/year/error/empty')
                    )
                  }

                  return nextState
                })
              }} />
            <br /><br />
          </div>
        )}
        {(paymentMethod === 'POSTFINANCECARD') && (
          <form ref={this.postFinanceFormRef} method='post' action={PF_FORM_ACTION}>
            {
              postfinance.getParams({
                alias: this.state.userId,
                orderId: this.state.pledgeId,
                amount: this.props.total
              }).map(param => (
                <input key={param.key}
                  type='hidden'
                  name={param.key}
                  value={param.value} />
              ))
            }
          </form>
        )}
        {(paymentMethod === 'PAYPAL') && (
          <form ref={this.payPalFormRef} method='post' action={PAYPAL_FORM_ACTION}>
            {
              paypal.getParams({
                itemName: this.state.pledgeId,
                amount: this.props.total
              }).map(param => (
                <input key={param.key}
                  type='hidden'
                  name={param.key}
                  value={param.value} />
              ))
            }
          </form>
        )}

        {(emailVerify && !me) && (
          <div style={{marginBottom: 40}}>
            <P>{t('pledge/submit/emailVerify/note')}</P>
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
              <div style={{color: colors.error, marginBottom: 40}}>
                {t('pledge/submit/error/title')}<br />
                <ul>
                  {errors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            <div style={{opacity: errors.length ? 0.5 : 1}}>
              <Button
                onClick={() => {
                  if (errors.length) {
                    this.props.onError()
                    this.setState((state) => {
                      const dirty = {
                        ...state.dirty
                      }
                      Object.keys(state.errors).forEach(field => {
                        if (state.errors[field]) {
                          dirty[field] = true
                        }
                      })
                      return {
                        dirty,
                        showErrors: true
                      }
                    })
                  } else {
                    this.submitPledge()
                  }
                }}>
                {t('pledge/submit/button/pay')}
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
  errors: PropTypes.object.isRequired,
  onError: PropTypes.func.isRequired
}

const submitPledge = gql`
  mutation submitPledge($total: Int!, $options: [PackageOptionInput!]!, $user: UserInput!, $reason: String) {
    submitPledge(pledge: {total: $total, options: $options, user: $user, reason: $reason}) {
      pledgeId
      userId
      emailVerify
    }
  }
`

const payPledge = gql`
  mutation payPledge($pledgeId: ID!, $method: PaymentMethod!, $sourceId: String, $pspPayload: String, $address: AddressInput, $paperInvoice: Boolean) {
    payPledge(pledgePayment: {pledgeId: $pledgeId, method: $method, sourceId: $sourceId, pspPayload: $pspPayload, address: $address, paperInvoice: $paperInvoice}) {
      pledgeId
      userId
      emailVerify
    }
  }
`

export const withPay = Component => {
  const EnhancedComponent = compose(
    graphql(payPledge, {
      props: ({mutate}) => ({
        pay: variables => mutate({
          variables,
          refetchQueries: [{
            query: pastPledgesQuery
          }]
        })
      })
    }),
    withSignIn
  )(Component)
  return props => <EnhancedComponent {...props} />
}

const SubmitWithMutations = compose(
  graphql(submitPledge, {
    props: ({mutate}) => ({
      submit: variables => mutate({
        variables,
        refetchQueries: [{
          query: meQuery
        }]
      })
    })
  }),
  withSignOut,
  withPay,
  withT
)(Submit)

export default SubmitWithMutations
