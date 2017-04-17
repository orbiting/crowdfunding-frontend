import React, {Component, PropTypes} from 'react'
import {gql, graphql} from 'react-apollo'
import {css} from 'glamor'
import {compose} from 'redux'
import withT from '../../lib/withT'
import {errorToString} from '../../lib/utils/errors'

import {
  Button,
  Field
} from '@project-r/styleguide'

import Poller from './Poller'

const styles = {
  form: css({
    display: 'flex',
    justifyContent: 'space-between',
    flexFlow: 'row wrap'
  }),
  input: css({
    marginRight: 10,
    marginBottom: 0,
    width: '58%',
    flexGrow: 1
  }),
  button: css({
    width: '38%',
    minWidth: 140,
    maxWidth: 160
  })
}

class SignIn extends Component {
  constructor (props) {
    super(props)
    this.state = {
      email: props.email || '',
      polling: false,
      loading: false,
      success: undefined
    }
  }
  render () {
    const {t} = this.props
    const {polling, phrase, loading, success, error} = this.state
    if (polling) {
      return (
        <div>
          <div>Phrase: {phrase}</div>
          <Poller onSuccess={(me, ms) => {
            this.setState(() => ({
              polling: false,
              success: t('signIn/success', {
                nameOrEmail: me.name || me.email,
                seconds: Math.round(ms / 1000)
              })
            }))
          }} />
        </div>
      )
    }
    if (success) {
      return <span>{success}</span>
    }
    return (
      <div>
        <div {...styles.form}>
          <div {...styles.input}>
            <Field
              name='email'
              label={t('signIn/email/label')}
              error={error}
              onChange={event => {
                const value = event.target.value
                this.setState(() => ({
                  email: value
                }))
              }}
              value={this.state.email} />
          </div>
          <div {...styles.button}>
            <Button
              block
              disabled={loading}
              onClick={() => {
                if (loading) {
                  return
                }
                this.setState(() => ({
                  loading: true
                }))
                this.props.signIn(this.state.email)
                  .then(({data}) => {
                    this.setState(() => ({
                      polling: true,
                      loading: false,
                      phrase: data.signIn.phrase
                    }))
                  })
                  .catch(error => {
                    this.setState(() => ({
                      error: errorToString(error),
                      loading: false
                    }))
                  })
              }}>{t('signIn/button')}</Button>
          </div>
        </div>
        {loading ? <div>{t('signIn/loading')}</div> : ''}
      </div>
    )
  }
}

SignIn.propTypes = {
  signIn: PropTypes.func.isRequired
}

const signInMutation = gql`
mutation signIn($email: String!) {
  signIn(email: $email) {
    phrase
  }
}
`

export const withSignIn = graphql(signInMutation, {
  props: ({mutate}) => ({
    signIn: email => mutate({variables: {email}})
  })
})

export default compose(
  withSignIn,
  withT
)(SignIn)
