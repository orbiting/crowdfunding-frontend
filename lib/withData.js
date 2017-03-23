import 'isomorphic-fetch'
import React from 'react'
import { ApolloProvider, getDataFromTree } from 'react-apollo'
import { initClient } from './initClient'
import { initStore } from './initStore'
import { API_BASE_URL, API_AUTHORIZATION_HEADER } from '../constants'

export default (Component) => (
  class extends React.Component {
    static async getInitialProps (ctx) {
      const headers = ctx.req ? ctx.req.headers : {}
      const cfg = !process.browser && {
        API_BASE_URL,
        API_AUTHORIZATION_HEADER
      }
      const client = initClient(headers, cfg)
      const store = initStore(client, client.initialState)

      const props = {
        url: { query: ctx.query, pathname: ctx.pathname },
        ...await (Component.getInitialProps ? Component.getInitialProps(ctx) : {})
      }

      if (!process.browser) {
        const app = (
          <ApolloProvider client={client} store={store}>
            <Component {...props} />
          </ApolloProvider>
        )
        await getDataFromTree(app)
      }

      const state = store.getState()

      return {
        initialState: {
          ...state,
          apollo: {
            data: client.getInitialState().data
          }
        },
        cfg,
        ...props
      }
    }

    constructor (props) {
      super(props)
      this.client = initClient({}, this.props.cfg)
      this.store = initStore(this.client, this.props.initialState)
    }

    render () {
      return (
        <ApolloProvider client={this.client} store={this.store}>
          <Component {...this.props} />
        </ApolloProvider>
      )
    }
  }
)
