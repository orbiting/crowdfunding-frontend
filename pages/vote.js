import React from 'react'
import withData from '../lib/withData'
import Frame from '../components/Frame'

import {
  NarrowContainer
} from '@project-r/styleguide'

import Discussion from '../components/Discuss/List'
import VoteDetail from '../components/Vote/Detail'

const WePage = ({url}) => (
  <Frame url={url} meta={{title: 'Abstimmung'}} sidebar={false}>
    <NarrowContainer>
      <VoteDetail />
      <Discussion />
    </NarrowContainer>
  </Frame>
)

export default withData(WePage)
