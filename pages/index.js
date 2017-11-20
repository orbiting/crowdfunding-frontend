import React, {Component} from 'react'
import {compose} from 'redux'
import {timeMinute} from 'd3-time'
import Link from 'next/link'
import Router from 'next/router'
import md from 'markdown-in-js'

import withData from '../lib/withData'
import withT from '../lib/withT'

import Frame from '../components/Frame'
import VideoCover from '../components/VideoCover'
import {withStatus} from '../components/Status'
import Newsletter from '../components/Frame/Newsletter'
import Loader from '../components/Loader'

import {countFormat} from '../lib/utils/formats'
import mdComponents from '../lib/utils/mdComponents'
import {ListWithQuery as TestimonialList} from '../components/Testimonial/List'

import {
  STATIC_BASE_URL,
  SALES_UP
} from '../constants'

import {
  P, A, linkRule,
  Button,
  NarrowContainer
} from '@project-r/styleguide'

import {Page as CrowdfundingPage, VIDEOS} from './crowdfunding'

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
    const {url, crowdfunding: {hasEnded}} = this.props
    if (hasEnded) {
      const joinLink = SALES_UP
        ? (
          <Link href='/pledge'>
            <a {...linkRule}>Mitglied&nbsp;werden</a>
          </Link>
        )
        : null

      return (
        <Frame url={url} meta={{
          pageTitle: 'Republik – das digitale Magazin von Project R',
          title: 'Republik – das digitale Magazin von Project R',
          description: 'Werden Sie jetzt Mitglied und Abonnentin.',
          image: `${STATIC_BASE_URL}/static/social-media/logo.png`
        }} cover={
          <VideoCover src={VIDEOS.main} endScroll={0.97} autoPlay={!!url.query.play} />
        }>
          <NarrowContainer>
            {md(mdComponents)`
Ladies and Gentlemen,

Die Republik ist eine kleine Rebellion. Für den Journalismus. Und gegen die Medienkonzerne. Denn die grossen Verlage verlassen die Publizistik: Sie bauen sich in hohem Tempo in Internet-Handelshäuser um. Das ist eine schlechte Nachricht für den Journalismus. Aber auch für die Demokratie. Denn ohne vernünftige Informationen fällt man schlechte Entscheidungen.

Eine funktionierende Demokratie braucht funktionierende Medien. Und dafür braucht es nicht nur Journalistinnen und Journalisten, sondern auch Sie. Als Leserinnen. Als Bürger. Als Menschen, die bereit sind, etwas Geld in unabhängigen Journalismus zu investieren.

            `}

            {!!SALES_UP && (
              <div style={{margin: '10px 0 40px'}}>
                <Button primary onClick={() => {
                  Router.push('/pledge').then(() => window.scrollTo(0, 0))
                }} style={{minWidth: 250}}>
                  Jetzt Mitglied werden
                </Button>
              </div>
            )}
            {md(mdComponents)`
# Worum es geht

Die Republik wird ein schlankes, schlagkräftiges Magazin im Netz. Mit dem Ziel, bei den grossen Themen, Fragen und Debatten Klarheit und Überblick zu bieten. Und das aufrichtig, ohne Schnörkel, mit grossem Herzen. Unser Ziel dabei ist, gemeinsam mit Ihnen ein neues Modell im Medienmarkt zu etablieren: kompromisslos in der Qualität, ohne Werbung, finanziert von den Leserinnen und Lesern. Es ist Zeit für Journalismus ohne Bullshit.

Entscheiden Sie sich, mitzumachen, werden Sie Abonnentin. Sie erhalten ab Anfang 2018 ein Jahr lang die Republik. Plus vergünstigten Zugang zu allen Veranstaltungen. Ausserdem werden Sie automatisch ein Teil des Unternehmens – als Mitglied der Project R Genossenschaft. Kurz, Sie werden ein klein wenig Verleger der Republik. 

Ihr Risiko beträgt dabei 240 Franken pro Jahr. Also der Preis, den man pro Jahr wöchentlich für einen Kaffee im Restaurant ausgibt. Mit diesem Betrag können Sie einen echten Unterschied machen. Denn es ist Zeit, dem Journalismus ein neues Fundament zu bauen. Und das schafft niemand allein. Sondern nur viele gemeinsam: wir mit Ihnen. Willkommen an Bord!

${joinLink}

# Wer wir sind

Ihre Partnerin bei diesem Projekt ist die Aufbaucrew der Republik und von Project R. Wir sind seit drei Jahren an der Arbeit, zuerst lange in Nachtarbeit, seit Januar 2017 hauptberuflich. Die Kurzporträts der Crew finden Sie ${(<Link href='/crew'><a {...linkRule}>hier</a></Link>)}.

# Community

Die Republik kann nicht ein Projekt von wenigen sein. Ein neues Fundament für unabhängigen Journalismus bauen wir nur gemeinsam – oder gar nicht. Bereits sind fast ${countFormat(15000)} Verlegerinnen und Verleger an Bord. Sehen Sie hier, wer dabei ist:

${(
  <div>
    <div style={{margin: '20px 0 0'}}>
      <TestimonialList limit={10} onSelect={(id) => {
        Router.push(`/community?id=${id}`).then(() => {
          window.scrollTo(0, 0)
        })
        return false
      }} />
    </div>

    <Link href='/community'>
      <a {...linkRule}>Alle ansehen</a>
    </Link>
  </div>
)}

Im Januar 2018 geht es los: von der Werft auf hohe See.

Wir freuen uns auf das Abenteuer!

Mit Dank und Hochachtung,

Ihre Crew von der Republik und von Project R

            `}

            {!SALES_UP &&
              <P>Für die ersten Umbauarbeiten schliessen wir die Anmeldung für neue Mitglieder vorerst. Falls Sie ebenfalls an Bord kommen wollen, tragen Sie hier Ihre Mail-Adresse ein:</P>}
            {!SALES_UP &&
              <Newsletter submitText='eintragen' />
            }

            <P>PS: Falls Sie über alle Aufbauarbeiten und Veranstaltungen auf dem Laufenden bleiben wollen, abonnieren Sie unseren Newsletter hier: <A href='https://project-r.construction/'>project-r.construction</A></P>
            <P>
              PPS:{' '}
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
