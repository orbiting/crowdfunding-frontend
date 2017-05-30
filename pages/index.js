import React, {Component} from 'react'

import withData from '../lib/withData'

// import {
//   PUBLIC_BASE_URL, STATIC_BASE_URL
// } from '../constants'

// import {
//   Label, Button, Lead, colors,
//   P, A, linkRule, Interaction
// } from '@project-r/styleguide'

import {Page as CrowdfundingPage} from './crowdfunding'

// const MERCI_VIDEO = {
//   hls: 'https://player.vimeo.com/external/213080233.m3u8?s=40bdb9917fa47b39119a9fe34b9d0fb13a10a92e',
//   mp4: 'https://player.vimeo.com/external/213080233.hd.mp4?s=ab84df0ac9134c86bb68bd9ea7ac6b9df0c35774&profile_id=119',
//   subtitles: '/static/subtitles/main.vtt',
//   poster: `${STATIC_BASE_URL}/static/video/main.jpg`
// }

class AutoIndex extends Component {
  render () {
    return (
      <CrowdfundingPage {...this.props} />
    )
  }
}

export default withData(AutoIndex)
