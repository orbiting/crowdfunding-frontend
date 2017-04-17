import React from 'react'
import {errorToString} from '../lib/utils/errors'

import {
  P, colors
} from '@project-r/styleguide'

export default ({error}) => (
  <P style={{color: colors.error}}>
    {errorToString(error)}
  </P>
)
