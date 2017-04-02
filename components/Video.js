import React from 'react'

import {css} from 'glamor'

const styles = {
  wrapper: css({
    position: 'relative',
    height: '56.25vw',
    maxHeight: '80vh',
    background: '#EBF6E5'
  }),
  video: css({
    width: '100vw',
    height: '56.25vw',
    maxHeight: '80vh',
    maxWidth: '177.78vh',
    margin: 'auto',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0
  })
}

export default () => (
  <div {...styles.wrapper}>
    <video {...styles.video} loop autoPlay>
      <source src='https://archive.org/download/springgreen/springgreen.mp4' type='video/mp4' />
    </video>
  </div>
)
