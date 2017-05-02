import React from 'react'
import {css} from 'glamor'
import Head from 'next/head'

import Share from '../components/Share'
import PureFooter, {SPACE} from '../components/Frame/PureFooter'
import VideoPlayer from '../components/VideoPlayer'

import {
  NarrowContainer,
  Logo, R,
  fontFamilies,
  mediaQueries,
  P as EP, H1 as EH1,
  A, Label, Interaction
} from '@project-r/styleguide'

import {
  PUBLIC_BASE_URL, STATIC_BASE_URL
} from '../constants'

const {H2, P: IP} = Interaction

const enVideo = {
  hls: 'https://player.vimeo.com/external/213080233.m3u8?s=40bdb9917fa47b39119a9fe34b9d0fb13a10a92e',
  mp4: 'https://player.vimeo.com/external/213080233.hd.mp4?s=ab84df0ac9134c86bb68bd9ea7ac6b9df0c35774&profile_id=119',
  subtitles: '/static/subtitles/main.vtt',
  poster: `${STATIC_BASE_URL}/static/video/main.jpg`
}

const pRule = css({
  fontFamily: fontFamilies.sansSerifRegular,
  fontSize: 18
})

const P = ({children, ...props}) => (
  <p {...props} {...pRule}>{children}</p>
)

const styles = {
  text: css({
    marginTop: SPACE / 2,
    marginBottom: SPACE,
    fontFamily: fontFamilies.serifRegular,
    fontSize: 18,
    lineHeight: '27px'
  }),
  highlight: css({
    fontFamily: fontFamilies.serifBold,
    fontSize: 24,
    lineHeight: '36px'
  }),
  strong: css({
    fontFamily: fontFamilies.serifBold
  }),
  logoContainer: css({
    textAlign: 'center',
    marginBottom: SPACE
  }),
  column: css({
    maxWidth: 500,
    margin: `${SPACE}px auto`,
    '& ::selection': {
      color: '#fff',
      backgroundColor: '#000'
    }
  }),
  nav: css({
    marginTop: SPACE,
    marginBottom: SPACE,
    [mediaQueries.mUp]: {
      marginTop: SPACE,
      marginBottom: SPACE * 2
    }
  }),
  mainNav: css({
    fontFamily: fontFamilies.sansSerifRegular,
    fontSize: 44,
    lineHeight: '60px'
  }),
  address: css({
    lineHeight: 1.6,
    fontStyle: 'normal'
  })
}

const Highlight = ({children, ...props}) => <span {...props} {...styles.highlight}>{children}</span>
const Strong = ({children}) => <span {...styles.strong}>{children}</span>

