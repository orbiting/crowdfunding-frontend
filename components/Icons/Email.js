import React from 'react'

const Icon = ({size, fill, style}) => (
  <svg style={style} width={size} height={size} viewBox='0 0 40 32'>
    <path fill={fill} d='M36,0 L4,0 C1.790861,0 0,1.790861 0,4 L0,28 C0,30.209139 1.790861,32 4,32 L36,32 C38.209139,32 40,30.209139 40,28 L40,4 C40,1.790861 38.209139,0 36,0 L36,0 Z M36,28 L4,28 L4,8 L20,18 L36,8 L36,28 L36,28 Z M36,4 L20,14 L4,4 L4,4 L36,4 L36,4 Z' />
  </svg>
)

Icon.defaultProps = {
  fill: '#000',
  size: 24
}

export default Icon
