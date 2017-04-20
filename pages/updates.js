import React from 'react'
import withData from '../lib/withData'
import Frame from '../components/Frame'
import Content from '../components/Frame/Content'

import List from '../components/Updates/List'

export default withData(({url, serverContext}) => (
  <Frame url={url}>
    <Content indented>
      <List slug={url.query.slug} serverContext={serverContext} />
    </Content>
  </Frame>
))
