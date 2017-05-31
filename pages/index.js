import React, {Component} from 'react'
import {compose} from 'redux'
import {timeMinute} from 'd3-time'
import Link from 'next/link'

import withData from '../lib/withData'
import withT from '../lib/withT'

import Frame from '../components/Frame'
import VideoCover from '../components/VideoCover'
import {withStatus} from '../components/Status'
import Newsletter from '../components/Frame/Newsletter'

import {countFormat} from '../lib/utils/formats'

import {
  STATIC_BASE_URL
} from '../constants'

import {
  Quote,
  P, A, linkRule,
  NarrowContainer
} from '@project-r/styleguide'

import {Page as CrowdfundingPage} from './crowdfunding'

class Index extends Component {
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
      const minutesLeft = timeMinute.count(timeMinute.ceil(now), endDate)

      if (minutesLeft > 60) {
        this.tick(1000 * 60 * 30)
      } else if (minutesLeft > 0) {
        this.tick()
      } else if (minutesLeft >= -5) {
        if (!crowdfunding.hasEnded) {
          this.props.statusRefetch()
        }
        this.tick()
      } else if (minutesLeft < -20) {
        this.props.statusStopPolling()
      }
    } else {
      this.tick()
    }
  }
  componentDidMount () {
    this.checkTime()
  }
  render () {
    const {url, crowdfunding, crowdfunding: {hasEnded, endVideo}} = this.props
    if (hasEnded) {
      return (
        <Frame url={url} meta={{
          pageTitle: 'Republik — das digitale Magazin von Project R',
          title: 'Republik — das digitale Magazin von Project R',
          description: 'Danke! Republik geht 2018 definitiv an den Start.',
          image: `${STATIC_BASE_URL}/static/social-media/merci.png`
        }} cover={!!endVideo && (
          <VideoCover src={endVideo} endScroll={0.99} autoPlay={!!url.query.play} />
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

            <P>PS: Für die ersten Umbauarbeiten schliessen wir die Anmeldung für neue Mitglieder vorerst. Falls Sie ebenfalls an Bord kommen wollen, tragen Sie hier Ihre Mail-Adresse ein:</P>

            <Newsletter submitText='eintragen' />

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
