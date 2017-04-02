import React, {Component} from 'react'
import {css, merge} from 'glamor'
import Link from 'next/link'

import {
  Logo,
  colors
} from '@project-r/styleguide'

import LoadingBar from './LoadingBar'

export const HEADER_HEIGHT = 60

const styles = {
  bar: css({
    zIndex: 10,
    position: 'fixed',
    '@media print': {
      position: 'absolute'
    },
    top: 0,
    left: 0,
    right: 0,
    padding: '0 20px'
  }),
  barSticky: css({
    backgroundColor: '#fff'
  }),
  barCenter: css({
    maxWidth: 1200,
    margin: '0 auto',
    padding: '15px 0'
  }),
  barCenterSticky: css({
    borderBottom: `1px solid ${colors.disabled}`,
    height: HEADER_HEIGHT
  }),
  logo: css({
    display: 'inline-block',
    verticalAlign: 'middle',
    lineHeight: 0
  }),
  menu: css({
    display: 'inline-block',
    verticalAlign: 'middle',
    paddingLeft: 30,
    margin: 0,
    fontSize: 20,
    '& li': {
      display: 'inline-block',
      marginRight: 20
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
  })
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
    const barCenterStyle = sticky
      ? merge(styles.barCenter, styles.barCenterSticky)
      : styles.barCenter
    return (
      <div>
        <div {...barStyle}>
          <div {...barCenterStyle}>
            <Link href='/'>
              <a {...styles.logo}><Logo height={sticky ? 30 : 40} /></a>
            </Link>
            <ul {...styles.menu}>
              <li>
                <Link href='/updates'>
                  <a {...styles.link}>Updates</a>
                </Link>
              </li>
              <li>
                <Link href='/community'>
                  <a {...styles.link}>Community</a>
                </Link>
              </li>
              <li>
                <Link href='/events'>
                  <a {...styles.link}>Veranstaltungen</a>
                </Link>
              </li>
              <li>
                <Link href='/faq'>
                  <a {...styles.link}>FAQ</a>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <LoadingBar />
        {cover}
      </div>
    )
  }
}

export default Header
