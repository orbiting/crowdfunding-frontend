import React from 'react'
import {compose} from 'redux'
import {graphql} from 'react-apollo'
import Router from 'next/router'
import {css, merge} from 'glamor'

import withT from '../../lib/withT'
import withMe from '../../lib/withMe'
import {intersperse} from '../../lib/utils/helpers'
import {timeFormat, chfFormat} from '../../lib/utils/formats'

import {withSignOut} from '../Auth/SignOut'

import Loader from '../Loader'
import Share from '../Share'
import UpdateMe from './Update'
import Memberships from './Memberships'
import {myThingsQuery} from './queries'

import {
  PUBLIC_BASE_URL
} from '../../constants'

import {
  H1, P, Button, Lead,
  H2, Label, A,
  colors
} from '@project-r/styleguide'

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

const Belongings = ({loading, error, pledges, me, t, signOut, highlightPledgeId}) => (
  <Loader loading={loading} error={error} render={() => {
    const displayablePledges = pledges
      .filter(pledge => pledge.status !== 'DRAFT')
      .filter(pledge => pledge.options)
      .reverse()
    const hasPledges = displayablePledges.length > 0

    return (
      <div>
        <H1>{hasPledges ? t('merci/title', {
          name: me.name
        }) : t('merci/empty/title', {
          nameOrEmail: me.name || me.email
        })}</H1>
        {hasPledges && (<div>
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
        </div>)}
        <Memberships />
        <H2>{t.pluralize('merci/pledges/title', {
          count: displayablePledges.length
        })}</H2>
        {!hasPledges && (
          <div>
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
        )}
        {displayablePledges
          .map(pledge => {
            const options = pledge.options.filter(option => (
              option.amount && option.minAmount !== option.maxAmount
            ))
            const createdAt = new Date(pledge.createdAt)

            return (
              <div key={pledge.id} {...merge(
                styles.pledge,
                highlightPledgeId === pledge.id && styles.pledgeHighlighted
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
          signOut()
        }}>{t('merci/signOut')}</A>
        <br /><br /><br /><br /><br /><br />
        {!!me.name && <UpdateMe />}
      </div>
    )
  }} />
)

export default compose(
  graphql(myThingsQuery, {
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
)(Belongings)
