import React from 'react'
import withData from '../lib/withData'
import Frame from '../components/Frame'

import {
  NarrowContainer
} from '@project-r/styleguide'

import Feed from '../components/Discuss/Feed'
import Poll from '../components/Vote/Poll'

const WePage = ({url}) => (
  <Frame url={url} meta={{title: 'Abstimmung'}} sidebar={false}>
    <NarrowContainer>
      <Poll name='END_GOAL' />
      <br /><br />
      <Feed name='END_GOAL' />
    </NarrowContainer>
  </Frame>
)

export default withData(WePage)
