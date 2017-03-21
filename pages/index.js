import App from '../components/App'
import withData from '../lib/withData'

import {Button} from '@project-r/styleguide'
import Crowdfunding from '../components/Crowdfunding'
import Pledges from '../components/Pledges'

import withSession from '../components/auth/with-session'
import Link from 'next/prefetch'
import LogoutButton from '../components/auth/logout-button'

export default withSession(withData(({session, isLoggedIn}) => (
  <App>
    <h1>Republik</h1>
    <section>
      <p>«Es ist Zeit, dass sich die Journalisten unabhängig machen und der Journalismus unabhängig von den Grossverlagen existieren kann. Und ein Modell dafür schafft man nur gemeinsam, oder gar nicht.»</p>
      <Button>Mitmachen</Button>
    </section>
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
