import React from 'react'
import {compose} from 'redux'
import {gql, graphql} from 'react-apollo'
import Router from 'next/router'

import withData from '../lib/withData'
import Frame from '../components/Frame'
import withMe from '../lib/withMe'
import withT from '../lib/withT'
import Poller from '../components/Auth/Poller'
import SignIn from '../components/Auth/SignIn'
import {withSignOut} from '../components/Auth/SignOut'
import Loader from '../components/Loader'
import Share from '../components/Share'
import {timeFormat} from '../lib/utils/formats'

import {
  PUBLIC_BASE_URL
} from '../constants'

import {
  H1, P, Button, Lead,
  H2, Label, A,
  NarrowContainer
} from '@project-r/styleguide'

const dateTimeFormat = timeFormat('%d. %B %Y %H:%M')

const pledgesQuery = gql`
query pledges {
  me {
    id
    pledges {
      id
      package {
        name
      }
      options {
        reward {
          ... on MembershipType {
            name
          }
          ... on Goodie {
            name
          }
        }
        minAmount
        maxAmount
        amount
      }
      status
      total
      payments {
        method
        paperInvoice
        total
        status
        hrid
        createdAt
        updatedAt
      }
      memberships {
        voucherCode
      }
      createdAt
    }
  }
}
`

const Merci = compose(
  graphql(pledgesQuery, {
    props: ({data}) => {
      return {
        loading: data.loading,
        error: data.error,
        pledges: data.me ? data.me.pledges : []
      }
    }
  }),
  withSignOut,
  withMe,
  withT
)((props) => {
  const {me, t, url: {query}} = props
  if (!me) {
    if (query.email && query.phrase) {
      return (
        <P>
          {t('merci/postpay/waiting', {
            email: query.email,
            phrase: query.phrase
          })}<br />
          <Poller onSuccess={() => {}} />
        </P>
      )
    }
    return (
      <div>
        <h1>{t('merci/signedOut/title')}</h1>
        <P>
          {t('merci/signedOut/signIn')}
        </P>
        <SignIn />
      </div>
    )
  }

  const {loading, error, pledges} = props
  return (
    <Loader loading={loading} error={error} render={() => {
      if (!pledges.length) {
        return (
          <div>
            <h1>{t('merci/empty/title', {
              nameOrEmail: me.name || me.email
            })}</h1>
            <P>
              {t('merci/empty/text')}
            </P>
            <Button primary onClick={() => {
              Router.push('/pledge')
                .then(() => window.scrollTo(0, 0))
            }}>
              {t('merci/empty/button')}
            </Button>
          </div>
        )
      }

      return (
        <div>
          <H1>{t('merci/title', {
            name: me.name
          })}</H1>
          <Lead>
            {t('merci/lead')}
          </Lead>
          <P>
            <Share
              url={`${PUBLIC_BASE_URL}/`}
              tweet={t('merci/share/tweetTemplate')}
              emailSubject={t('merci/share/emailSubject')}
              emailBody={t('merci/share/emailBody', {
                url: `${PUBLIC_BASE_URL}/`,
                backerName: me.name
              })}
              emailAttachUrl={false} />
          </P>
          {pledges.map(pledge => {
            const configurableOptions = pledge.options.filter(option => (
              option.minAmount !== option.maxAmount
            ))
            const createdAt = new Date(pledge.createdAt)
            return (
              <div key={pledge.id} style={{marginBottom: 30}}>
                <H2 style={{marginBottom: 0}}>{t(`package/${pledge.package.name}/title`)}</H2>
                <Label>{dateTimeFormat(createdAt)}</Label>
                {!!configurableOptions.length && (
                  <ul>
                    {configurableOptions.map((option, i) => (
                      <li key={i}>{option.amount} x {option.name}</li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
          <A href='#' onClick={(e) => {
            e.preventDefault()
            this.props.signOut().then(() => {
              this.handleName('', false, t)
              this.handleEmail('', false, t)
            })
          }}>{t('merci/signOut')}</A>
        </div>
      )
    }} />
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
