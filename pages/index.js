import React, {Component} from 'react'
import {compose} from 'redux'
import {timeMinute} from 'd3-time'

import withData from '../lib/withData'
import withT from '../lib/withT'

import {withStatus} from '../components/Status'

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

class Index extends Component {
  constructor (...args) {
    super(...args)

    const {crowdfunding} = args[0]
    const now = new Date()
    this.state = {
      ended: crowdfunding && now > (new Date(crowdfunding.endDate))
    }
  }
  tick (ms) {
    clearTimeout(this.timeout)

    const now = new Date()
    const msToNextTick = ms || (61 - now.getSeconds()) * 1000 - now.getMilliseconds() + 50

    console.log('tick', msToNextTick)
    this.timeout = setTimeout(
      () => {
        this.checkTime()
      },
      msToNextTick
    )
  }
  componentWillUnmount () {
    clearTimeout(this.timeout)
  }
  checkTime () {
    const {crowdfunding} = this.props
    if (crowdfunding) {
      const now = new Date()
      const endDate = new Date(crowdfunding.endDate)
      const minutesLeft = timeMinute.count(now, endDate)
      if (minutesLeft > 60) {
        this.notPolling = true
        this.props.statusStopPolling()
        this.tick(1000 * 60 * 30)
      } else {
        if (this.notPolling) {
          this.notPolling = false
          this.props.statusStartPolling()
        }
        if (now > endDate && !this.state.ended) {
          this.setState(() => ({
            ended: true
          }))
        }
        this.tick()
      }
    } else {
      this.tick()
    }
  }
  componentDidMount () {
    this.checkTime()
  }
  render () {
    const {ended} = this.state
    if (ended) {
      return (
        <div>Merci</div>
      )
    }

    return (
      <CrowdfundingPage {...this.props} alive />
    )
  }
}

const AutoIndex = compose(
  withT,
  withStatus
)(Index)

export default withData(AutoIndex)
