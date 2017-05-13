import { ApolloClient, createNetworkInterface } from 'react-apollo'
import { SubscriptionClient, addGraphQLSubscriptions } from 'subscriptions-transport-ws'
import { API_BASE_URL, API_WS_BASE_URL, API_AUTHORIZATION_HEADER } from '../constants'

let apolloClient = null

function _createNetworkInterface (headers) {
  const networkInterface = createNetworkInterface({
    uri: `${API_BASE_URL}/graphql`,
    opts: {
      credentials: 'include',
      headers: {
        Authorization: API_AUTHORIZATION_HEADER,
        cookie: headers.cookie
      }
    }
  })

  if (!process.browser) {
    return networkInterface
  }

  const wsClient = new SubscriptionClient(`${API_WS_BASE_URL}/`, {
    reconnect: true
  })
  const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
    networkInterface,
    wsClient
  )
  return networkInterfaceWithSubscriptions
}

function createClient (headers) {
  return new ApolloClient({
    ssrMode: !process.browser,
    dataIdFromObject: result => result.id || null,
    queryDeduplication: true,
    networkInterface: _createNetworkInterface(headers)
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
