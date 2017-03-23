import React from 'react'
import withData from '../lib/withData'
import App from '../components/App'

import {
  H1, P, MediumContainer
} from '@project-r/styleguide'

export default withData((props) => (
  <App>
    <MediumContainer>
      <H1>Events</H1>
      <P>
        Wir, bei dir.
      </P>
    </MediumContainer>
  </App>
))
