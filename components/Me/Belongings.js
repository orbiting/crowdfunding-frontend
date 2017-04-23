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
import Testimonial from '../Testimonial/Me'
import {GiveMemberships, ClaimedMemberships} from './Memberships'
import {myThingsQuery} from './queries'
import RawHtml from '../RawHtml'

import {
  PUBLIC_BASE_URL
} from '../../constants'

import {
  Interaction,
  Button, Lead,
  Label, A, H1,
  colors
} from '@project-r/styleguide'

const {H2, H3, P} = Interaction

const dateTimeFormat = timeFormat('%d. %B %Y %H:%M')

const styles = {
  pledge: css({
    padding: 10,
    marginLeft: -10,
    marginRight: -10
  }),
  pledgeHighlighted: css({
    backgroundColor: colors.primaryBg
  })
}

const Belongings = ({loading, error, pledges, hasMemberships, me, t, signOut, highlightPledgeId}) => (
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
          <RawHtml type={Lead} style='serif' dangerouslySetInnerHTML={{
            __html: t('merci/lead')
          }} />
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
        <div style={{marginBottom: 80}} />
        <ClaimedMemberships />
        {(hasPledges || hasMemberships) && (
          <div style={{marginTop: 80}}>
            <Testimonial />
          </div>
        )}
        <H2 style={{marginTop: 80}}>{t.pluralize('merci/pledges/title', {
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
                <H3 style={{marginBottom: 0}}>
                  {t(`package/${pledge.package.name}/title`)}
                </H3>
                <Label>
                  {t('merci/pledge/label', {
                    formattedDateTime: dateTimeFormat(createdAt)
                  })}
                </Label>
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
                <GiveMemberships
                  memberships={pledge.memberships}
                  isGivePackage={pledge.package.name === 'ABO_GIVE'} />
              </div>
            )
          })}
        <div />
        {(hasPledges || hasMemberships) && !!me.name && (
          <div style={{marginTop: 80}}>
            <UpdateMe />
          </div>
        )}
        <br /><br />
        <A href='#' onClick={(e) => {
          e.preventDefault()
          signOut()
        }}>{t('merci/signOut')}</A>
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
        ),
        hasMemberships: (
          (
            !data.loading &&
            !data.error &&
            data.me &&
            data.me.memberships &&
            !!data.me.memberships.length
          )
        )
      }
    }
  }),
  withSignOut,
  withMe,
  withT
)(Belongings)
