import React from 'react'
import withData from '../lib/withData'
import Frame from '../components/Frame'
import Content from '../components/Frame/Content'

import {
  P, Container
} from '@project-r/styleguide'

export default withData(({url}) => (
  <Frame url={url}>
    <Container>
      <Content>
        <P>
          Aktuelles zum Crowdfunding
        </P>
      </Content>
    </Container>
  </Frame>
))
