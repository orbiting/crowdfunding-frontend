import React, {Component} from 'react'
import {compose} from 'redux'
import {timeMinute} from 'd3-time'
import Link from 'next/link'

import withData from '../lib/withData'
import withT from '../lib/withT'

import Frame from '../components/Frame'
import VideoCover from '../components/VideoCover'
import {withStatus} from '../components/Status'

import {countFormat} from '../lib/utils/formats'

import {
  STATIC_BASE_URL,
  STATUS_POLL_INTERVAL_MS
} from '../constants'

import {
  Quote,
  P, A, linkRule,
  NarrowContainer
} from '@project-r/styleguide'

import {Page as CrowdfundingPage} from './crowdfunding'

const MERCI_VIDEO = {
  hls: 'https://player.vimeo.com/external/213080233.m3u8?s=40bdb9917fa47b39119a9fe34b9d0fb13a10a92e',
  mp4: 'https://player.vimeo.com/external/213080233.hd.mp4?s=ab84df0ac9134c86bb68bd9ea7ac6b9df0c35774&profile_id=119',
  subtitles: '/static/subtitles/main.vtt',
  poster: `${STATIC_BASE_URL}/static/video/main.jpg`
}

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
        if (this.notPolling && STATUS_POLL_INTERVAL_MS) {
          this.notPolling = false
          this.props.statusStartPolling(+STATUS_POLL_INTERVAL_MS)
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
    const {url, crowdfunding} = this.props
    const {ended} = this.state
    if (ended) {
      return (
        <Frame url={url} sidebar={false} meta={{
          pageTitle: 'Republik — das digitale Magazin von Project R',
          title: 'Republik — das digitale Magazin von Project R',
          description: 'Vielen Danke.',
          image: `${STATIC_BASE_URL}/static/social-media/merci.jpg`
        }} cover={(
          <VideoCover src={MERCI_VIDEO} />
        )}>
          <NarrowContainer>
            <P>Ladies and Gentlemen,</P>
            <P>Thomas Jefferson, der Autor der amerikanischen Unabhängigkeitserklärung, schrieb einmal:</P>
            <Quote>Ich bin sicher, eine kleine Rebellion dann und wann ist eine gute Sache; sie ist in der Politik so notwendig, um die Dinge zu klären, wie ein Sturm für das Wetter.</Quote>

            <P>Wie es aussieht, war es auch im Journalismus Zeit für eine kleine Rebellion. Sie, unsere {countFormat(crowdfunding.status.people)} Verlegerinnen und Verleger, haben sie unterstützt.</P>

            <P>Wir danken Ihnen für Ihre Neugier, Ihre Entschlusskraft, Ihr Vertrauen. Und für den Mut, in ein neues Modell für Journalismus zu investieren.</P>

            <P>Wir arbeiten nun daran, die Republik zu bauen. Einerseits ein sturmfestes Unternehmen. Und andererseits ein Magazin, bei dem Sie stolz sein können, als Gründerin oder Gründer dabei gewesen zu sein.</P>

            <P>Im Januar 2018 geht es los.</P>

            <P>Mit Dank und Hochachtung,</P>

            <P>Ihre Crew von der Republik und von Project&nbsp;R</P>

            <P>PS: Für die ersten Umbauarbeiten schliessen wir die Anmeldung für neue Mitglieder bis zum 1. Juli. Falls Sie ebenfalls an Bord kommen wollen, tragen Sie hier Ihre Mail-Adresse ein:</P>

            <P>PPS: Auf dem Laufenden über den weiteren Aufbau des digitalen Magazins Republik von Project R bleiben Sie hier: <A href='https://project-r.construction/'>project-r.construction</A></P>

            <P>
              PPPS:
              {' '}
              <Link href='/crowdfunding'>
                <a {...linkRule}>Das Crowdfunding-Archiv</a>
              </Link>
            </P>
          </NarrowContainer>
        </Frame>
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
