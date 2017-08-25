import { ApolloClient, createNetworkInterface, IntrospectionFragmentMatcher } from 'react-apollo'
import { API_BASE_URL, API_AUTHORIZATION_HEADER } from '../constants'

let apolloClient = null

const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData: {
    __schema: {
      types: [
        {
          kind: 'UNION',
          name: 'Reward',
          possibleTypes: [
            {
              name: 'Goodie'
            },
            {
              name: 'MembershipType'
            }
          ]
        }
      ]
    }
  }
})

function createClient (headers) {
  return new ApolloClient({
    ssrMode: !process.browser,
    dataIdFromObject: result => result.id || null,
    queryDeduplication: true,
    fragmentMatcher,
    networkInterface: createNetworkInterface({
      uri: `${API_BASE_URL}/graphql`,
      opts: {
        credentials: 'include',
        headers: {
          Authorization: API_AUTHORIZATION_HEADER,
          cookie: headers.cookie
        }
      }
    })
  })
}

export const initClient = (headers) => {
  if (!process.browser) {
    return createClient(headers)
  }
  if (!apolloClient) {
    apolloClient = createClient(headers)
  }
  return apolloClient
}
