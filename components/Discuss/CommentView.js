import React from 'react'
// import {css} from 'glamor'

import {
  Interaction
} from '@project-r/styleguide'

const {H3, P} = Interaction

export default ({authorImage, authorName, content}) => (
  <span>
    {!!authorImage && (
      <img src={authorImage} style={{float: 'left', maxWidth: 100, marginBottom: 5, marginRight: 5}} />
    )}
    <H3>{authorName}</H3>
    <P>{content}</P>
    <br style={{clear: 'both'}} />
  </span>
)
