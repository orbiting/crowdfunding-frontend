import React, {Component} from 'react'

import {css} from 'glamor'
import VideoPlayer from './VideoPlayer'
import {scrollIt} from '../lib/utils/scroll'
import {HEADER_HEIGHT} from './Frame/constants'

import {
  Logo, Container, CONTENT_PADDING as CONTAINER_PADDING
} from '@project-r/styleguide'

const styles = {
  wrapper: css({
    position: 'relative',
    height: '56.25vw',
    backgroundColor: '#000'
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
  }
  render () {
    const {src} = this.props
    const {playing} = this.state
    return (
      <div {...styles.wrapper} style={{maxHeight: '80vh'}}>
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
            this.ended = false
            this.setState(() => ({
              playing: false
            }))
          }}
          onProgress={(progress) => {
            if (progress > 0.96 && !this.ended) {
              this.ended = true
              scrollIt(
                (window.innerHeight * 0.8) - HEADER_HEIGHT - 40,
                800
              )
            }
          }}
          style={{
            maxHeight: '80vh'
          }} />
      </div>
    )
  }
}

export default VideoCover
