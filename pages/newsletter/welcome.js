import React from 'react'
import Head from 'next/head'
import withData from '../../lib/withData'
import withT from '../../lib/withT'
import Frame from '../../components/Frame'

import {
  H1, P
} from '@project-r/styleguide'

export default withData(withT(({url, t}) => (
  <Frame url={url}>
    <Head>
      <title>Republik Newsletter</title>
    </Head>
    <H1>
      {t('newsletter/title')}
    </H1>
    <P>
      {url.query.message
        ? url.query.message
        : t('newsletter/defaultMessage')}
    </P>
  </Frame>
)))
