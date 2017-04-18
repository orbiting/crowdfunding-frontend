import {gql} from 'react-apollo'

export const myThingsQuery = gql`
query myThings {
  me {
    id
    memberships {
      id
      voucherCode
      createdAt
      type {
        name
      }
    }
    pledges {
      id
      package {
        name
      }
      options {
        reward {
          ... on MembershipType {
            name
          }
          ... on Goodie {
            name
          }
        }
        minAmount
        maxAmount
        amount
      }
      status
      total
      donation
      payments {
        method
        paperInvoice
        total
        status
        hrid
        createdAt
        updatedAt
      }
      createdAt
    }
  }
}
`
