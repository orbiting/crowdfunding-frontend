import React from 'react'
import {css} from 'glamor'

import {swissTime} from '../../lib/utils/formats'
import {intersperse} from '../../lib/utils/helpers'
import withT from '../../lib/withT'

import {
  H1, P, colors,
  fontFamilies, mediaQueries
} from '@project-r/styleguide'

import {CONTENT_PADDING} from '../Frame/constants'

import Share from '../Share'

import {
  PUBLIC_BASE_URL
} from '../../constants'

const BLOCK_PADDING_TOP = 10

const styles = {
  container: css({
    borderBottom: `1px solid ${colors.divider}`,
    marginBottom: 60
  }),
  block: css({
    padding: `${BLOCK_PADDING_TOP}px 0`,
    borderTop: `1px solid ${colors.divider}`,
    position: 'relative',
    [mediaQueries.mUp]: {
      paddingLeft: CONTENT_PADDING
    }
  }),
  hr: css({
    height: 0,
    border: 0,
    borderTop: `1px solid ${colors.divider}`
  }),
  label: css({
    fontFamily: fontFamilies.sansSerifMedium,
    fontSize: 17,
    lineHeight: '25px',
    letterSpacing: -0.19
  })
}

const publishedDateTimeFormat = swissTime.format('%e. %B %Y %H Uhr')

const Update = withT(({
  t,
  data: {
    slug,
    title,
    text,
    publishedDateTime
  }
}) => {
  const date = new Date(publishedDateTime)

  const paragraphs = (text || '').split('\n\n')

  return (
    <div {...styles.container}>
      <H1 style={{marginBottom: 15}}>{title}</H1>
      <div {...styles.label}>
        {publishedDateTimeFormat(date)}
      </div>
      {paragraphs.map(p => (
        <P>
          {intersperse(
            p.split('\n'),
            (d, i) => <br key={i} />
          )}
        </P>
      ))}

      <P>
        <Share
          fill={colors.secondary}
          url={`${PUBLIC_BASE_URL}/updates/${slug}`}
          emailSubject={title}
          tweet={title} />
      </P>
    </div>
  )
})

export default Update
