import React from 'react'
import withMe from '../../lib/withMe'

import SignIn from './SignIn'
import SignOut from './SignOut'

export default withMe(({me}) => (
  <div>
    {me ? (
      <div>
        Hallo {me.name || me.email}<br />
        <SignOut />
      </div>
    ) : (
      <SignIn />
    )}
  </div>
))
