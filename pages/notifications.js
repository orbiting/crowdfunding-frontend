import React from 'react'
import {css} from 'glamor'
import withData from '../lib/withData'
import withT from '../lib/withT'
import {SPACE} from '../components/Frame/PureFooter'
import Head from 'next/head'

import {
  P, NarrowContainer, Logo, mediaQueries
} from '@project-r/styleguide'

const styles = {
  logoContainer: css({
    textAlign: 'center',
    maxWidth: 200,
    margin: '0 auto',
    paddingTop: 25,
    [mediaQueries.mUp]: {
      paddingTop: SPACE * 2
    }
  }),
  welcomeMessage: css({
    textAlign: 'center'
  })
}

// email-confirmed
// invalidToken
// unavailable

export default withData(withT(({url, t}) => {
  return (
    <div>
      <Head>
        <title>Mitteilung — Republik</title>
        <meta name='robots' content='noindex' />
      </Head>
      <NarrowContainer>
        <div {...styles.logoContainer}>
          <Logo />
        </div>
        <h2 {...styles.welcomeMessage}>
          {url.query.type
            ? url.query.type
            : ''}
        </h2>
        <P style={{textAlign: 'center'}}>
          {JSON.stringify(url.query, null, 2)}
        </P>
      </NarrowContainer>
    </div>
  )
}))
