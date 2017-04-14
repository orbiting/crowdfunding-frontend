import React from 'react'
import {css} from 'glamor'
import withT from '../../lib/withT'
import {intersperse} from '../../lib/utils/helpers'
import Link from 'next/link'

import {
  Container, Logo, colors, mediaQueries,
  fontFamilies
} from '@project-r/styleguide'

import IconLink from '../IconLink'

const COL_PADDING_S = 15
const COL_PADDING_M = 70

const styles = {
  bg: css({
    position: 'relative',
    zIndex: 10, // goes over sidebar
    borderTop: `1px solid ${colors.divider}`,
    backgroundColor: colors.secondaryBg,
    paddingTop: 30,
    paddingBottom: 30,
    marginTop: 100
  }),
  icons: css({
    float: 'right'
  }),
  grid: css({
    marginLeft: -COL_PADDING_S,
    [mediaQueries.mUp]: {
      marginLeft: -COL_PADDING_M
    },
    ':after': {
      content: '""',
      display: 'table',
      clear: 'both'
    }
  }),
  column: css({
    paddingLeft: COL_PADDING_S,
    paddingRight: COL_PADDING_S,
    fontSize: 12,
    lineHeight: '18px',
    fontFamily: fontFamilies.sansSerifRegular,
    color: colors.secondary,
    float: 'left',
    width: '50%',
    [mediaQueries.mUp]: {
      fontSize: 17,
      lineHeight: '25px',
      paddingLeft: COL_PADDING_M,
      paddingRight: COL_PADDING_M,
      width: '25%'
    },
    '& a': {
      textDecoration: 'none',
      color: colors.secondary,
      ':visited': {
        color: colors.secondary
      },
      ':hover': {
        color: colors.primary
      }
    }
  }),
  title: css({
    fontFamily: fontFamilies.sansSerifMedium
  }),
  hr: css({
    marginTop: 20,
    marginBottom: 20,
    border: 'none',
    borderBottom: `1px solid ${colors.divider}`
  })
}

const Footer = ({t}) => (
  <div {...styles.bg}>
    <Container>
      <div {...styles.grid}>
        <div {...styles.column}>
          <div {...styles.title}>{t('footer/contact/title')}</div>
          <a href='https://www.google.ch/maps/place/Sihlhallenstrasse+1,+8004+Zürich' target='_blank'>{intersperse(
            t('footer/contact/address').split('\n'),
            (item, i) => <br key={i} />
          )}</a>
        </div>
        <div {...styles.column}>
          <div {...styles.title}>{t('footer/about/title')}</div>
          <a href='https://project-r.construction/' target='_blank'>{t('footer/about/projecR')}</a>

        </div>
        <div {...styles.column}>
          <div {...styles.title}>{t('footer/legal/title')}</div>
          <Link href='/impressum'><a>{t('footer/legal/imprint')}</a></Link>
        </div>
      </div>
      <hr {...styles.hr} />
      <Logo fill={colors.secondary} width={140} />
      <div {...styles.icons}>
        <IconLink icon='facebook' href='https://www.facebook.com/RepublikMagazin' target='_blank' fill={colors.secondary} />
        <IconLink icon='twitter' href='https://twitter.com/RepublikMagazin' target='_blank' fill={colors.secondary} />
      </div>
    </Container>
  </div>
)

export default withT(Footer)
