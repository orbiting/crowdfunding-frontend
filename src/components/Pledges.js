import React, {Component, PropTypes} from 'react'

import gql from 'graphql-tag'
import {graphql} from 'react-apollo'
import {Link} from '../../routes'

const query = gql`
query {pledges {
  id
  total
  createdAt
  status
  options {
    id
    price
    reward {
      ... on MembershipType {name}
      ... on Goodie {name}
    }
  }
}}
`

class Pledges extends Component {
  constructor (props) {
    super(props)
    this.state = {
    }
  }

  render() {
    const {pledges, loading } = this.props

    if (loading) {
      return <span>...</span>
    }

    return (
      <div>
        <h2>Your pledges</h2>
        <ul>
          {pledges.map( (pledge, i) => (
            <li key={pledge.id} >
              <h4>Pledge: {pledge.id}</h4>
              CHF {pledge.total/100.0}<br/>
              createdAt: {pledge.createdAt}<br/>
              status: {pledge.status}<br/>
              {pledge.options.map( (option, ii) => (
                <p key={option.id}>
                  <strong>{option.reward.name}</strong> CHF {option.price/100.0}<br/>
                  option.id: {option.id}<br/>
                </p>
              ))}
            </li>
          ))}
        </ul>
      </div>
    )
  }
}

const PledgesWithQuery = graphql(query, {
  props: ({data}) => {
    const pledges = data.pledges
      ? data.pledges
      : []

    return {
      loading: data.loading,
      error: data.error,
      pledges
    }
  }
})(Pledges)

export default PledgesWithQuery
