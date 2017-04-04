import React from 'react'
import withData from '../lib/withData'
import Frame from '../components/Frame'
import Content from '../components/Frame/Content'

import {
  H1, P, Container
} from '@project-r/styleguide'

export default withData(({url}) => (
  <Frame url={url}>
    <Container>
      <Content>
        <H1>Community</H1>
        <P>
          Ganz viele, super Leute.
        </P>
      </Content>
    </Container>
  </Frame>
))
