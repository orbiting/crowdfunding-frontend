import React from 'react'
import withData from '../../lib/withData'
import Frame from '../../components/Frame'
import Story, {metaData} from '../../components/Stats/Story'

const WePage = ({url}) => (
  <Frame url={url} meta={metaData} sidebar={false}>
    <Story />
  </Frame>
)

export default withData(WePage)
