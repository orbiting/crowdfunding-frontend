import React from 'react'
import {compose} from 'redux'

import withData from '../lib/withData'
import Frame from '../components/Frame'
import withMe from '../lib/withMe'
import withT from '../lib/withT'
import Poller from '../components/Auth/Poller'
import SignIn from '../components/Auth/SignIn'
import SignOut from '../components/Auth/SignOut'

import {
  H1, P,
  NarrowContainer
} from '@project-r/styleguide'

const Merci = compose(
  withMe,
  withT
)(({me, t, url: {query}}) => {
  if (query.email && query.id) {
    return (
      <div>
        {
          me ? (
            <H1>
              {t('merci/postpay/title/me', {
                name: me.name
              })}
            </H1>
          ) : (
            <P>
              {t('merci/postpay/waiting', {
                email: query.email,
                phrase: query.phrase
              })}<br />
              <Poller onSuccess={() => {}} />
            </P>
          )
        }
      </div>
    )
  }
  return (
    <div>
      <H1>{t('merci/title')}</H1>
      {me ? (
        <div>
          <P>{me.name} {me.email}</P>
          <SignOut />
          <P>TK</P>
        </div>
      ) : (
        <div>
          <P>
            {t('merci/signin')}
          </P>
          <SignIn />
        </div>
      )}
    </div>
  )
})

const MerciPage = ({url}) => (
  <Frame url={url} sidebar={false}>
    <NarrowContainer>
      <Merci url={url} />
    </NarrowContainer>
  </Frame>
)

export default withData(MerciPage)
