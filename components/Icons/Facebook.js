import React from 'react'

const Icon = ({size, fill, style}) => (
  <svg style={style} width={size} height={size} viewBox='0 0 24 24'>
    <path fill={fill} d='M17,2V2H17V6H15C14.31,6 14,6.81 14,7.5V10H14L17,10V14H14V22H10V14H7V10H10V6A4,4 0 0,1 14,2H17Z' />
  </svg>
)

Icon.defaultProps = {
  fill: '#000',
  size: 24
}

export default Icon
