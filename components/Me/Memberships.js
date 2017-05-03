import React, {Component} from 'react'
import {timeFormat} from '../../lib/utils/formats'
import {compose} from 'redux'
import {graphql} from 'react-apollo'
import {css, merge} from 'glamor'

import withT from '../../lib/withT'
import {myThingsQuery} from './queries'
import Loader from '../Loader'
import RawHtml from '../RawHtml'
import List, {Item} from '../List'

import {
  Interaction, Label, linkRule, fontFamilies
} from '@project-r/styleguide'

const {H2} = Interaction

const styles = {
  a: merge(linkRule, {
    fontSize: 17,
    lineHeight: '25px',
    fontFamily: fontFamilies.sansSerifMedium
  }),
  p: css({
    margin: 0,
    fontSize: 17,
    lineHeight: '25px',
    fontFamily: fontFamilies.sansSerifRegular
  })
}

const A = ({children, ...props}) => <a {...props} {...styles.a}>{children}</a>
const P = ({children, ...props}) => <p {...props} {...styles.p}>{children}</p>

const dateTimeFormat = timeFormat('%d. %B %Y %H:%M')

class MembershipGiver extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }
  render () {
    const {memberships, t, isGivePackage} = this.props
    const {showGiveable, showGiven} = this.state

    const giveable = memberships.filter(m => m.voucherCode)
    const given = memberships.filter(m => m.claimerName)

    const hasGiveable = !!giveable.length
    const hasGiven = !!given.length

    if (!hasGiven && !hasGiveable) {
      return null
    }

    return (
      <div>
        {!isGivePackage && hasGiveable && (
          <A href='#' onClick={(e) => {
            e.preventDefault()
            this.setState(() => ({showGiveable: !showGiveable}))
          }}>
            {t('memberships/giver/giveable/show')}<br />
          </A>
        )}
        {hasGiveable && (isGivePackage || showGiveable) && (
          <div style={{margin: '10px 0'}}>
            <RawHtml type={P} dangerouslySetInnerHTML={{
              __html: !isGivePackage
                ? t('memberships/give/description/before/notGive')
                : t.pluralize('memberships/give/description/before', {
                  count: giveable.length
                })
            }} />
            <List>
              {giveable.map((membership, i) => (
                <Item key={i}>
                  <code>{membership.voucherCode}</code>
                  {' '}({t('memberships/sequenceNumber/label', membership)})
                </Item>
              ))}
            </List>
            <RawHtml type={P} dangerouslySetInnerHTML={{
              __html: t('memberships/give/description/after')
            }} />
          </div>
        )}
        {hasGiven && (
          <A href='#' onClick={(e) => {
            e.preventDefault()
            this.setState(() => ({showGiven: !showGiven}))
          }}>
            {isGivePackage
              ? t.pluralize('memberships/giver/given', {
                count: given.length
              })
              : t('memberships/giver/given/notGive')
            }
          </A>
        )}
        {hasGiven && showGiven && (
          <div style={{margin: '10px 0'}}>
            <RawHtml type={P} dangerouslySetInnerHTML={{
              __html: t('memberships/giver/description')
            }} />
            <List>
              {given.map((membership, i) => (
                <Item key={i}>
                  {membership.claimerName}
                  {' '}({t('memberships/sequenceNumber/label', membership)})
                </Item>
              ))}
            </List>
          </div>
        )}
      </div>
    )
  }
}

export const GiveMemberships = compose(
  withT
)(MembershipGiver)

class MembershipsList extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }
  render () {
    const {
      memberships, t,
      loading, error
    } = this.props
    return (
      <Loader loading={loading} error={error} render={() => {
        if (!memberships.length) {
          return null
        }

        return (
          <div>
            <H2>{t.pluralize('memberships/title', {
              count: memberships.length
            })}</H2>
            <List>
              {memberships.map(membership => {
                const createdAt = new Date(membership.createdAt)

                return (
                  <Item key={membership.id}>
                    {t(
                      `memberships/type/${membership.type.name}`,
                      {},
                      membership.type.name
                    )}
                    {' '}({t('memberships/sequenceNumber/suffix', membership)})<br />
                    <Label>
                      {t('memberships/label', {
                        formattedDateTime: dateTimeFormat(createdAt)
                      })}
                    </Label>
                  </Item>
                )
              })}
            </List>
          </div>
        )
      }} />
    )
  }
}

export const ClaimedMemberships = compose(
  graphql(myThingsQuery, {
    props: ({data}) => {
      return {
        loading: data.loading,
        error: data.error,
        memberships: (
          (
            !data.loading &&
            !data.error &&
            data.me &&
            data.me.memberships &&
            data.me.memberships.filter(m => !m.voucherCode)
          ) || []
        )
      }
    }
  }),
  withT
)(MembershipsList)
