import React, {Component} from 'react'
import {css, merge} from 'glamor'
import Link from 'next/link'

import {
  Logo, A
} from '@project-r/styleguide'

const styles = {
  bar: css({
    padding: 20
  }),
  barSticky: css({
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    height: 60
  }),
  menu: css({
    float: 'right'
  })
}

class Header extends Component {
  constructor (props) {
    super(props)

    this.state = {
      fixed: !this.props.cover
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
        {cover}
      </div>
    )
  }
}

export default Header
