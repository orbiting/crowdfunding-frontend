import React, {Component} from 'react'
import {css} from 'glamor'

import 'glamor/reset'

import {withStatus} from '../Status'

import Header from './Header'
import Footer from './Footer'
import Sidebar from './Sidebar'
import Meta from './Meta'
import Content from './Content'

import {
  SIDEBAR_WIDTH, HEADER_HEIGHT
} from './constants'

import {
  Container,
  mediaQueries,
  fontFamilies,
  NarrowContainer
} from '@project-r/styleguide'

css.global('html', {boxSizing: 'border-box'})
css.global('*, *:before, *:after', {boxSizing: 'inherit'})

css.global('body', {
  fontFamily: fontFamilies.sansSerifRegular
})

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
    const {
      children,
      cover, indented, sidebar, forceStatus,
      crowdfunding, crowdfunding: {hasEnded},
      url, meta
    } = this.props
    const {sticky} = this.state

    const sidebarAdditionalStyle = url.pathname !== '/' && url.pathname !== '/crowdfunding'
      ? styles.hideOnMobile
      : {}

    return (
      <div {...styles.container}>
        {!!meta && <Meta data={meta} />}
        <div {...styles.bodyGrower} className={!cover ? styles.coverless : undefined}>
          <Header crowdfunding={crowdfunding} url={url} forceStatus={forceStatus} cover={cover} sticky={sticky} sidebar={sidebar} />
          {sidebar ? (
            !hasEnded || forceStatus ? (
              <Container>
                <div {...styles.sidebar} {...sidebarAdditionalStyle}>
                  <Sidebar
                    hasEnded={hasEnded}
                    sticky={sticky}
                    setSticky={this.setSticky} />
                </div>
                <Content indented={indented}>{children}</Content>
              </Container>
            )
            : <NarrowContainer>{children}</NarrowContainer>
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

export default withStatus(Frame)
