import React, {Component} from 'react'
import withData from '../lib/withData'
import Frame from '../components/Frame'
import Content from '../components/Frame/Content'

import List from '../components/Testimonial/List'
import Share from '../components/Testimonial/Share'

class CommunityPage extends Component {
  render () {
    const {url} = this.props

    if (url.query.share) {
      return <Share firstId={url.query.share} />
    }

    return (
      <Frame url={url}>
        <Content>
          <List meta url={url} />
        </Content>
      </Frame>
    )
  }
}

export default withData(CommunityPage)
