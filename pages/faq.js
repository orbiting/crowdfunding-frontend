import React from 'react'
import withData from '../lib/withData'

import Frame from '../components/Frame'
import Content from '../components/Frame/Content'

import FaqList from '../components/Faq/List'
import FaqForm from '../components/Faq/Form'

export default withData(({url}) => (
  <Frame url={url}>
    <Content>
      <FaqList />
      <FaqForm />
    </Content>
  </Frame>
))
