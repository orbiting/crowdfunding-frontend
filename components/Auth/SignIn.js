import React, {Component, PropTypes} from 'react'
import {gql, graphql} from 'react-apollo'

import {
  Button,
  Field
} from '@project-r/styleguide'

import Poller from './Poller'

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
    const {polling, phrase, loading, success, error} = this.state
    if (polling) {
      return (
        <div>
          <div>Phrase: {phrase}</div>
          <Poller onSuccess={(me, ms) => {
            this.setState(() => ({
              polling: false,
              success: `Erfolgreich eingeloggt als ${me.name || me.email} (${Math.round(ms / 1000)}s)`
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
        <Field
          label='Email-Adresse'
          error={error}
          onChange={event => {
            const value = event.target.value
            this.setState(() => ({
              email: value
            }))
          }}
          value={this.state.email} />
        <Button
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
                  error: error.graphQLErrors
                    ? error.graphQLErrors.map(e => e.message).join(', ')
                    : error.toString(),
                  loading: false
                }))
              })
          }}>anmelden</Button>
        <br />
        {loading ? 'Lädt' : ''}
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

const SignInWithMutation = graphql(signInMutation, {
  props: ({mutate}) => ({
    signIn: email => mutate({variables: {email}})
  })
})(SignIn)

export default SignInWithMutation
