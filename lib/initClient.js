import { ApolloClient, createNetworkInterface } from 'react-apollo'
import { API_BASE_URL, API_AUTHORIZATION_HEADER } from '../constants'

let apolloClient = null

function createClient (headers) {
  return new ApolloClient({
    ssrMode: !process.browser,
    dataIdFromObject: result => result.id || null,
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
