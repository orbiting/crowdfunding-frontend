import React from 'react'
import {css} from 'glamor'

import {
  Interaction
} from '@project-r/styleguide'

import pollColors from '../Vote/colors'
import Markdown from '../Markdown'

const {H3} = Interaction

const styles = {
  container: css({
    overflow: 'hidden',
    wordWrap: 'break-word'
  }),
  img: css({
    display: 'block',
    float: 'left',
    maxWidth: 113,
    marginTop: 5,
    marginBottom: 8,
    marginRight: 15
  })
}

export default ({t, feedName, authorImage, authorName, content, tags = []}) => (
  <div {...styles.container}>
    {!!authorImage && (
      <img src={authorImage} {...styles.img} />
    )}
    <H3 style={{color: pollColors[tags[0]], marginBottom: 2}}>
      {authorName}
      {!!tags[0] && (
        ' ' + t('discuss/comment/for', {
          tagName: t(`vote/${feedName}/options/${tags[0]}/title`, undefined, tags[0])
        })
      )}
    </H3>
    <Markdown content={content} />
    <div style={{clear: 'both'}} />
  </div>
)
