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
      state.paymentMethod = 'POSTFINANCECARD'

      if (query.STATUS === '5') {
        state.processing = true
      } else {
        state.receiveError = t('pledge/recievePayment/error')
        // ToDo: handle errors and recommend specific user action
        // possible action: retry, choose different method, contact us

        // https://e-payment-postfinance.v-psp.com/de/guides/user%20guides/statuses-and-errors
        // https://e-payment-postfinance.v-psp.com/de/guides/integration%20guides/possible-errors
      }
      state.pspPayload = JSON.stringify(query)
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

    const {processing} = this.state
    if (processing) {
      const {
        paymentMethod, pspPayload
      } = this.state
      const {me, pledge} = this.props

      this.props.pay({
        pledgeId: this.props.pledgeId,
        method: paymentMethod,
        pspPayload
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
