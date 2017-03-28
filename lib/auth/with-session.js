import React from 'react'
import Session from './session'

export default (Component) => {
  class WithSession extends React.Component {
    static async getInitialProps (ctx) {
      const session = new Session({ req: ctx.req })

      let initialProps = {}
      if (Component.getInitialProps) {
        initialProps = await Component.getInitialProps({ ...ctx, session })
      }

      const sessionData = await session.getSession()
      let isLoggedIn = false
      if (sessionData.user && sessionData.user.id) {
        isLoggedIn = true
      }

      return {session: sessionData, isLoggedIn, ...initialProps}
    }

    getChildContext () {
      return {
        setSession: (session) => {
          this.props.session = session
          this.forceUpdate()
        },
        getSession: () => this.props.session
      }
    }

    render () {
      return <Component {...this.props} />
    }
  }

  WithSession.childContextTypes = {
    setSession: React.PropTypes.func.isRequired,
    getSession: React.PropTypes.func.isRequired
  }

  return WithSession
}
