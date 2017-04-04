import React, {Component} from 'react'
import {css} from 'glamor'

import {HEADER_HEIGHT} from './Frame/constants'
import Spinner from './Spinner'

const spacerStyle = css({
  position: 'relative',
  minWidth: '100%',
  minHeight: ['100vh', `calc(100vh - ${HEADER_HEIGHT}px)`]
})
const Spacer = ({height, width, children}) => (
  <div {...spacerStyle} style={{minWidth: width, minHeight: height}}>{children}</div>
)

class Loader extends Component {
  constructor (props) {
    super(props)
    this.state = {
      visible: false
    }
  }
  componentDidMount () {
    this.timeout = setTimeout(() => this.setState({visible: true}), this.props.delay)
  }
  componentWillUnmount () {
    clearTimeout(this.timeout)
  }
  render () {
    const {visible} = this.state
    const {
      width, height,
      loading, error, render
    } = this.props
    if (loading && !visible) {
      return <Spacer width={width} height={height} />
    } else if (loading) {
      return (
        <Spacer width={width} height={height}>
          <Spinner />
        </Spacer>
      )
    } else if (error) {
      return (
        <Spacer width={width} height={height}>
          {error.toString()}
        </Spacer>
      )
    }
    return render()
  }
}

Loader.defaultProps = {
  delay: 500
}

export default Loader
