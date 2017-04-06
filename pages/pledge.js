import React, {Component, PropTypes} from 'react'
import withData from '../lib/withData'
import {gql, graphql} from 'react-apollo'
import Router from 'next/router'
import withMe from '../lib/withMe'
import Loader from '../components/Loader'
import SignOut from '../components/Auth/SignOut'
import {mergeField, mergeFields} from '../lib/utils/fieldState'
import {validate as isEmail} from 'email-validator'

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
    this.state = {
      values: {},
      errors: {},
      dirty: {}
    }
  }
  handleName (value, shouldValidate) {
    this.setState(mergeField({
      field: 'name',
      value,
      error: (value.trim().length <= 0 && 'Name fehlt'),
      dirty: shouldValidate
    }))
  }
  handleEmail (value, shouldValidate) {
    this.setState(mergeField({
      field: 'email',
      value,
      error: (
        (value.trim().length <= 0 && 'E-Mail fehlt') ||
        (!isEmail(value) && 'E-Mail ungültig')
      ),
      dirty: shouldValidate
    }))
  }
  checkUserFields (props) {
    if (!props.me) {
      this.handleName(this.state.values.email || '', false)
      this.handleEmail(this.state.values.name || '', false)
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

    const {query, me, loading, error, crowdfunding} = this.props

    const pkg = query.package
      ? crowdfunding.packages.find(
          pkg => pkg.name === query.package
        )
      : null
    const userPrice = !!query.userPrice

    return (
      <Loader loading={loading} error={error} render={() => (
        <div>
          <H2>Belohnungen</H2>

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

          <H2>Deine Kontaktinformationen</H2>
          <div style={{marginTop: 0, marginBottom: 40}}>
            {me ? (
              <span>
                <strong>Du bist eingeloggt als:</strong><br />
                {me.name}<br />
                {me.email}<br /><br />
                <SignOut />
              </span>
            ) : (
              <span>
                <Field label='Ihr Name'
                  name='name'
                  error={dirty.name && errors.name}
                  value={values.name}
                  onChange={(_, value, shouldValidate) => {
                    this.handleName(value, shouldValidate)
                  }} />
                <br />
                <Field label='Ihre E-Mail'
                  name='email'
                  error={dirty.email && errors.email}
                  value={values.email}
                  onChange={(_, value, shouldValidate) => {
                    this.handleEmail(value, shouldValidate)
                  }} />
                <br /><br />
              </span>
            )}
          </div>

          <Submit
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
            errors={errors} />
        </div>
      )} />
    )
  }
}

Pledge.propTypes = {
  query: PropTypes.object.isRequired
}

const PledgeWithQueries = graphql(query, {
  props: ({ data }) => {
    return {
      loading: data.loading,
      error: data.error,
      crowdfunding: data.crowdfunding
    }
  }
})(withMe(Pledge))

export default withData(({url, session}) => (
  <Frame url={url} sidebar={false}>
    <NarrowContainer>
      <H1>Mitmachen</H1>
      <PledgeWithQueries query={url.query} session={session} />
    </NarrowContainer>
  </Frame>
))
