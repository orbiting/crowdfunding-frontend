import React from 'react'
import withData from '../lib/withData'
import App from '../components/App'

import {
  H1,
  NarrowContainer
} from '@project-r/styleguide'

const MerciPage = () => (
  <App>
    <NarrowContainer>
      <H1>Merci</H1>
    </NarrowContainer>
  </App>
)

export default withData(MerciPage)
