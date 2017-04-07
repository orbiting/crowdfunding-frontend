import React, {Component, PropTypes} from 'react'
import withData from '../lib/withData'
import {gql, graphql} from 'react-apollo'
import Router from 'next/router'
import withT from '../lib/withT'
import withMe from '../lib/withMe'
import Loader from '../components/Loader'
import SignOut from '../components/Auth/SignOut'
import {mergeField, mergeFields} from '../lib/utils/fieldState'
import {validate as isEmail} from 'email-validator'
import {compose} from 'redux'

import {
  H1, H2, Field,
  NarrowContainer
} from '@project-r/styleguide'

import Frame from '../components/Frame'
import Accordion from '../components/Pledge/Accordion'
import Submit from '../components/Pledge/Submit'
import CustomizePackage from '../components/Pledge/CustomizePackage'

const query = gql`
{
  crowdfunding(name: "REPUBLIK") {
    id
    name
    packages {
      id
      name
      options {
        id
        price
        userPrice
        minAmount
        maxAmount
        defaultAmount
        reward {
          ... on MembershipType {
            id
            name
          }
          ... on Goodie {
            id
            name
          }
        }
      }
    }
  }
}
`

class Pledge extends Component {
  constructor (props) {
    super(props)

    const values = {}

    const {pledge} = props
    if (pledge) {
      values.email = pledge.user.email
      values.name = pledge.user.name
      values.reason = pledge.reason
      pledge.options.forEach(option => {
        values[option.templateId] = option.amount
      })
    }

    this.state = {
      values,
      errors: {},
      dirty: {}
    }
  }
  handleName (value, shouldValidate, t) {
    this.setState(mergeField({
      field: 'name',
      value,
      error: (value.trim().length <= 0 && t('pledge/contact/name/error/empty')),
      dirty: shouldValidate
    }))
  }
  handleEmail (value, shouldValidate, t) {
    this.setState(mergeField({
      field: 'email',
      value,
      error: (
        (value.trim().length <= 0 && t('pledge/contact/email/error/empty')) ||
        (!isEmail(value) && t('pledge/contact/email/error/invalid'))
      ),
      dirty: shouldValidate
    }))
  }
  checkUserFields (props) {
    if (!props.me) {
      this.handleName(this.state.values.email || '', false, props.t)
      this.handleEmail(this.state.values.name || '', false, props.t)
    } else {
      this.setState((state) => ({
        errors: {
          ...state.errors,
          email: undefined,
          name: undefined
        }
      }))
    }
  }
  componentWillReceiveProps (nextProps) {
    if (nextProps.me !== this.props.me) {
      this.checkUserFields(nextProps)
    }
  }
  componentDidMount () {
    this.checkUserFields(this.props)
  }
  render () {
    const {
      values,
      errors,
      dirty
    } = this.state

    const {
      query, me, loading,
      error, crowdfunding, t
    } = this.props

    const pkg = query.package
      ? crowdfunding.packages.find(
          pkg => pkg.name === query.package
        )
      : null
    const userPrice = !!query.userPrice

    return (
      <Loader loading={loading} error={error} render={() => (
        <div>
          <H1>{t('pledge/title')}</H1>
          <H2>{t('pledge/rewards/title')}</H2>

          <div style={{marginBottom: 40}}>
            {query.package ? (
              <CustomizePackage
                values={values}
                errors={errors}
                dirty={dirty}
                userPrice={userPrice}
                pkg={pkg}
                onChange={(fields) => {
                  this.setState(mergeFields(fields))
                }} />
            ) : (
              <Accordion extended onSelect={params => {
                const url = {
                  pathname: '/pledge',
                  query: params
                }
                Router.replace(url, url, {shallow: true})
                  .then(() => {
                    window.scrollTo(0, 0)
                    if (this.amountRef && this.amountRef.input) {
                      this.amountRef.input.focus()
                    }
                  })
              }} />
            )}
          </div>

          <H2>{t('pledge/contact/title')}</H2>
          <div style={{marginTop: 0, marginBottom: 40}}>
            {me ? (
              <span>
                <strong>{t('pledge/contact/signedin-as')}</strong><br />
                {me.name}<br />
                {me.email}<br /><br />
                <SignOut />
              </span>
            ) : (
              <span>
                <Field label={t('pledge/contact/name/label')}
                  name='name'
                  error={dirty.name && errors.name}
                  value={values.name}
                  onChange={(_, value, shouldValidate) => {
                    this.handleName(value, shouldValidate, t)
                  }} />
                <br />
                <Field label={t('pledge/contact/email/label')}
                  name='email'
                  error={dirty.email && errors.email}
                  value={values.email}
                  onChange={(_, value, shouldValidate) => {
                    this.handleEmail(value, shouldValidate, t)
                  }} />
                <br /><br />
              </span>
            )}
          </div>

          <Submit
            query={query}
            me={me}
            total={values.price}
            user={{
              name: values.name,
              email: values.email
            }}
            options={pkg ? pkg.options.map(option => ({
              amount: values[option.id] || option.minAmount,
              price: option.price,
              templateId: option.id
            })) : []}
            reason={userPrice ? values.reason : undefined}
            errors={errors}
            onError={() => {
              this.setState((state) => {
                const dirty = {
                  ...state.dirty
                }
                Object.keys(state.errors).forEach(field => {
                  if (state.errors[field]) {
                    dirty[field] = true
                  }
                })
                return {
                  dirty
                }
              })
            }} />
        </div>
      )} />
    )
  }
}

Pledge.propTypes = {
  query: PropTypes.object.isRequired
}

const PledgeWithQueries = compose(
  graphql(query, {
    props: ({ data }) => {
      return {
        loading: data.loading,
        error: data.error,
        crowdfunding: data.crowdfunding
      }
    }
  }),
  withT,
  withMe
)(Pledge)

const pledgeQuery = gql`
query($pledgeId: ID!) {
  pledge(id: $pledgeId) {
    id
    package {
      name
    }
    options {
      templateId
      amount
    }
    total
    reason
    user {
      name
      email
    }
  }
}
`

const PledgeById = graphql(pledgeQuery, {
  props: ({ data }) => {
    return {
      loading: data.loading,
      error: data.error,
      pledge: data.pledge
    }
  }
})(({loading, error, pledge, query}) => (
  <Loader loading={loading} error={error} render={() => (
    <PledgeWithQueries query={{
      ...query,
      package: pledge.package.name
    }} pledge={pledge} />
  )} />
))

class PledgePage extends Component {
  render () {
    const {url} = this.props

    let pledgeId
    if (url.query.orderID) {
      pledgeId = url.query.orderID.split('_')[0]
    }

    return (
      <Frame url={url} sidebar={false}>
        <NarrowContainer>
          {pledgeId ? (
            <PledgeById pledgeId={pledgeId} query={url.query} />
          ) : (
            <PledgeWithQueries query={url.query} />
          )}
        </NarrowContainer>
      </Frame>
    )
  }
}

export default withData(PledgePage)
