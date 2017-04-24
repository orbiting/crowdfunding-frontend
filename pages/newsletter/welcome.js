import React from 'react'
import {css} from 'glamor'
import withData from '../../lib/withData'
import withT from '../../lib/withT'
import Frame from '../../components/Frame'
import {SPACE} from '../../components/Frame/PureFooter'
import Head from 'next/head'

import {
  H1, P, NarrowContainer, Logo, mediaQueries
} from '@project-r/styleguide'

import {
  COUNTDOWN_DATE
} from '../../constants'

const styles = {
  logoContainer: css({
    textAlign: 'center',
    paddingTop: 25,
    [mediaQueries.mUp]: {
      paddingTop: SPACE * 2
    }
  }),
  welcomeMessage: css({
    textAlign: 'center'
  })
}

export default withData(withT(({url, t}) => {
  const now = new Date()

  if (now > COUNTDOWN_DATE) {
    return (
      <Frame url={url} meta={{
        title: t('newsletter/title')
      }}>
        <H1>
          {t('newsletter/title')}
        </H1>
        <P>
          {url.query.message
            ? url.query.message
            : t('newsletter/defaultMessage')}
        </P>
      </Frame>
    )
  }

  return (
    <div>
      <Head>
        <title>Republik Newsletter</title>
      </Head>
      <NarrowContainer>
        <div {...styles.logoContainer}>
          <Logo />
        </div>
        <h2 {...styles.welcomeMessage}>
          {url.query.message
            ? url.query.message
            : 'Welcome aboard!'}
        </h2>
      </NarrowContainer>
    </div>
  )
}))
