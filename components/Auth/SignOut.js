import React, {Component, PropTypes} from 'react'
import {gql, graphql} from 'react-apollo'

import {
  Button
} from '@project-r/styleguide'

class SignOut extends Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: false
    }
  }
  render () {
    const {loading, error} = this.state

    return (
      <div>
        <Button
          disabled={loading}
          onClick={() => {
            if (loading) {
              return
            }
            this.setState(() => ({
              loading: true
            }))
            this.props.signOut()
              .then(({data}) => {
                console.log('signOut data', data)
                if (data) {
                  this.setState(() => ({
                    loading: false
                  }))
                } else {
                  this.setState(() => ({
                    error: 'Unbekannter Fehler',
                    loading: false
                  }))
                }
              })
              .catch(error => {
                this.setState(() => ({
                  error,
                  loading: false
                }))
              })
          }}>abmelden</Button>
        <br />
        {loading ? 'Lädt' : ''}
        {!!error && error}
      </div>
    )
  }
}

SignOut.propTypes = {
  signOut: PropTypes.func.isRequired
}

const signOutMutation = gql`
mutation signOut {
  signOut
}
`

const SignOutWithMutation = graphql(signOutMutation, {
  props: ({mutate}) => ({
    signOut: () => mutate()
  })
})(SignOut)

export default SignOutWithMutation
