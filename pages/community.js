import React, {Component} from 'react'
import withData from '../lib/withData'
import Frame from '../components/Frame'
import Content from '../components/Frame/Content'

import List, {generateSeed} from '../components/Testimonial/List'
import Share from '../components/Testimonial/Share'
import Image from '../components/Testimonial/Image'

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
    if (url.query.img) {
      const order = url.query.order || 'ASC'
      const defaultSequenceNumber = order === 'DESC' ? Math.pow(10, 6) : 0
      return <Image query={url.query}
        sequenceNumber={url.query.sequenceNumber || defaultSequenceNumber}
        orderBy={order}
        duration={+Math.max(1000, url.query.duration || 5000)} />
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
