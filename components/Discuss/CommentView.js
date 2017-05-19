import React from 'react'
// import {css} from 'glamor'

import {
  Interaction, P
} from '@project-r/styleguide'

import pollColors from '../Vote/colors'

const {H3} = Interaction

export default ({authorImage, authorName, content, tags = []}) => (
  <span>
    {!!authorImage && (
      <img src={authorImage} style={{float: 'left', maxWidth: 100, marginBottom: 5, marginRight: 5}} />
    )}
    <H3 style={{color: pollColors[tags[0]]}}>
      {authorName}
    </H3>
    <P style={{marginTop: 0}}>{content}</P>
    <br style={{clear: 'both'}} />
  </span>
)
