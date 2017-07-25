import React, {Component} from 'react'
import {compose} from 'redux'
import {timeMinute} from 'd3-time'
import Link from 'next/link'
import Router from 'next/router'

import withData from '../lib/withData'
import withT from '../lib/withT'

import Frame from '../components/Frame'
import VideoCover from '../components/VideoCover'
import {withStatus} from '../components/Status'
import Newsletter from '../components/Frame/Newsletter'
import Loader from '../components/Loader'

import {countFormat} from '../lib/utils/formats'

import {
  STATIC_BASE_URL,
  SALES_UP
} from '../constants'

import {
  Quote,
  P, A, linkRule,
  Button,
  NarrowContainer
} from '@project-r/styleguide'

import {Page as CrowdfundingPage} from './crowdfunding'

class Index extends Component {
  tick (ms) {
    clearTimeout(this.timeout)

    const now = new Date()
    const msToNextTick = ms || (
      (61 - now.getSeconds()) * 1000 -
      now.getMilliseconds() +
      250
    )

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
      } else if (minutesLeft > -5) {
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
    const {crowdfunding} = this.props
    if (!crowdfunding) {
      return <Loader loading />
    }
    const {url, crowdfunding: {hasEnded, endVideo}} = this.props
    if (hasEnded) {
      return (
        <Frame url={url} meta={{
          pageTitle: 'Republik – das digitale Magazin von Project R',
          title: 'Republik – das digitale Magazin von Project R',
          description: 'Werden Sie jetzt Mitglied und Abonnentin.',
          image: `${STATIC_BASE_URL}/static/social-media/logo.png`
        }} cover={!!endVideo && (
          <VideoCover src={endVideo} endScroll={0.99} autoPlay={!!url.query.play} />
        )}>
          <NarrowContainer>
            <P>Ladies and Gentlemen,</P>
            <P>Thomas Jefferson, der Autor der amerikanischen Unabhängigkeitserklärung, schrieb einmal:</P>
            <Quote>Ich bin sicher, eine kleine Rebellion dann und wann ist eine gute Sache; sie ist in der Politik so notwendig, um die Dinge zu klären, wie ein Sturm für das Wetter.</Quote>

            <P>Wie es aussieht, war es auch im Journalismus Zeit für eine kleine Rebellion. Im Crowdfunding haben Sie uns unterstützt – zusammen mit {countFormat(crowdfunding.status.people)} Verlegerinnen und Verlegern.</P>

            <P>Wir danken Ihnen allen für Ihre Neugier, Ihre Entschlusskraft, Ihr Vertrauen. Und für den Mut, in ein neues Modell für Journalismus zu investieren.</P>

            {!!SALES_UP && (
              <div>
                <P>Nach einer kurzen Pause sind unsere Büros wieder geöffnet. Falls Sie ebenfalls Mitglied der Project&nbsp;R Genossenschaft und damit Verlegerin oder Verleger der Republik werden wollen – willkommen an Bord!</P>
                <Button primary onClick={() => {
                  Router.push('/pledge').then(() => window.scrollTo(0, 0))
                }} style={{minWidth: 250}}>
                  Mitglied werden
                </Button>
              </div>
            )}

            <P>In der Zwischenzeit arbeiten wir daran, die Republik zu bauen. Einerseits soll sie ein sturmfestes Unternehmen sein. Und andererseits ein Magazin, bei dem Sie stolz sein können, als Gründerin oder Gründer dabei gewesen zu sein.</P>

            <P>Und im Januar 2018 geht es dann los: von der Werft auf hohe See.</P>

            <P>Wir freuen uns auf die Arbeit und das Abenteuer!</P>

            <P>Mit Dank und Hochachtung,</P>

            <P>Ihre Crew von der Republik und von Project&nbsp;R</P>

            {SALES_UP ? (
              <P>
                PS:{' '}
                Ein weiteres Mal der Link, um noch an Bord zu kommen:{' '}
                <Link href='/pledge'>
                  <a {...linkRule}>Mitglied&nbsp;werden</a>
                </Link>
              </P>
            ) : (
              <div>
                <P>PS: Für die ersten Umbauarbeiten schliessen wir die Anmeldung für neue Mitglieder vorerst. Falls Sie ebenfalls an Bord kommen wollen, tragen Sie hier Ihre Mail-Adresse ein:</P>
                <Newsletter submitText='eintragen' />
              </div>
            )}

            <P>PPS: Falls Sie über alle Aufbauarbeiten und Veranstaltungen auf dem Laufenden bleiben wollen, abonnieren Sie unseren Newsletter hier: <A href='https://project-r.construction/'>project-r.construction</A></P>
            <P>
              PPPS:{' '}
              Und falls Sie alle Argumente und alle Nachrichten des aufregenden Frühlings nachlesen wollen, finden Sie das alles in
              {' '}
              <Link href='/crowdfunding'>
                <a {...linkRule}>unserem Crowdfunding-Archiv</a>
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
