import React from 'react'

import {
  Interaction
} from '@project-r/styleguide'

import pollColors from '../Vote/colors'
import Markdown from '../Markdown'

const {H3} = Interaction

export default ({t, feedName, authorImage, authorName, content, tags = []}) => (
  <span>
    {!!authorImage && (
      <img src={authorImage} style={{float: 'left', maxWidth: 100, marginBottom: 5, marginRight: 5}} />
    )}
    <H3 style={{color: pollColors[tags[0]]}}>
      {authorName}
      {!!tags[0] && (
        ' ' + t('discuss/comment/for', {
          tagName: t(`vote/${feedName}/options/${tags[0]}/title`, undefined, tags[0])
        })
      )}
    </H3>
    <Markdown content={content} />
    <br style={{clear: 'both'}} />
  </span>
)
