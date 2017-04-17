import React from 'react'
import withData from '../lib/withData'
import Frame from '../components/Frame'
import Merci from '../components/Pledge/Merci'

import {
  NarrowContainer
} from '@project-r/styleguide'

const MerciPage = ({url}) => (
  <Frame url={url} sidebar={false}>
    <NarrowContainer>
      <Merci url={url} />
    </NarrowContainer>
  </Frame>
)

export default withData(MerciPage)
