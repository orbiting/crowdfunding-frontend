import React from 'react'
import {css} from 'glamor'

import {
  H1, H2, A, P, fontFamilies, mediaQueries
} from '@project-r/styleguide'

const h1Style = css({
  [mediaQueries.onlyS]: {
    fontSize: 36,
    lineHeight: '39px'
  }
})

const mdComponents = {
  h1: ({children}) => <H1 {...h1Style}>{children}</H1>,
  h2: H2,
  a: A,
  p: P,
  strong: ({children}) => (
    <span style={{fontFamily: fontFamilies.serifBold}}>{children}</span>
  ),
  img: (props) => <img {...props} style={{width: '100%'}} />
}

export default mdComponents
