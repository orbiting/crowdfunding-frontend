import React from 'react'
import withData from '../lib/withData'
import App from '../components/App'

import {
  H1, P, MediumContainer
} from '@project-r/styleguide'

export default withData((props) => (
  <App>
    <MediumContainer>
      <H1>Community</H1>
      <P>
        Ganz viele, super Leute.
      </P>
    </MediumContainer>
  </App>
))
