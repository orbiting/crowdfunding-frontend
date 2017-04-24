import React from 'react'

import {
  H1, H2, A, P, fontFamilies
} from '@project-r/styleguide'

const mdComponents = {
  h1: H1,
  h2: H2,
  a: A,
  p: P,
  strong: ({children}) => (
    <span style={{fontFamily: fontFamilies.serifBold}}>{children}</span>
  ),
  img: (props) => <img {...props} style={{width: '100%'}} />
}

export default mdComponents
