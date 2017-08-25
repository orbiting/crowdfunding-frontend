import React, {Component} from 'react'
import {compose} from 'redux'
import Link from 'next/link'
import {format} from 'url'

import withT from '../../lib/withT'
import withMe from '../../lib/withMe'

import Poller from '../Auth/Poller'
import SignIn, {withSignIn} from '../Auth/SignIn'
import {InlineSpinner} from '../Spinner'
import ErrorMessage from '../ErrorMessage'

import Belongings from '../Me/Belongings'
import RawHtml from '../RawHtml'

import ClaimPledge from './Claim'

import {EMAIL_CONTACT} from '../../constants'

import {
  linkRule,
  Interaction,
  Button
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
  constructor (props) {
    super(props)
    const {url: {query}} = this.props
    this.state = {
      polling: !!(query.email && query.phrase),
      email: query.email,
      phrase: query.phrase,
      signInError: query.signInError
    }
  }
  render () {
    const {me, t, url: {query}} = this.props
    const {
      polling, phrase, email,
      signInError, signInLoading
    } = this.state
    if (query.claim) {
      return (
        <ClaimPledge t={t} me={me} id={query.claim} />
      )
    }
    if (polling) {
      return (
        <P>
          <RawHtml dangerouslySetInnerHTML={{
            __html: t('merci/postpay/waiting', {
              email,
              phrase
            })
          }} />
          <br />
          <Poller onSuccess={() => {
            this.setState({
              polling: false
            })
          }} />
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
    if (signInError && email && query.id) {
      return (
        <div>
          <H1>{t('merci/postpay/signInError/title')}</H1>
          <RawHtml type={P} dangerouslySetInnerHTML={{
            __html: t('merci/postpay/signInError/text', {
              email: query.email,
              mailto: `mailto:${EMAIL_CONTACT}?subject=${
                encodeURIComponent(
                  t('merci/postpay/signInError/email/subject')
                )}&body=${
                encodeURIComponent(
                  t(
                    'merci/postpay/signInError/email/body',
                    {
                      pledgeId: query.id,
                      email: email,
                      error: signInError
                    }
                  )
                )}`
            })
          }} />
          {!!signInError && <ErrorMessage error={signInError} />}
          <div style={{margin: '20px 0'}}>
            {signInLoading ? <InlineSpinner /> : <Button
              block
              disabled={signInLoading}
              onClick={() => {
                if (signInLoading) {
                  return
                }
                this.setState(() => ({
                  signInLoading: true
                }))
                this.props.signIn(email)
                  .then(({data}) => {
                    this.setState(() => ({
                      polling: true,
                      signInLoading: false,
                      phrase: data.signIn.phrase
                    }))
                  })
                  .catch(error => {
                    this.setState(() => ({
                      signInError: error,
                      signInLoading: false
                    }))
                  })
              }}>{t('merci/postpay/signInError/retry')}</Button>}
          </div>
          <Link href={{
            pathname: '/merci',
            query: {
              claim: query.id
            }
          }}>
            <a {...linkRule}><br /><br />{t('merci/postpay/reclaim')}</a>
          </Link>
        </div>
      )
    }
    if (!me) {
      return (
        <div>
          <H1>{t('merci/signedOut/title')}</H1>
          <P>
            {t('merci/signedOut/signIn')}
          </P>
          <SignIn email={email} />
        </div>
      )
    }

    return <Belongings highlightPledgeId={query.id} />
  }
}

export default compose(
  withMe,
  withT,
  withSignIn
)(Merci)
