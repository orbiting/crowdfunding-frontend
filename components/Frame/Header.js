import React, {Component} from 'react'
import {css, merge} from 'glamor'
import Link from 'next/link'

import {
  Logo, linkRule,
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
    padding: '20px 0'
  }),
  barCenterSticky: css({
    borderBottom: `1px solid ${colors.disabled}`,
    height: HEADER_HEIGHT
  }),
  menu: css({
    float: 'right'
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
              <a><Logo width={sticky ? 180 : 300} /></a>
            </Link>
            <div {...styles.menu}>
              <Link href='/updates'>
                <a {...linkRule}>Updates</a>
              </Link>
              {' '}&nbsp;{' '}
              <Link href='/community'>
                <a {...linkRule}>Community</a>
              </Link>
              {' '}&nbsp;{' '}
              <Link href='/events'>
                <a {...linkRule}>Veranstaltungen</a>
              </Link>
              {' '}&nbsp;{' '}
              <Link href='/faq'>
                <a {...linkRule}>FAQ</a>
              </Link>
            </div>
          </div>
        </div>
        <LoadingBar />
        {cover}
      </div>
    )
  }
}

export default Header
