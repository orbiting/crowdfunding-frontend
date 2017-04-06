import React, {Component} from 'react'
import withT from '../../lib/withT'

import Accordion from '../Pledge/Accordion'
import Status from '../Status'

import Router from 'next/router'
import Link from 'next/link'
import {css} from 'glamor'

import {HEADER_HEIGHT, SIDEBAR_WIDTH} from './constants'

import {
  Button,
  P,
  colors, mediaQueries
} from '@project-r/styleguide'

const styles = {
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
  sticky: css({
    display: 'none',
    [mediaQueries.mUp]: {
      display: 'block',
      position: 'fixed',
      zIndex: 1,
      width: SIDEBAR_WIDTH,
      top: HEADER_HEIGHT,
      backgroundColor: '#fff'
    }
  })
}

const SidebarInner = withT(({t}) => (
  <div style={{paddingTop: 10}}>
    <Accordion onSelect={params => {
      Router.push({
        pathname: '/pledge',
        query: params
      }).then(() => window.scrollTo(0, 0))
    }} />
    <P>
      <Button block>{t('sidebar/reminder/button')}</Button>
    </P>
    <P style={{textAlign: 'center'}}>
      <Link href='/merci'>
        <a {...styles.link}>{t('sidebar/signIn')}</a>
      </Link>
    </P>
  </div>
))

class Sidebar extends Component {
  constructor (props) {
    super(props)
    this.state = {}

    this.onScroll = () => {
      const y = window.pageYOffset
      const height = window.innerHeight
      const mobile = window.innerWidth < mediaQueries.mBreakPoint
      const {sticky, setSticky} = this.props

      let status = false
      let sidebar = false
      if (y + HEADER_HEIGHT > this.y) {
        status = true
        if (!mobile && height - HEADER_HEIGHT > this.innerHeight) {
          sidebar = true
        }
      }

      if (sticky.status !== status || sticky.sidebar !== sidebar) {
        setSticky({
          status,
          sidebar
        })
      }
    }
    this.innerRef = ref => { this.inner = ref }
    this.measure = () => {
      if (this.inner) {
        const rect = this.inner.getBoundingClientRect()

        this.y = window.pageYOffset + rect.top
        this.innerHeight = rect.height

        const right = window.innerWidth - rect.right

        if (right !== this.state.right) {
          this.setState(() => ({
            right
          }))
        }
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
    const {right} = this.state
    const {sticky} = this.props
    return (
      <div>
        <Status />

        <div ref={this.innerRef} style={{
          visibility: sticky.sidebar ? 'hidden' : 'visible'
        }}>
          <SidebarInner />
        </div>

        {!!sticky.sidebar && (
          <div {...styles.sticky} style={{right: right}}>
            <SidebarInner />
          </div>
        )}
      </div>
    )
  }
}

export default Sidebar
