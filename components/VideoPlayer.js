import React, {Component} from 'react'

import {css} from 'glamor'
import Play from './Icons/Play'
import Volume from './Icons/Volume'

import {
  colors
} from '@project-r/styleguide'

const PROGRESS_HEIGHT = 4

const styles = {
  wrapper: css({
    position: 'relative',
    lineHeight: 0,
    marginBottom: PROGRESS_HEIGHT
  }),
  video: css({
    width: '100%',
    height: 'auto',
    transition: 'height 200ms',
    '::-webkit-media-controls-panel': {
      display: 'none !important'
    },
    '::--webkit-media-controls-play-button': {
      display: 'none !important'
    },
    '::-webkit-media-controls-start-playback-button': {
      display: 'none !important'
    }
  }),
  controls: css({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    cursor: 'pointer',
    transition: 'opacity 200ms'
  }),
  play: css({
    position: 'absolute',
    top: '50%',
    left: '5%',
    right: '5%',
    marginTop: -18,
    textAlign: 'center',
    transition: 'opacity 200ms'
  }),
  progress: css({
    position: 'absolute',
    backgroundColor: colors.primary,
    bottom: -PROGRESS_HEIGHT,
    left: 0,
    height: PROGRESS_HEIGHT
  }),
  volume: css({
    position: 'absolute',
    zIndex: 6,
    right: 10,
    bottom: 10,
    cursor: 'pointer'
  }),
  scrub: css({
    zIndex: 3,
    position: 'absolute',
    height: '10%',
    bottom: -PROGRESS_HEIGHT,
    left: 0,
    right: 0,
    cursor: 'ew-resize'
  })
}

class VideoPlayer extends Component {
  constructor (props) {
    super(props)

    this.state = {
      playing: false,
      progress: 0,
      muted: false
    }

    this.updateProgress = () => {
      const {video} = this
      if (!video) {
        return
      }
      this.setState(() => {
        const progress = video.currentTime / video.duration
        this.props.onProgress && this.props.onProgress(progress)
        return {
          progress
        }
      })
    }
    this.syncProgress = () => {
      this.readTimeout = setTimeout(
        () => {
          this.updateProgress()
          this.syncProgress()
        },
        16
      )
    }
    this.ref = ref => { this.video = ref }
    this.onPlay = () => {
      this.setState(() => ({
        playing: true
      }))
      this.syncProgress()
      this.props.onPlay && this.props.onPlay()
    }
    this.onPause = () => {
      this.setState(() => ({
        playing: false
      }))
      clearTimeout(this.readTimeout)
      this.props.onPause && this.props.onPause()
    }
    this.scrubRef = ref => { this.scrubber = ref }
    this.scrub = (event) => {
      const {scrubber, video} = this
      if (this.scrubbing && scrubber && video && video.duration) {
        event.preventDefault()
        const rect = scrubber.getBoundingClientRect()

        let currentEvent = event
        if (currentEvent.nativeEvent) {
          currentEvent = event.nativeEvent
        }
        while (currentEvent.sourceEvent) {
          currentEvent = currentEvent.sourceEvent
        }
        if (currentEvent.changedTouches) {
          currentEvent = currentEvent.changedTouches[0]
        }

        const progress = Math.min(
          1,
          Math.max(
            (currentEvent.clientX - rect.left) / rect.width,
            0
          )
        )
        video.currentTime = video.duration * progress
        this.updateProgress()
      }
    }
    this.scrubStart = event => {
      this.scrubbing = true
      if (event.type === 'mousedown') {
        const up = e => {
          this.scrubEnd(e)
          document.removeEventListener('mousemove', this.scrub)
          document.removeEventListener('mouseup', up)
        }
        document.addEventListener('mousemove', this.scrub)
        document.addEventListener('mouseup', up)
      }
      this.scrub(event)
    }
    this.scrubEnd = event => {
      this.scrub(event)
      this.scrubbing = false
    }
  }
  toggle () {
    const {video} = this
    if (video) {
      if (video.paused || video.ended) {
        this.play()
      } else {
        this.pause()
      }
    }
  }
  play () {
    const {video} = this
    video && video.play()
  }
  pause () {
    const {video} = this
    video && video.pause()
  }
  componentDidMount () {
    this.video.addEventListener('play', this.onPlay)
    this.video.addEventListener('pause', this.onPause)
  }
  componentWillUnmount () {
    this.video.removeEventListener('play', this.onPlay)
    this.video.removeEventListener('pause', this.onPause)
  }
  render () {
    const {src, hidePlay} = this.props
    const {playing, progress, muted} = this.state

    return (
      <div {...styles.wrapper}>
        <video {...styles.video}
          style={this.props.style}
          muted={muted}
          ref={this.ref}
          poster={src.poster}>
          <source src={src.hls} type='application/x-mpegURL' />
          <source src={src.mp4} type='video/mp4' />
        </video>
        <div {...styles.controls}
          style={{opacity: playing ? 0 : 1}}
          onClick={() => this.toggle()}>
          <div {...styles.play} style={{
            opacity: (hidePlay || playing) ? 0 : 1
          }}>
            <Play />
          </div>
          <div {...styles.volume} onClick={(e) => {
            e.stopPropagation()
            this.setState((state) => ({
              muted: !state.muted
            }))
          }}>
            <Volume off={muted} />
          </div>
        </div>
        <div {...styles.progress}
          style={{width: `${progress * 100}%`}} />
        <div {...styles.scrub}
          ref={this.scrubRef}
          onTouchStart={this.scrubStart}
          onTouchMove={this.scrub}
          onTouchEnd={this.scrubEnd}
          onMouseDown={this.scrubStart} />
      </div>
    )
  }
}

VideoPlayer.defaultProps = {
  hidePlay: false
}

export default VideoPlayer
