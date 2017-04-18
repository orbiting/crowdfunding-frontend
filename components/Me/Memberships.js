import React, {Component} from 'react'
import {timeFormat} from '../../lib/utils/formats'
import {compose} from 'redux'
import {graphql} from 'react-apollo'

import withT from '../../lib/withT'
import {myThingsQuery} from './queries'
import Loader from '../Loader'
import RawHtml from '../RawHtml'

import {
  H2, Label, A
} from '@project-r/styleguide'

const dateTimeFormat = timeFormat('%d. %B %Y %H:%M')

class Memberships extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }
  renderGive (membership) {
    const {
      t
    } = this.props

    if (!membership.voucherCode) {
      return null
    }

    const expanded = !!this.state[membership.id]

    return (
      <span>
        <A href='#' onClick={(e) => {
          e.preventDefault()
          this.setState((state) => ({
            [membership.id]: !state[membership.id]
          }))
        }}>
          {t(`memberships/give/${expanded ? 'hide' : 'show'}`)}
        </A>
        <br />
        {expanded && (
          <span style={{display: 'block', margin: '10px 0'}}>
            <RawHtml dangerouslySetInnerHTML={{
              __html: t('memberships/give/description', {
                voucherCode: membership.voucherCode
              })
            }} />
          </span>
        )}
      </span>
    )
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
            <ul>
              {memberships.map(membership => {
                const createdAt = new Date(membership.createdAt)

                return (
                  <li key={membership.id}>
                    {t(
                      `memberships/type/${membership.type.name}`,
                      {},
                      membership.type.name
                    )}<br />
                    <Label>
                      {t('memberships/label', {
                        formattedDateTime: dateTimeFormat(createdAt)
                      })}
                    </Label><br />
                    {this.renderGive(membership)}
                  </li>
                )
              })}
            </ul>
          </div>
        )
      }} />
    )
  }
}

export default compose(
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
            data.me.memberships
          ) || []
        )
      }
    }
  }),
  withT
)(Memberships)
