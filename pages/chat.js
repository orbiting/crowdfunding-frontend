import React from 'react'
import withData from '../lib/withData'

import Frame from '../components/Frame'
import Content from '../components/Frame/Content'

import ChatList from '../components/Chat/List'
import ChatForm from '../components/Chat/Form'

export default withData(({url}) => (
  <Frame url={url} sidebar={false}>
    <Content>
      <ChatForm />
      <ChatList />
    </Content>
  </Frame>
))
