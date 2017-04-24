import React from 'react'
import withData from '../lib/withData'
import withT from '../lib/withT'

import Frame from '../components/Frame'
import Content from '../components/Frame/Content'
import Portrait from '../components/Portrait'

import {
  Lead
} from '@project-r/styleguide'

import team from '../lib/team'

import {
  PUBLIC_BASE_URL, STATIC_BASE_URL
} from '../constants'

export default withData(withT(({url, t}) => {
  const meta = {
    pageTitle: t('crew/pageTitle'),
    title: t('crew/title'),
    description: t('crew/description'),
    image: `${STATIC_BASE_URL}/static/social-media/crew.jpg`,
    url: `${PUBLIC_BASE_URL}${url.pathname}`
  }

  return (
    <Frame url={url} meta={meta}>
      <Content indented>
        <img src={meta.image} style={{
          width: '100%',
          marginBottom: 30
        }} />
        <Lead>{t('crew/lead')}</Lead>
        {team.map((person, i) => <Portrait key={i} {...person} odd={!(i % 2)} />)}
      </Content>
    </Frame>
  )
}))
