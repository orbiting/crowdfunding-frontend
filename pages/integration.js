import React from 'react'
import App from '../components/App'
import withData from '../lib/withData'
import withSession from '../lib/auth/with-session'

import Crowdfunding from '../components/Crowdfunding'
import Pledges from '../components/Pledges'
import Me from '../components/Auth/Me'

export default withSession(withData(({session, isLoggedIn}) => (
  <App>
    <section>
      <Me />
      <Crowdfunding />
      <Pledges />
    </section>
  </App>
)))
