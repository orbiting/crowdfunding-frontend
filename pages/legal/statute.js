import React from 'react'
import withData from '../../lib/withData'
import Frame from '../../components/Frame'
import Content from '../../components/Frame/Content'

import {
  H1
} from '@project-r/styleguide'

export default withData(({url}) => {
  const title = 'Statuten'
  return (
    <Frame url={url} meta={{title}}>
      <Content>
        <H1>
          {title}
        </H1>
      </Content>
    </Frame>
  )
})
