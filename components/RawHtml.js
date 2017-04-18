import {createElement} from 'react'

import {css} from 'glamor'
import {
  colors
} from '@project-r/styleguide'

const style = css({
  '& a': {
    textDecoration: 'none',
    color: colors.primary,
    ':visited': {
      color: colors.primary
    },
    ':hover': {
      color: colors.secondary
    }
  }
})

const RawHtml = ({type, dangerouslySetInnerHTML}) => createElement(type, {
  ...style,
  dangerouslySetInnerHTML
})

RawHtml.defaultProps = {
  type: 'span'
}

export default RawHtml
