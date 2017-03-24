import React, {Component} from 'react'
import {css, merge} from 'glamor'
import Link from 'next/link'
import Router from 'next/router'

import {
  Logo, A,
  colors
} from '@project-r/styleguide'

export const HEADER_HEIGHT = 60

const styles = {
  bar: css({
    position: 'fixed',
    '@media print': {
      position: 'absolute'
    },
    top: 0,
    left: 0,
    right: 0,
    padding: 20
  }),
  barSticky: css({
    backgroundColor: '#fff',
    height: HEADER_HEIGHT
  }),
  menu: css({
    float: 'right'
  }),
  loadingBar: css({
    position: 'fixed',
    top: 0,
    left: 0,
    height: 2,
    backgroundColor: colors.primary,
    transition: 'width 200ms linear, opacity 200ms linear'
  })
}

class LoadingBar extends Component {
  constructor (props) {
    super(props)

    this.state = {
      loading: false,
      progress: 0
    }
  }
  componentDidMount () {
    Router.onRouteChangeStart = (url) => {
      clearTimeout(this.timeout)
      this.setState({loading: true, progress: 0.02})
    }
    Router.onRouteChangeComplete = () => {
      clearTimeout(this.timeout)
      this.setState({loading: false})
    }
    Router.onRouteChangeError = () => {
      clearTimeout(this.timeout)
      this.setState({loading: false})
    }
  }
  componentWillUnmount () {
    Router.onRouteChangeStart = null
    Router.onRouteChangeComplete = null
    Router.onRouteChangeError = null
  }
  componentDidUpdate () {
    if (this.state.loading) {
      clearTimeout(this.timeout)
      this.timeout = setTimeout(
        () => {
          this.setState(({progress}) => {
            let amount = 0
            if (progress >= 0 && progress < 0.2) {
              amount = 0.1
            } else if (progress >= 0.2 && progress < 0.5) {
              amount = 0.04
            } else if (progress >= 0.5 && progress < 0.8) {
              amount = 0.02
            } else if (progress >= 0.8 && progress < 0.99) {
              amount = 0.005
            }
            return {
              progress: progress + amount
            }
          })
        },
        200
      )
    }
  }
  render () {
    const {loading, progress} = this.state
    return (
      <div {...styles.loadingBar} style={{
        opacity: loading ? 1 : 0,
        width: `${progress * 100}%`
      }} />
    )
  }
}

class Header extends Component {
  constructor (props) {
    super(props)

    this.state = {
      sticky: !this.props.cover
    }

    this.onScroll = () => {
      const y = window.pageYOffset

      const sticky = y > 200 || !this.props.cover

      if (sticky !== this.state.sticky) {
        this.setState(() => ({sticky}))
      }
    }
  }
  componentDidMount () {
    window.addEventListener('scroll', this.onScroll)
    this.onScroll()
  }
  componentDidUpdate () {
    this.onScroll()
  }
  componentWillUnmount () {
    window.removeEventListener('scroll', this.onScroll)
  }
  render () {
    const {cover} = this.props
    const {sticky} = this.state

    const barStyle = sticky
      ? merge(styles.bar, styles.barSticky)
      : styles.bar
    return (
      <div>
        <div {...barStyle}>
          <Link href='/'>
            <a><Logo width={sticky ? 180 : 300} /></a>
          </Link>
          <div {...styles.menu}>
            <Link href='/updates'>
              <A href='#'>Updates</A>
            </Link>
            {' '}&nbsp;{' '}
            <Link href='/community'>
              <A href='#'>Community</A>
            </Link>
            {' '}&nbsp;{' '}
            <Link href='/events'>
              <A href='#'>Veranstaltungen</A>
            </Link>
            {' '}&nbsp;{' '}
            <Link href='/faq'>
              <A href='#'>FAQ</A>
            </Link>
          </div>
        </div>
        <LoadingBar />
        {cover}
      </div>
    )
  }
}

export default Header
