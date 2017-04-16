import React, {Component} from 'react'

import {css} from 'glamor'
import VideoPlayer from './VideoPlayer'
import Play from './Icons/Play'

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

const blinkBg = css.keyframes({
  'from, to': {
    backgroundColor: 'transparent'
  },
  '50%': {
    backgroundColor: 'white'
  }
})
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
    zIndex: 2,
    width: '30%',
    transition: 'opacity 200ms'
  }),
  cover: css({
    position: 'absolute',
    cursor: 'pointer',
    zIndex: 1,
    left: 0,
    top: 0
  }),
  poster: css({
    width: '100%',
    height: '56.25vw'
  }),
  cursor: css({
    position: 'absolute',
    top: '39.5%',
    left: '65.6%',
    height: '11%',
    width: '0.3%',
    minWidth: 1,
    animation: `1s ${blinkBg} step-end infinite`
  }),
  play: css({
    position: 'absolute',
    top: '60%',
    left: '5%',
    right: '5%',
    textAlign: 'center'
  })
}

class VideoCover extends Component {
  constructor (props) {
    super(props)

    this.state = {
      playing: false,
      cover: true
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
    this.ref = ref => { this.player = ref }
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
      mobile, cover
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
        <div {...styles.cover}
          style={{opacity: cover ? 1 : 0}}
          onClick={() => {
            this.setState(() => {
              this.player.toggle()
              return {
                cover: false
              }
            })
          }}>
          <img src={src.poster} {...styles.poster} style={heightStyle} />
          <div {...styles.cursor} />
          <div {...styles.play}>
            <Play />
          </div>
        </div>
        <VideoPlayer ref={this.ref} src={src}
          hidePlay={cover}
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
            if (progress > 0.999 && !cover) {
              this.setState(() => ({cover: true}))
            }
          }}
          style={heightStyle} />
      </div>
    )
  }
}

export default VideoCover
