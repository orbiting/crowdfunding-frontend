import React from 'react'
import {css} from 'glamor'

const styles = {
  comment: css({
    marginBottom: 40
  })
}

import {
  Interaction
} from '@project-r/styleguide'

const {H3, P} = Interaction

const Comment = ({data: {content, authorName, authorImage}}) => {
  return (
    <div {...styles.comment}>
      {authorImage}
      <H3>{authorName}</H3>
      <P>{content}</P>
    </div>
  )
}

export default Comment
