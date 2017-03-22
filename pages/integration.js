import Link from 'next/prefetch'
import App from '../components/App'
import withData from '../lib/withData'
import withSession from '../lib/auth/with-session'

import Crowdfunding from '../components/Crowdfunding'
import Pledges from '../components/Pledges'
import LogoutButton from '../components/auth/logout-button'

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
