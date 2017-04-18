import React, {Component} from 'react'
import {compose} from 'redux'
import {gql, graphql} from 'react-apollo'
import Router from 'next/router'
import Link from 'next/link'
import {css, merge} from 'glamor'
import {format} from 'url'

import withT from '../../lib/withT'
import withMe from '../../lib/withMe'
import {intersperse} from '../../lib/utils/helpers'
import {timeFormat, chfFormat} from '../../lib/utils/formats'

import {withSignOut} from '../Auth/SignOut'
import Poller from '../Auth/Poller'
import SignIn from '../Auth/SignIn'

import Loader from '../Loader'
import Share from '../Share'
import UpdateMe from '../Me/Update'
import ClaimPledge from './Claim'

import {
  PUBLIC_BASE_URL
} from '../../constants'

import {
  H1, P, Button, Lead,
  H2, Label, A, linkRule,
  colors
} from '@project-r/styleguide'

export const gotoMerci = (query) => {
  // workaround for apollo cache issues
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

const dateTimeFormat = timeFormat('%d. %B %Y %H:%M')

const styles = {
  pledge: css({
    padding: 10,
    marginLeft: -10,
    marginRight: -10
  }),
  pledgeHighlighted: css({
    backgroundColor: colors.primaryBg
  }),
  total: css({
    color: colors.primary,
    lineHeight: '28px',
    fontSize: 22
  })
}

export const pledgesQuery = gql`
query myPledges {
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
            {t('merci/postpay/waiting', {
              email: query.email,
              phrase: query.phrase
            })}<br />
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

    const {loading, error, pledges} = this.props
    return (
      <Loader loading={loading} error={error} render={() => {
        if (!pledges.length) {
          return (
            <div>
              <H1>{t('merci/empty/title', {
                nameOrEmail: me.name || me.email
              })}</H1>
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
            {[].concat(pledges)
              .reverse()
              .filter(pledge => pledge.status !== 'DRAFT')
              .filter(pledge => pledge.options)
              .map(pledge => {
                const options = pledge.options.filter(option => (
                  option.amount && option.minAmount !== option.maxAmount
                ))
                const createdAt = new Date(pledge.createdAt)
                return (
                  <div key={pledge.id} {...merge(
                    styles.pledge,
                    query.id === pledge.id && styles.pledgeHighlighted
                  )}>
                    <H2 style={{marginBottom: 0}}>{t(`package/${pledge.package.name}/title`)}</H2>
                    <Label>{t('merci/pledge/label', {
                      formattedDateTime: dateTimeFormat(createdAt)
                    })}</Label>
                    {!!options.length && (
                      <ul style={{marginBottom: 0}}>
                        {options.map((option, i) => (
                          <li key={i}>
                            {option.amount}
                            {' '}
                            {t.pluralize(`option/${option.reward.name}/label`, {
                              count: option.amount
                            }, option.reward.name)}
                          </li>
                        ))}
                      </ul>
                    )}
                    <br />
                    <span {...styles.total}>{chfFormat(pledge.total / 100)}</span>
                    <br />
                    <ul>
                      {
                        pledge.payments.map((payment, i) => (
                          <li key={i}>
                            {intersperse(
                              t.first([
                                `merci/payment/status/${payment.method}/${payment.status}`,
                                `merci/payment/status/generic/${payment.status}`
                              ], {
                                formattedTotal: chfFormat(payment.total / 100),
                                hrid: payment.hrid,
                                method: t(`merci/payment/method/${payment.method}`)
                              }).split('\n'),
                              (item, i) => <br key={i} />
                            )}
                            {payment.method === 'PAYMENTSLIP' && payment.status === 'WAITING' && (
                              <span>
                                <br /><br />
                                {t(`merci/payment/PAYMENTSLIP/paperInvoice/${+(payment.paperInvoice)}`)}
                              </span>
                            )}
                          </li>
                        ))
                      }
                    </ul>
                  </div>
                )
              })}
            <br />
            <A href='#' onClick={(e) => {
              e.preventDefault()
              this.props.signOut()
            }}>{t('merci/signOut')}</A>
            <br /><br /><br /><br /><br /><br />
            <UpdateMe />
          </div>
        )
      }} />
    )
  }
}

export default compose(
  graphql(pledgesQuery, {
    props: ({data}) => {
      return {
        loading: data.loading,
        error: data.error,
        pledges: (
          (
            !data.loading &&
            !data.error &&
            data.me &&
            data.me.pledges
          ) || []
        )
      }
    }
  }),
  withSignOut,
  withMe,
  withT
)(Merci)
