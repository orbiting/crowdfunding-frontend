import React, {Component, PropTypes} from 'react'
import {gql, graphql} from 'react-apollo'
import Loader from '../Loader'
import ErrorMessage from '../ErrorMessage'
import {gotoMerci} from '../Pledge/Merci'
import {compose} from 'redux'
import withT from '../../lib/withT'
import withMe, {meQuery} from '../../lib/withMe'
import {validate as isEmail} from 'email-validator'
import {mergeField} from '../../lib/utils/fieldState'
import Poller from '../Auth/Poller'
import {withSignOut} from '../Auth/SignOut'
import {withSignIn} from '../Auth/SignIn'

import {
  Field, Button, P
} from '@project-r/styleguide'

class ClaimMembership extends Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: false,
      serverError: undefined,
      values: {},
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
  handleVoucherCode (value, shouldValidate, t) {
    this.setState(mergeField({
      field: 'voucherCode',
      value,
      error: (
        value.trim().length <= 0 && t('memberships/claim/voucherCode/label/error/empty')
      ),
      dirty: shouldValidate
    }))
  }
  checkUserFields (props) {
    const values = props.me ? props.me : this.state.values
    this.handleName(values.name || '', false, props.t)
    this.handleEmail(values.email || '', false, props.t)
  }
  componentWillReceiveProps (nextProps) {
    if (nextProps.me !== this.props.me) {
      this.checkUserFields(nextProps)
    }
  }
  componentDidMount () {
    this.checkUserFields(this.props)
    this.handleVoucherCode(
      this.state.values.voucherCode || '',
      false,
      this.props.t
    )
  }
  claim () {
    const {me} = this.props
    const {values} = this.state

    this.setState(() => ({
      loading: true
    }))

    const catchError = (name) => (error) => {
      console.error(name, error)
      this.setState(() => ({
        loading: false,
        serverError: error
      }))
    }

    if (me && me.email !== values.email) {
      this.props.signOut().then(() => {
        this.claim()
      }).catch(catchError('signOut'))
      return
    }

    if (!me) {
      this.props.signIn(values.email)
        .then(({data}) => {
          this.setState(() => ({
            polling: true,
            phrase: data.signIn.phrase
          }))
        })
        .catch(catchError('signIn'))
      return
    }

    const claim = () => {
      this.props.claim(values.voucherCode)
        .then(() => {
          gotoMerci({})
        })
        .catch(catchError('claim'))
    }
    if (me.name !== values.name) {
      this.props.updateName(values.name)
        .then(() => {
          claim()
        })
        .catch(catchError('updateName'))
      return
    }
    claim()
  }
  render () {
    const {t} = this.props

    const {
      serverError,
      values, dirty, errors,
      loading,
      polling, phrase
    } = this.state

    if (polling) {
      return (
        <div>
          <P>{t('signIn/polling', {
            phrase,
            email: values.email
          })}</P>
          <Poller onSuccess={() => {
            this.setState(() => ({
              polling: false
            }))
            this.claim()
          }} />
        </div>
      )
    }
    if (loading) {
      return <Loader loading message={t('memberships/claim/loading')} />
    }

    const errorMessages = Object.keys(errors)
      .map(key => errors[key])
      .filter(Boolean)

    return (
      <div>
        <P>
          {t('memberships/claim/lead')}
        </P>
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
        <br />
        <Field label={t('memberships/claim/voucherCode/label')}
          name='voucherCode'
          error={dirty.voucherCode && errors.voucherCode}
          value={values.voucherCode}
          onChange={(_, value, shouldValidate) => {
            this.handleVoucherCode(value, shouldValidate, t)
          }} />
        <br />
        <br />
        <div style={{opacity: errorMessages.length ? 0.5 : 1}}>
          <Button
            onClick={() => {
              if (errorMessages.length) {
                this.setState((state) => ({
                  dirty: {
                    ...state.dirty,
                    name: true,
                    email: true,
                    voucherCode: true
                  }
                }))
                return
              }
              this.claim()
            }}>
            {t('memberships/claim/button')}
          </Button>
        </div>
        <br />
        {!!serverError && <ErrorMessage error={serverError} />}
      </div>
    )
  }
}

ClaimMembership.propTypes = {
  me: PropTypes.object,
  t: PropTypes.func.isRequired
}

const claimMembership = gql`
mutation claimMembership($voucherCode: String!) {
  claimMembership(voucherCode: $voucherCode)
}`

const updateName = gql`mutation updateName($name: String!) {
  updateMe(name: $name) {
    id
  }
}`

export default compose(
  graphql(claimMembership, {
    props: ({mutate}) => ({
      claim: voucherCode => mutate({
        variables: {
          voucherCode
        }
      })
    })
  }),
  graphql(updateName, {
    props: ({mutate}) => ({
      updateName: name => mutate({
        variables: {
          name
        },
        refetchQueries: [{
          query: meQuery
        }]
      })
    })
  }),
  withSignOut,
  withSignIn,
  withMe,
  withT
)(ClaimMembership)
