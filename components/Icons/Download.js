import React from 'react'

const Icon = ({size, fill, style}) => (
  <svg style={style} width={size} height={size} viewBox='0 0 24 24'>
    <path fill={fill} d='M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z' />
    <path d='M0 0h24v24H0z' fill='none' />
  </svg>
)

Icon.defaultProps = {
  fill: '#000',
  size: 24
}

export default Icon
