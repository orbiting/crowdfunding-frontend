import React, {Component} from 'react'
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
    paddingTop: HEADER_HEIGHT + 40
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
    const {children, cover} = this.props
    const {sticky} = this.state
    return (
      <div {...styles.container} className={!cover ? styles.coverless : undefined}>
        <Header cover={cover} sticky={sticky} />
        {typeof children === 'function'
          ? children({
            sticky,
            setSticky: this.setSticky
          })
          : children
        }
      </div>
    )
  }
}

export default Frame
