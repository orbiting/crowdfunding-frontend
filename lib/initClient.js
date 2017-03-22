import { ApolloClient, createNetworkInterface } from 'react-apollo'
import { API_BASE_URL, API_AUTHORIZATION_HEADER } from '../constants'

let apolloClient = null

function createClient (headers) {
  let apolloHeaders = {
    Authorization: API_AUTHORIZATION_HEADER
  }
  if (headers && headers.cookie) {
    apolloHeaders.cookie = headers.cookie
  }
  return new ApolloClient({
    ssrMode: !process.browser,
    dataIdFromObject: result => result.id || null,
    networkInterface: createNetworkInterface({
      uri: `${API_BASE_URL}/graphql`,
      opts: {
        credentials: 'include',
        headers: apolloHeaders
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
