import React from 'react'
import withData from '../lib/withData'
import Frame from '../components/Frame'
import ClaimMembership from '../components/Me/ClaimMembership'

export default withData(({url}) => (
  <Frame url={url}>
    <ClaimMembership />
  </Frame>
))
