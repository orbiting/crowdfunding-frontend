import React from 'react'
import withData from '../lib/withData'
import Frame from '../components/Frame'
import Story from '../components/Stats/Story'

const WePage = ({url}) => (
  <Frame url={url} meta={{title: 'Wer sind Sie?'}} sidebar={false}>
    <Story />
  </Frame>
)

export default withData(WePage)
