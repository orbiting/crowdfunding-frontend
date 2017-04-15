import React from 'react'
import {css} from 'glamor'
import Head from 'next/head'

import {
  NarrowContainer, Logo, mediaQueries
} from '@project-r/styleguide'

const styles = {
  logoContainer: css({
    textAlign: 'center',
    paddingTop: 25,
    [mediaQueries.mUp]: {
      paddingTop: 20 * 2
    }
  }),
  welcomeMessage: css({
    textAlign: 'center'
  })
}

export default ({url}) => (
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
