import React, {Component} from 'react'

const fetch = require('isomorphic-fetch')
const queryString = require('query-string')

class PayButtons extends Component {
  constructor (props) {
    super(props)
    this.state = {
      method: null
    }
  }

  submitPay(method) {
    this.setState( {method} )
    //FIXME
    setTimeout( () => {
      this.refs.form.submit()
    }, 1)
  }

  render() {
    const { pledge } = this.props
    const { method } = this.state
    const parameters = {
      /*
      success_url: "https://raisenow.project-r.construction/redirect/success",
      error_url: "https://raisenow.project-r.construction/redirect/error",
      cancel_url: "https://raisenow.project-r.construction/redirect/cancel",
      css_url: "https://raisenow.project-r.construction/raisenow.css",
      */
      success_url: "http://localhost:3003",
      error_url: "http://localhost:3003",
      cancel_url: "http://localhost:3003",
      test_mode: "true",
      mobile_mode: "false",
      currency: "chf",
      language: "de",
      //payment_method: "vis",
      amount: pledge.total,
      stored_PROJECTR_pledgeId: pledge.id,
      stored_customer_email: "patrick.recher@project-r.construction", //FIXME
      /*
      recurring: "true",
      recurring_interval: "daily",
      stored_customer_email: "patrick.recher@project-r.construction",
      create_payment_source: "true",
      stored_customer_token: "0d08142ed42be80dfb0406367c702b003deef4fe",
      */
    }
    const methods = {
      vis: 'Visa',
      eca: 'Master Card',
      pfc: 'PostFinance Card',
      pef: 'PostFinance eFinance',
      pex: 'Paypal',
      twi: 'Twint',
    }
    return (
      <div>
				<form ref="form" method="post" action="https://api.raisenow.com/epayment/api/step/pay/merchant/pr-k83qdxe" >
          {Object.keys(parameters).map( (key) => {
						const value = parameters[key]
						return ( <input type="hidden" name={key} key={key} value={value}/> )
          })}

          {method ? ( <input type="hidden" name="payment_method" key="payment_method" value={method}/> ) : (false) }

          {Object.keys(methods).map( (key) => {
						const value = methods[key]
            return ( <button type="button" key={key} onClick={ () => this.submitPay(key)}>{value}</button> )
          })}
        </form>
      </div>
    )
  }
}

export default PayButtons
