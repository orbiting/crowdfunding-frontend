import React from 'react'
import {css} from 'glamor'
import {SIDEBAR_WIDTH} from './Sidebar'

import {
  mediaQueries
} from '@project-r/styleguide'

export const PADDING = 60

const styles = {
  content: css({
    [mediaQueries.mUp]: {
      paddingRight: PADDING + SIDEBAR_WIDTH
    },
    [mediaQueries.lUp]: {
      paddingRight: PADDING * 2 + SIDEBAR_WIDTH
    }
  }),
  indention: css({
    [mediaQueries.mUp]: {
      paddingLeft: PADDING
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
