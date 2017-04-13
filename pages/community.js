import React from 'react'
import withData from '../lib/withData'
import Frame from '../components/Frame'
import Content from '../components/Frame/Content'

import {
  P
} from '@project-r/styleguide'

export default withData(({url}) => (
  <Frame url={url}>
    <Content>
      <P>
        Ganz viele, super Leute.
      </P>
    </Content>
  </Frame>
))
