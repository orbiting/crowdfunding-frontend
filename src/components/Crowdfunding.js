import React, {Component, PropTypes} from 'react'

import gql from 'graphql-tag'
import {graphql} from 'react-apollo'
import {Link} from '../../routes'

const query = gql`
query {crowdfundings {
  id
  name
  packages {
    id
    name
    options {
      id
      price
      reward {
        ... on MembershipType {
          id
          name
        }
        ... on Goodie {
          id
          name
        }
      }
    }
  }
}}
`

class Crowdfunding extends Component {
  constructor (props) {
    super(props)
    this.state = {
      pledgeOptions: [],
      total: 0
    }
  }

  chooseOption(option, event) {
    const { pledgeOptions } = this.state

		// upsert pledgeOption
    let pledgeOption = pledgeOptions.find( (po) => { return po.templateId == option.id })
    if(pledgeOption) {
      pledgeOption.amount += 1
    } else {
      pledgeOption = {
        templateId: option.id,
        price: option.price,
        amount: 1
      }
      pledgeOptions.push(pledgeOption)
    }

		// calc total
    let total = 0
    pledgeOptions.forEach( (po) => { total += (po.price*po.amount) } )

    this.setState( {total, pledgeOptions} )
  }

  submitPledge() {
    const {total, pledgeOptions} = this.state

    this.props.mutate({ variables: { total, options: pledgeOptions } })
      .then(({ data }) => {
        console.log('got data', data)
      }).catch((error) => {
        console.log('there was an error sending the query', error)
      })
  }

  render() {
    const {crowdfunding, loading } = this.props
    const {total, pledgeOptions} = this.state

    if (loading) {
      return <span>...</span>
    }

    return (
      <div>
        <h2>{crowdfunding.name}</h2>

        <h3>Cart</h3>
        <strong>Total: {total/100.0}</strong>
        {pledgeOptions.map( (option, ii) => (
          <p key={1000+ii}>
            {option.templateId} - {option.amount}
          </p>
        ))}
        <button onClick={this.submitPledge.bind(this)}>Submit</button>

        <h3>Offers</h3>
        <ul>
          {crowdfunding.packages.map( (package_, i) => (
            <li key={i} >
              <h3>{package_.name}</h3>
              {package_.options.map( (option, ii) => (
                <p key={i*10+ii} onClick={() => this.chooseOption(option)}>
                  <strong>{option.reward.name}</strong> CHF {option.price/100.0}<br/>
                  option.id: {option.id}<br/>
                  reward.id: {option.reward.id}<br/>
                </p>
              ))}
            </li>
          ))}
        </ul>
      </div>
    )
  }
}

Crowdfunding.propTypes = {
  mutate: PropTypes.func.isRequired,
};

const submitPledge = gql`
  mutation submitPledge($total: Int!, $options: [PackageOptionInput!]!) {
    submitPledge(pledge: {total: $total, options: $options} ) {
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

const CrowdfundingWithQuery = graphql(query, {
  props: ({data}) => {
    const crowdfunding = data.crowdfundings
      ? data.crowdfundings[0]
      : {}

    return {
      loading: data.loading,
      error: data.error,
      crowdfunding
    }
  }
})(Crowdfunding)

const CrowdfundingWithMutation = graphql(submitPledge)(CrowdfundingWithQuery);


export default CrowdfundingWithMutation
