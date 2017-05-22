import React from 'react'
import {css} from 'glamor'

import {
  Interaction, mediaQueries
} from '@project-r/styleguide'

import pollColors from '../Vote/colors'
import Markdown from '../Markdown'

const {H3} = Interaction

const styles = {
  container: css({
    overflow: 'hidden',
    wordWrap: 'break-word'
  }),
  title: css({
    marginBottom: 2,
    fontSize: 18,
    lineHeight: '24px',
    [mediaQueries.mUp]: {
      fontSize: 22,
      lineHeight: '28px'
    }
  }),
  img: css({
    display: 'block',
    float: 'left',
    maxWidth: 66,
    marginTop: 3,
    marginBottom: 3,
    [mediaQueries.mUp]: {
      marginTop: 5,
      marginBottom: 8,
      maxWidth: 113
    },
    marginRight: 15
  })
}

export default ({t, feedName, authorImage, authorName, content, tags = []}) => (
  <div {...styles.container}>
    {!!authorImage && (
      <img src={authorImage} {...styles.img} />
    )}
    <H3 style={{color: pollColors[tags[0]]}} {...styles.title}>
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
