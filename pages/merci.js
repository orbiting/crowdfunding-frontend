import React from 'react'
import withData from '../lib/withData'
import Frame from '../components/Frame'
import withMe from '../lib/withMe'
import Poller from '../components/Auth/Poller'
import SignIn from '../components/Auth/SignIn'

import {
  H1, P, A,
  NarrowContainer
} from '@project-r/styleguide'

const Merci = withMe(({me, url: {query}}) => {
  if (query.email && query.id) {
    return (
      <div>
        {
          me ? (
            <H1>Merci {me.name || me.email}</H1>
          ) : (
            <P>
              Bitte bestätigen Sie ihre Email-Adresse:<br />
              {query.email} <A>ändern</A><br />
              <Poller onSuccess={() => {}} />
            </P>
          )
        }
      </div>
    )
  }
  if (!me) {
    return (
      <div>
        <H1>Deinen Pledge ansehen</H1>
        {me ? (
          <P>TK</P>
        ) : (
          <div>
            <P>
              Bitte anmelden:
            </P>
            <SignIn />
          </div>
        )}
      </div>
    )
  }
})

const MerciPage = ({url}) => (
  <Frame>
    <NarrowContainer>
      <Merci url={url} />
    </NarrowContainer>
  </Frame>
)

export default withData(MerciPage)
