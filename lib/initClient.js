import { ApolloClient, createNetworkInterface } from 'react-apollo'

let apolloClient = null

function createClient (headers, cfg) {
  return new ApolloClient({
    ssrMode: !process.browser,
    dataIdFromObject: result => result.id || null,
    networkInterface: createNetworkInterface({
      uri: `${cfg.API_BASE_URL}/graphql`,
      opts: {
        credentials: 'include',
        headers: {
          Authorization: cfg.API_AUTHORIZATION_HEADER,
          cookie: headers.cookie
        }
      }
    })
  })
}

export const initClient = (headers, cfg) => {
  if (!process.browser) {
    return createClient(headers, cfg)
  }
  if (!apolloClient) {
    apolloClient = createClient(headers, cfg)
  }
  return apolloClient
}
