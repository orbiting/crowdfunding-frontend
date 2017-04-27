import React, {Component} from 'react'
import withData from '../lib/withData'
import Frame from '../components/Frame'
import Content from '../components/Frame/Content'

import List, {generateSeed} from '../components/Testimonial/List'
import Share from '../components/Testimonial/Share'

class CommunityPage extends Component {
  static async getInitialProps (ctx) {
    return {
      seed: generateSeed()
    }
  }
  render () {
    const {url, seed} = this.props

    if (url.query.share) {
      return <Share firstId={url.query.share} />
    }

    return (
      <Frame url={url}>
        <Content>
          <List url={url} seed={seed} isPage />
        </Content>
      </Frame>
    )
  }
}

export default withData(CommunityPage)
