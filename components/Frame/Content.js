import React from 'react'
import {css} from 'glamor'

import {
  mediaQueries
} from '@project-r/styleguide'

import {CONTENT_PADDING, SIDEBAR_WIDTH} from './constants'

const styles = {
  content: css({
    [mediaQueries.mUp]: {
      paddingRight: CONTENT_PADDING + SIDEBAR_WIDTH
    },
    [mediaQueries.lUp]: {
      paddingRight: CONTENT_PADDING * 2 + SIDEBAR_WIDTH
    }
  }),
  indention: css({
    [mediaQueries.mUp]: {
      paddingLeft: CONTENT_PADDING
    }
  })
}

const Content = ({children, indented, ...props}) => (
  <div {...props}
    {...styles.content}
    {...(indented ? styles.indention : {})}>
    {children}
  </div>
)

export default Content
