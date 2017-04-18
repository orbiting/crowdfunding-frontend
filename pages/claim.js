import React from 'react'
import withData from '../lib/withData'
import Frame from '../components/Frame'
import Content from '../components/Frame/Content'
import ClaimMembership from '../components/Me/ClaimMembership'

export default withData(({url}) => (
  <Frame url={url}>
    <Content>
      <ClaimMembership />
    </Content>
  </Frame>
))
