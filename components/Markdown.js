import RawHtml from './RawHtml'
import PropTypes from 'prop-types'
import parseMarkdown from '../lib/utils/markdown'
import {css} from 'glamor'

import {
  colors, fontFamilies, mediaQueries
} from '@project-r/styleguide'

const containerStyle = css({
  color: colors.text,
  fontFamily: fontFamilies.serifRegular,
  fontSize: 16,
  lineHeight: '25px',
  [mediaQueries.mUp]: {
    fontSize: 21,
    lineHeight: '32px'
  },
  '& p:first-child': {
    marginTop: 0
  },
  '& p:last-child': {
    marginBottom: 0
  }
})

const Container = ({children, ...props}) => (
  <div {...props} {...containerStyle}>{children}</div>
)

const Markdown = ({content}) => (
  <RawHtml type={Container} style='serif' dangerouslySetInnerHTML={{
    __html: parseMarkdown(content)
  }} />
)

Markdown.propTypes = {
  content: PropTypes.string.isRequired
}

export default Markdown
