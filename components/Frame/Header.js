import React, {Component} from 'react'
import {css, merge} from 'glamor'
import Router from 'next/router'
import Status from '../Status'
import withT from '../../lib/withT'

import {
  Logo,
  Button,
  Container, CONTENT_PADDING as CONTAINER_PADDING,
  colors, mediaQueries
} from '@project-r/styleguide'

import Menu from './Menu'
import Toggle from './Toggle'
import LoadingBar from './LoadingBar'
import {
  SIDEBAR_WIDTH,
  HEADER_HEIGHT, HEADER_HEIGHT_MOBILE,
  MENUBAR_HEIGHT
} from './constants'

const styles = {
  bar: css({
    zIndex: 20, // goes over footer
    position: 'fixed',
    '@media print': {
      position: 'absolute'
    },
    top: 0,
    left: 0,
    right: 0
  }),
  barOpaque: css({
    backgroundColor: '#fff',
    height: HEADER_HEIGHT_MOBILE,
    [mediaQueries.mUp]: {
      height: HEADER_HEIGHT
    },
    borderBottom: `1px solid ${colors.divider}`
  }),
  menuBar: css({
    position: 'fixed',
    zIndex: 10,
    top: HEADER_HEIGHT_MOBILE,
    left: 0,
    right: 0,
    height: MENUBAR_HEIGHT,
    backgroundColor: '#fff',
    borderBottom: `1px solid ${colors.divider}`,
    [mediaQueries.mUp]: {
      display: 'none'
    }
  }),
  menuBarText: css({
    fontSize: 32,
    opacity: 0.3,
    padding: '7px 15px'
  }),
  logo: css({
    paddingTop: 15,
    [mediaQueries.mUp]: {
      paddingTop: 25
    },
    display: 'inline-block',
    verticalAlign: 'middle',
    lineHeight: 0
  }),
  menu: css({
    [mediaQueries.mUp]: {
      display: 'inline-block',
      marginLeft: 15,
      paddingTop: 25,
      verticalAlign: 'middle'
    }
  }),
  link: css({
    textDecoration: 'none',
    color: colors.text,
    ':visited': {
      color: colors.text
    },
    ':hover': {
      color: '#ccc'
    }
  }),
  cover: css({
    marginBottom: 40
  }),
  side: css({
    position: 'absolute',
    right: 0,
    top: 0,
    width: '50%',
    [mediaQueries.mUp]: {
      right: CONTAINER_PADDING,
      width: SIDEBAR_WIDTH
    }
  })
}

class Header extends Component {
  constructor (props) {
    super(props)

    this.state = {
      opaque: !this.props.cover,
      mobile: false,
      expanded: false
    }

    this.onScroll = () => {
      const y = window.pageYOffset

      const yOpaque = this.state.mobile ? 70 : 150
      const opaque = y > yOpaque || !this.props.cover

      if (opaque !== this.state.opaque) {
        this.setState(() => ({opaque}))
      }
    }
    this.measure = () => {
      const mobile = window.innerWidth < mediaQueries.mBreakPoint
      if (mobile !== this.state.mobile) {
        this.setState(() => ({mobile}))
      }
      const hasStatusSpace = window.innerWidth >= 1000
      if (hasStatusSpace !== this.state.hasStatusSpace) {
        this.setState(() => ({hasStatusSpace}))
      }
      this.onScroll()
    }
  }
  componentDidMount () {
    window.addEventListener('scroll', this.onScroll)
    window.addEventListener('resize', this.measure)
    this.measure()
  }
  componentDidUpdate () {
    this.measure()
  }
  componentWillUnmount () {
    window.removeEventListener('scroll', this.onScroll)
    window.removeEventListener('resize', this.measure)
  }
  render () {
    const {cover, sticky, sidebar, url, t} = this.props
    const {mobile, expanded, hasStatusSpace} = this.state

    const opaque = this.state.opaque || expanded

    const barStyle = opaque
      ? merge(styles.bar, styles.barOpaque)
      : styles.bar

    const logoHeight = mobile ? 18 : 30

    const menuItems = [
      {
        label: t('menu/crew'),
        href: '/crew'
      },
      {
        label: t('menu/updates'),
        href: '/updates'
      },
      {
        label: t('menu/events'),
        href: '/events'
      },
      {
        label: t('menu/community'),
        href: '/community'
      },
      {
        label: t('menu/faq'),
        href: '/faq'
      }
    ]

    return (
      <div>
        <div {...barStyle}>
          <Container style={{position: 'relative'}}>
            {opaque && (
              <a {...styles.logo} href='/' onClick={(e) => {
                if (e.currentTarget.nodeName === 'A' &&
                  (e.metaKey || e.ctrlKey || e.shiftKey || (e.nativeEvent && e.nativeEvent.which === 2))) {
                  // ignore click for new tab / new window behavior
                  return
                }
                e.preventDefault()
                if (url.pathname === '/') {
                  if (mobile && expanded) {
                    this.setState({expanded: false})
                  }
                  window.scrollTo(0, 0)
                } else {
                  Router.push('/').then(() => window.scrollTo(0, 0))
                }
              }}>
                <Logo height={logoHeight} />
              </a>
            )}
            <div {...styles.menu}>
              {(mobile || opaque) && <Menu expanded={expanded}
                id='primary-menu' items={menuItems} url={url}>
                {
                  mobile && expanded && <Status compact />
                }
              </Menu>}
            </div>
            {opaque && <div {...styles.side}>
              {
                mobile && (
                  <Button block primary
                    onClick={() => {
                      Router.push('/pledge').then(() => window.scrollTo(0, 0))
                    }}
                    style={{height: HEADER_HEIGHT_MOBILE}}>
                    {t('header/button')}
                  </Button>
                )
              }
              {
                !mobile && !!hasStatusSpace && (!!sticky.status || !sidebar) && (
                  <Status compact />
                )
              }
            </div>}
          </Container>
        </div>
        {opaque && <div {...styles.menuBar} onClick={() => this.setState({expanded: !expanded})}>
          <div {...styles.menuBarText}>
            {t.first([
              `menu${url.pathname}`,
              `footer${url.pathname}`
            ], {}, url.pathname)}
          </div>
          <Toggle expanded={expanded} id='primary-menu'
            onClick={() => this.setState({expanded: !expanded})} />
        </div>}
        <LoadingBar />
        {!!cover && (
          <div {...styles.cover}>
            {cover}
          </div>
        )}
      </div>
    )
  }
}

export default withT(Header)
