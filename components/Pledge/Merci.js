import React, {Component} from 'react'
import {compose} from 'redux'
import Link from 'next/link'
import {format} from 'url'

import withT from '../../lib/withT'
import withMe from '../../lib/withMe'

import Poller from '../Auth/Poller'
import SignIn from '../Auth/SignIn'

import Belongings from '../Me/Belongings'
import RawHtml from '../RawHtml'

import ClaimPledge from './Claim'

import {
  linkRule,
  Interaction
} from '@project-r/styleguide'

const {H1, P} = Interaction

export const gotoMerci = (query) => {
  // workaround for apollo cache issues
  // - can't manage to clear all query caches
  // - couldn't clear myAddress query,
  //   possibly because id-less address type
  window.location = format({
    pathname: '/merci',
    query
  })
  // Router.push({
  //   pathname: '/merci',
  //   query
  // }).then(() => {
  //   window.scrollTo(0, 0)
  // })
}

class Merci extends Component {
  render () {
    const {me, t, url: {query}} = this.props
    if (query.claim) {
      return (
        <ClaimPledge t={t} me={me} id={query.claim} />
      )
    }
    if (!me) {
      if (query.email && query.phrase) {
        return (
          <P>
            <RawHtml dangerouslySetInnerHTML={{
              __html: t('merci/postpay/waiting', {
                email: query.email,
                phrase: query.phrase
              })
            }} />
            <br />
            <Poller />
            {!!query.id && (
              <Link href={{
                pathname: '/merci',
                query: {
                  claim: query.id
                }
              }}>
                <a {...linkRule}><br /><br />{t('merci/postpay/reclaim')}</a>
              </Link>
            )}
          </P>
        )
      }
      return (
        <div>
          <H1>{t('merci/signedOut/title')}</H1>
          <P>
            {t('merci/signedOut/signIn')}
          </P>
          <SignIn />
        </div>
      )
    }

    return <Belongings highlightPledgeId={query.id} />
  }
}

export default compose(
  withMe,
  withT
)(Merci)
