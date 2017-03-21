import App from '../components/App'
import withData from '../lib/withData'

import Crowdfunding from '../components/Crowdfunding'
import Pledges from '../components/Pledges'

export default withData((props) => (
  <App>
    <section>
      <Crowdfunding />
      <Pledges />
    </section>
  </App>
))
