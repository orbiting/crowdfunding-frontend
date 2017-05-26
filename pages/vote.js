import React from 'react'
import withData from '../lib/withData'
import Frame from '../components/Frame'

import {
  NarrowContainer
} from '@project-r/styleguide'

import {
  STATIC_BASE_URL
} from '../constants'

import Feed, {DEFAULT_ORDER} from '../components/Discuss/Feed'
import Share from '../components/Discuss/Share'
import Poll from '../components/Vote/Poll'
import Presentation from '../components/Vote/Presentation'

const VotePage = ({url}) => {
  if (url.query.share) {
    return <Share name='END_GOAL' firstId={url.query.share} />
  }
  if (url.query.presentation) {
    return <Presentation name='END_GOAL' slide={url.query.slide} />
  }

  const metaData = {
    pageTitle: 'Abstimmung — Republik',
    title: 'Die Republik führt die Demokratie ein',
    description: 'Frau Verlegerin, Herr Verleger, Sie haben die Aufgabe, das letzte Ziel des Crowdfundings zu bestimmen.',
    image: `${STATIC_BASE_URL}/static/social-media/vote.jpg`
  }

  return (
    <Frame url={url} sidebar={false}>
      <NarrowContainer>
        <Poll name='END_GOAL' />
        <Feed name='END_GOAL'
          firstId={url.query.id}
          order={url.query.order || DEFAULT_ORDER}
          tags={url.query.tag !== undefined ? [url.query.tag].filter(Boolean) : null}
          meta={metaData}
          limit={20} />
      </NarrowContainer>
    </Frame>
  )
}

export default withData(VotePage)
