import App from '../components/App'
import withData from '../lib/withData'

import {Button} from '@project-r/styleguide'

import withSession from '../components/auth/with-session'

export default withSession(withData(() => (
  <App>
    <h1>Republik</h1>
    <section>
      <p>«Es ist Zeit, dass sich die Journalisten unabhängig machen und der Journalismus unabhängig von den Grossverlagen existieren kann. Und ein Modell dafür schafft man nur gemeinsam, oder gar nicht.»</p>
      <Button>Mitmachen</Button>
    </section>
  </App>
)))
