import App from '../components/App'
import withData from '../lib/withData'

import Crowdfunding from '../components/Crowdfunding'
import Pledges from '../components/Pledges'

import Link from 'next/prefetch'
import LogoutButton from '../components/auth/logout-button'
import withSession from '../components/auth/with-session'

export default withSession(withData(({session, isLoggedIn}) => (
  <App>
    <section>
      {!isLoggedIn && <p><Link href='/auth/signin'><a>Login</a></Link></p>}
      {isLoggedIn && (
        <div>
          <p>Welcome back {session.user.email}</p>
          <LogoutButton session={session}>Log out</LogoutButton>
        </div>
      )}
      <Crowdfunding />
      <Pledges />
    </section>
  </App>
)))
