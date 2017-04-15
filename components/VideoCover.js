import React, {Component} from 'react'

import {css} from 'glamor'
import VideoPlayer from './VideoPlayer'
import {scrollIt} from '../lib/utils/scroll'
import {
  HEADER_HEIGHT,
  HEADER_HEIGHT_MOBILE,
  MENUBAR_HEIGHT
} from './Frame/constants'

import {
  Logo,
  Container, CONTENT_PADDING as CONTAINER_PADDING,
  mediaQueries
} from '@project-r/styleguide'

const styles = {
  wrapper: css({
    position: 'relative',
    height: '56.25vw',
    backgroundColor: '#000',
    transition: 'height 200ms'
  }),
  logo: css({
    position: 'absolute',
    top: 20,
    left: CONTAINER_PADDING,
    zIndex: 1,
    width: '30%',
    transition: 'opacity 200ms'
  })
}

class VideoCover extends Component {
  constructor (props) {
    super(props)

    this.state = {
      playing: false
    }
    this.measure = () => {
      this.setState(() => {
        const windowWidth = window.innerWidth
        const windowHeight = window.innerHeight
        let videoHeight = windowWidth * 0.5625
        return {
          mobile: windowWidth < mediaQueries.mBreakPoint,
          windowHeight,
          videoHeight
        }
      })
    }
  }
  componentDidMount () {
    window.addEventListener('resize', this.measure)
    this.measure()
  }
  componentWillUnmount () {
    window.removeEventListener('resize', this.measure)
  }
  render () {
    const {src} = this.props
    const {
      playing, ended,
      videoHeight, windowHeight,
      mobile
    } = this.state

    const limitedHeight = (!playing || !videoHeight)
    const heightStyle = {
      height: playing && !ended ? windowHeight : videoHeight,
      maxHeight: limitedHeight ? '80vh' : undefined
    }
    return (
      <div {...styles.wrapper} style={heightStyle}>
        <Container style={{position: 'relative'}}>
          <div {...styles.logo}
            style={{opacity: playing ? 0 : 1}}>
            <Logo fill='#fff' />
          </div>
        </Container>
        <VideoPlayer src={src}
          onPlay={() => {
            this.setState(() => ({
              playing: true
            }))
          }}
          onPause={() => {
            this.setState(() => ({
              ended: false,
              playing: false
            }))
          }}
          onProgress={(progress) => {
            if (progress > 0.95 && !ended && videoHeight) {
              this.setState(() => ({ended: true}), () => {
                const topFixed = mobile
                  ? HEADER_HEIGHT_MOBILE + MENUBAR_HEIGHT
                  : HEADER_HEIGHT
                scrollIt(
                  videoHeight - topFixed + 5,
                  800
                )
              })
            }
          }}
          style={heightStyle} />
      </div>
    )
  }
}

export default VideoCover
