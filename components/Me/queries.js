import {gql} from 'react-apollo'

export const myThingsQuery = gql`
query myThings {
  me {
    id
    memberships {
      id
      claimerName
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
        templateId
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
        price
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
      memberships {
        id
        claimerName
        voucherCode
        createdAt
        type {
          name
        }
      }
      createdAt
    }
  }
}
`
