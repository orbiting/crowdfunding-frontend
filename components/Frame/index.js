import React from 'react'
import {css} from 'glamor'

import 'glamor/reset'
import Header, {HEADER_HEIGHT} from './Header'

css.global('html', {boxSizing: 'border-box'})
css.global('*, *:before, *:after', {boxSizing: 'inherit'})

const styles = {
  container: css({
    paddingBottom: 60
  }),
  coverless: css({
    paddingTop: HEADER_HEIGHT + 10
  })
}

export default ({ children, cover, sidebar = true }) => (
  <div {...styles.container} className={!cover ? styles.coverless : undefined}>
    <Header cover={cover} />
    {children}
  </div>
)
