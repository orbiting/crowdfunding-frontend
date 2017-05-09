import React from 'react'
import withData from '../lib/withData'
import Frame from '../components/Frame'
import Memberships from '../components/Stats/Memberships'

import {
  NarrowContainer
} from '@project-r/styleguide'

const WePage = ({url}) => (
  <Frame url={url} meta={{title: 'Wer sind Sie?'}} sidebar={false}>
    <NarrowContainer>
      <Memberships />
    </NarrowContainer>
  </Frame>
)

export default withData(WePage)
