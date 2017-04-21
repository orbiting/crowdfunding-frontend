import React, {Component} from 'react'
import withData from '../lib/withData'
import Frame from '../components/Frame'
import Content from '../components/Frame/Content'

import List from '../components/Testimonial/List'

class CommunityPage extends Component {
  render () {
    const {url} = this.props
    return (
      <Frame url={url}>
        <Content>
          <List url={url} />
        </Content>
      </Frame>
    )
  }
}

export default withData(CommunityPage)
