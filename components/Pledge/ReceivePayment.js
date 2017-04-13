import React, {Component} from 'react'
import {gql, graphql} from 'react-apollo'
import Router from 'next/router'

import withT from '../../lib/withT'
import withMe from '../../lib/withMe'
import Loader from '../Loader'
import {errorToString} from '../../lib/utils/errors'
import {compose} from 'redux'

import {withPay} from './Submit'
import PledgeForm from './Form'
import {
  STRIPE_PUBLISHABLE_KEY
} from '../../constants'

const pledgeQuery = gql`
query($pledgeId: ID!) {
  pledge(id: $pledgeId) {
    id
    package {
      name
    }
    options {
      templateId
      amount
    }
    total
    donation
    reason
    user {
      name
      email
    }
  }
}
`

class PledgeReceivePayment extends Component {
  constructor (props, context) {
    super(props, context)

    const {query, t} = props

    const state = this.state = {}
    if (query.orderID) {
      if (query.STATUS === '5') {
        state.processing = true
        state.action = {
          method: 'pay',
          argument: {
            method: 'POSTFINANCECARD',
            pspPayload: JSON.stringify(query)
          }
        }
      } else {
        state.receiveError = t('pledge/recievePayment/error')
        // ToDo: handle errors and recommend specific user action
        // possible action: retry, choose different method, contact us

        // https://e-payment-postfinance.v-psp.com/de/guides/user%20guides/statuses-and-errors
        // https://e-payment-postfinance.v-psp.com/de/guides/integration%20guides/possible-errors
      }
    }
    if (query.item_name) {
      if (query.st === 'Completed') {
        state.processing = true
        state.action = {
          method: 'pay',
          argument: {
            method: 'PAYPAL',
            pspPayload: JSON.stringify(query)
          }
        }
      } else {
        // see cancel_return in ./paypal.js
        switch (query.st) {
          case 'Cancel':
            state.receiveError = t('pledge/recievePayment/paypal/cancel')
            break
          // ToDo: handle errors and recommend specific user action
          // possible action: retry, choose different method, contact us

          // https://developer.paypal.com/docs/classic/ipn/integration-guide/IPNandPDTVariables/#id091EB04C0HS
          // - payment_status
          default:
            state.receiveError = t('pledge/recievePayment/error')
        }
      }
    }
    if (query.pledgeId) {
      state.processing = true
      state.action = {
        method: 'checkStripeSource',
        argument: {
          query: {
            ...query
          }
        }
      }
    }

    this.queryFromPledge = () => {
      const {pledge} = this.props

      const query = {
        package: pledge.package.name
      }
      if (pledge.donation < 0) {
        query.userPrice = '1'
      }
      return query
    }
  }
  checkStripeSource ({query}) {
    const {t} = this.props

    window.Stripe.setPublishableKey(STRIPE_PUBLISHABLE_KEY)
    window.Stripe.source.get(
      query.source,
      query.client_secret,
      (status, source) => {
        if (source.status === 'chargeable') {
          this.pay({
            method: 'STRIPE',
            pspPayload: JSON.stringify(source),
            sourceId: source.id
          })
        } else {
          this.setState(() => ({
            processing: false,
            receiveError: t('pledge/recievePayment/3dsecure/failed')
          }))
        }
      }
    )
  }
  pay ({method, pspPayload, sourceId}) {
    const {me, pledge, pledgeId} = this.props

    this.props.pay({
      pledgeId,
      method,
      pspPayload,
      sourceId
    })
      .then(({data}) => {
        const gotoMerci = () => {
          Router.push({
            pathname: '/merci',
            query: {
              id: data.payPledge.pledgeId,
              email: pledge.user.email
            }
          })
        }
        if (!me) {
          this.props.signIn(pledge.user.email)
            .then(() => gotoMerci())
            .catch(error => {
              console.error('signIn', error)
              this.setState(() => ({
                processing: false,
                receiveError: errorToString(error)
              }))
            })
        } else {
          gotoMerci()
        }
      })
      .catch(error => {
        console.error('pay', error)
        this.setState(() => ({
          processing: false,
          receiveError: errorToString(error)
        }))
      })
  }
  componentDidMount () {
    // const {pledge} = this.props
    // if (!pledge) {
    //   return
    // }
    // const url = {
    //   pathname: '/pledge',
    //   query: this.queryFromPledge()
    // }
    // Router.replace(url, url, {shallow: true})

    const {action} = this.state
    if (action) {
      this[action.method](action.argument)
    }
  }
  render () {
    const {loading, error, pledge, query, t} = this.props
    const {processing, receiveError} = this.state

    if (processing) {
      return <Loader loading message={t('pledge/submit/loading/pay')} />
    }

    return (
      <Loader loading={loading} error={error} render={() => {
        const queryWithData = {
          ...query,
          ...this.queryFromPledge()
        }

        return (
          <PledgeForm
            receiveError={receiveError}
            query={queryWithData}
            pledge={pledge} />
        )
      }} />
    )
  }
}

const PledgeReceivePaymentById = compose(
  withT,
  graphql(pledgeQuery, {
    props: ({ data, ownProps }) => {
      let error = data.error
      if (data.pledge === null) {
        error = ownProps.t('pledge/recievePayment/noPledge')
      }
      return {
        loading: data.loading,
        error,
        pledge: data.pledge
      }
    }
  }),
  withPay,
  withMe
)(PledgeReceivePayment)

export default PledgeReceivePaymentById
