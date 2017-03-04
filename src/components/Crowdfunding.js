import React from 'react'

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

const Crowdfunding = ({crowdfunding}) => (
  <div>
    <h2>{crowdfunding.name}</h2>
    <ul>
      {crowdfunding.packages.map( (package_, i) => (
        <li key={i}>
          <h3>{package_.name}</h3>
          {package_.options.map( (option, i) => (
            <p>
              <strong>{option.reward.name}</strong>&nbsp; CHF {option.price/100.0}<br/>
              option.id: {option.id}<br/>
              reward.id: {option.reward.id}<br/>
            </p>
          ))}
        </li>
      ))}
    </ul>
  </div>
)

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

export default CrowdfundingWithQuery
