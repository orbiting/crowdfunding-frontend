import {gql} from 'react-apollo'

export const pastPledgesQuery = gql`
query pastPledges {
  me {
    id
    pledges {
      id
      status
    }
  }
}
`
