import React from 'react'
import {css} from 'glamor'

const containerStyle = css({
  display: 'block',
  position: 'absolute',
  width: 50,
  height: 50,
  top: '50%',
  left: '50%'
})
const spin = css.keyframes({
  '0%': {opacity: 1},
  '100%': {opacity: 0.15}
})
const barStyle = css({
  display: 'block',
  animation: `${spin} 1.2s linear infinite`,
  borderRadius: 5,
  backgroundColor: '#999',
  position: 'absolute',
  width: '20%',
  height: '7.8%',
  top: '-3.9%',
  left: '-10%'
})

const Spinner = () => {
  let bars = []
  for (let i = 0; i < 12; i++) {
    let style = {}
    style.WebkitAnimationDelay = style.animationDelay =
      (i - 12) / 10 + 's'
    style.WebkitTransform = style.transform =
      'rotate(' + (i * 30) + 'deg) translate(146%)'

    bars.push(
      <span {...barStyle} style={style} key={i} />
    )
  }

  return (
    <span {...containerStyle}>
      {bars}
    </span>
  )
}

const inlineBlock = css({
  display: 'inline-block',
  width: 50,
  height: 50
})

export const InlineSpinner = () => (
  <span {...inlineBlock}>
    <Spinner />
  </span>
)

export default Spinner
