import React, {Component} from 'react'
import {css} from 'glamor'

import 'glamor/reset'
import Header from './Header'
import Footer from './Footer'
import Sidebar from './Sidebar'
import Meta from './Meta'

import {
  SIDEBAR_WIDTH, HEADER_HEIGHT
} from './constants'

import {
  Container,
  mediaQueries
} from '@project-r/styleguide'

css.global('html', {boxSizing: 'border-box'})
css.global('*, *:before, *:after', {boxSizing: 'inherit'})

const styles = {
  container: css({
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column'
  }),
  coverless: css({
    paddingTop: HEADER_HEIGHT + 40
  }),
  sidebar: css({
    [mediaQueries.mUp]: {
      float: 'right',
      width: SIDEBAR_WIDTH
    }
  }),
  hideOnMobile: css({
    [mediaQueries.onlyS]: {
      display: 'none'
    }
  }),
  bodyGrower: css({
    flexGrow: 1
  })
}

class Frame extends Component {
  constructor (...args) {
    super(...args)
    this.state = {
      sticky: {}
    }
    this.setSticky = (sticky) => {
      this.setState(state => ({
        sticky: {
          ...state.sticky,
          ...sticky
        }
      }))
    }
  }
  render () {
    const {children, cover, sidebar, url, meta} = this.props
    const {sticky} = this.state

    const sidebarAdditionalStyle = url.pathname !== '/'
      ? styles.hideOnMobile
      : {}

    return (
      <div {...styles.container}>
        {!!meta && <Meta data={meta} />}
        <div {...styles.bodyGrower} className={!cover ? styles.coverless : undefined}>
          <Header url={url} cover={cover} sticky={sticky} sidebar={sidebar} />
          {sidebar ? (
            <Container>
              <div {...styles.sidebar} {...sidebarAdditionalStyle}>
                <Sidebar sticky={sticky} setSticky={this.setSticky} />
              </div>
              {children}
            </Container>
          ) : children}
        </div>
        <Footer />
      </div>
    )
  }
}

Frame.defaultProps = {
  sidebar: true
}

export default Frame
