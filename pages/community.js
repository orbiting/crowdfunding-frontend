import React from 'react'
import withData from '../lib/withData'
import Frame from '../components/Frame'

import {
  H1, P, Container
} from '@project-r/styleguide'

export default withData((props) => (
  <Frame>
    <Container>
      <H1>Community</H1>
      <P>
        Ganz viele, super Leute.
      </P>
    </Container>
  </Frame>
))