export default ({url}) => {
  const meta = {
    title: 'We are Republik',
    description: '',
    image: `${STATIC_BASE_URL}/static/social-media/manifest.png`,
    url: `${PUBLIC_BASE_URL}${url.pathname}`
  }
  const share = {
    url: meta.url,
    emailSubject: 'Republik Manifesto',
    emailAttachUrl: false,
    emailBody: `

Manifesto for journalism by republik.ch:
${meta.url}
`
  }

  return (
    <NarrowContainer>
      <Head>
        <title>Manifesto — Republik</title>
        <meta name='description' content={meta.description} />
        <meta property='og:type' content='website' />
        <meta property='og:url' content={meta.url} />
        <meta property='og:title' content={meta.title} />
        <meta property='og:description' content={meta.description} />
        <meta property='og:image' content={meta.image} />
        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:site' content='@RepublikMagazin' />
        <meta name='twitter:creator' content='@RepublikMagazin' />
      </Head>
      <div {...styles.column}>
        <EH1>We are Republik</EH1>
        <EP>
          We are reclaiming journalism as profession and are creating a new business model for media companies that want to place their readers at the center. Our digital magazine Republik (in German Language) will launch in January 2018. Republik will be reader owned and ad free.
        </EP>
        <EP>
          We are an open source cooperative and we share our knowledge, software and business insights with others who also want to create journalism projects that reinforce democracy.
        </EP>

        <EP style={{marginBottom: SPACE * 2}}>
          <A href='mailto:nadja.schnetzler@project-r.construction'>Get in touch with us!</A>
        </EP>

        <R />

        <div {...styles.text}>
          <Highlight>Ohne Journalismus keine Demokratie.</Highlight><br />
          Und ohne Demokratie keine Freiheit. Wenn der Journalismus stirbt, stirbt auch die <Strong>offene Gesellschaft, das freie Wort, der Wettbewerb der besten Argumente. Freier Journalismus</Strong> war die erste Forderung der <Strong>liberalen Revolution.</Strong> Und das Erste, was jede Diktatur wieder abschafft. Journalismus ist ein Kind <Strong>der Aufklärung.</Strong> Seine Aufgabe ist die <Strong>Kritik der Macht.</Strong> Deshalb ist Journalismus mehr als nur ein Geschäft für irgendwelche Konzerne. Wer Journalismus macht, übernimmt <Strong>Verantwortung für die Öffentlichkeit.</Strong>
          {' '}
          Denn in der Demokratie gilt das Gleiche wie überall im Leben: Menschen brauchen <Strong>vernünftige Informationen, um vernünftige Entscheidungen zu treffen.</Strong> Guter Journalismus schickt <Strong>Expeditionsteams in die Wirklichkeit.</Strong> Seine Aufgabe ist, den Bürgerinnen und Bürgern die <Strong>Fakten und Zusammenhänge</Strong> zu liefern, pur, <Strong>unabhängig,</Strong> nach bestem Gewissen, <Strong>ohne Furcht</Strong> vor niemandem als der Langweile. Journalismus strebt nach <Strong>Klarheit</Strong>, er ist <Strong>der Feind der uralten Angst vor dem Neuen.</Strong> Journalismus braucht <Strong>Leidenschaft,</Strong> Können und Ernsthaftigkeit. Und ein aufmerksames, neugieriges, <Strong>furchtloses Publikum.</Strong> <Highlight style={{verticalAlign: 'top'}}>Sie!</Highlight>
        </div>
      </div>

      <div {...styles.logoContainer}>
        <Logo width={200} />
      </div>

      <div style={{textAlign: 'center', marginBottom: SPACE}}>
        <P>
          Share Manifesto
        </P>
        <P style={{marginBottom: SPACE / 2}}>
          <Share fill='#000' {...share} />
        </P>

        <div style={{marginBottom: SPACE * 2, marginTop: SPACE}}>
          <Label>
            Thank you for your support in translating the English Manifesto:<br />
            Simon Froehling, Anna Wendel, Hal Wyner, Rafaël Newman
          </Label>
        </div>
      </div>

      <div {...styles.column}>
        <H2>Video</H2>
        <IP>
          Our crowdfunding video with English subtitles tells you why it is time for a new model in journalism.
        </IP>
      </div>
      <VideoPlayer src={enVideo} />
      <div {...styles.column}>
        <IP style={{marginBottom: 40}}>
          If you read German you might want to consider becoming a member of the cooperative behind Republik and to read our magazine for a whole year from January 2018 on:
          {' '}
          <A href='/pledge'>Jetzt mitmachen</A>.
        </IP>

        <H2>Donate</H2>
        <IP>
          Donate to support the independent journalism of the future.
        </IP>
        <IP style={{margin: '10px 0'}}><A>Donate with PayPal</A></IP>
        <Label>Banking Account</Label><br />
        <table style={{borderSpacing: '10px 5px', marginLeft: -10}}>
          <tbody>
            <tr>
              <td><Label>Name</Label></td>
              <td>Project R Genossenschaft</td>
            </tr>
            <tr>
              <td><Label>Street</Label></td>
              <td>Sihlhallenstrasse 1</td>
            </tr>
            <tr>
              <td><Label>City</Label></td>
              <td>8004 Zürich</td>
            </tr>
            <tr>
              <td><Label>Bank</Label></td>
              <td>Raiffeisenbank Winterthur</td>
            </tr>
            <tr>
              <td><Label>IBAN</Label></td>
              <td>CH04 8148 5000 0083 4669 1</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{textAlign: 'center', marginBottom: SPACE}}>
        <PureFooter url={url} />
      </div>
    </NarrowContainer>
  )
}
