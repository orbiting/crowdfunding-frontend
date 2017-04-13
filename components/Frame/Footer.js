import React from 'react'
import {css} from 'glamor'

import {
  Container, Logo, colors
} from '@project-r/styleguide'

import IconLink from '../IconLink'

const styles = {
  bg: css({
    position: 'relative',
    zIndex: 10, // goes over sidebar
    borderTop: '1px solid #DADDDC',
    backgroundColor: '#F6F8F7',
    paddingTop: 30,
    paddingBottom: 30,
    marginTop: 100
  }),
  icons: css({
    float: 'right'
  })
}

const Footer = () => (
  <div {...styles.bg}>
    <Container>
      <Logo fill={colors.secondary} width={140} />
      <div {...styles.icons}>
        <IconLink icon='facebook' href='https://www.facebook.com/RepublikMagazin' target='_blank' fill={colors.secondary} />
        <IconLink icon='twitter' href='https://twitter.com/RepublikMagazin' target='_blank' fill={colors.secondary} />
      </div>
    </Container>
  </div>
)

export default Footer
