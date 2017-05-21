import React from 'react'
import withData from '../lib/withData'
import Frame from '../components/Frame'

import {
  NarrowContainer
} from '@project-r/styleguide'

import Feed from '../components/Discuss/Feed'
import Share from '../components/Discuss/Share'
import Poll from '../components/Vote/Poll'

const VotePage = ({url}) => {
  if (url.query.share) {
    return <Share name='END_GOAL' firstId={url.query.share} />
  }

  return (
    <Frame url={url} meta={{title: 'Abstimmung'}} sidebar={false}>
      <NarrowContainer>
        <Poll name='END_GOAL' />
        <Feed name='END_GOAL' />
      </NarrowContainer>
    </Frame>
  )
}

export default withData(VotePage)
