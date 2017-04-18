import React, {Component, PropTypes} from 'react'
import {gql, graphql} from 'react-apollo'
import {compose} from 'redux'
import withT from '../../lib/withT'
import {errorToString} from '../../lib/utils/errors'
import {meQuery} from '../../lib/withMe'

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
    const {t} = this.props
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
                if (data) {
                  this.setState(() => ({
                    loading: false
                  }))
                } else {
                  this.setState(() => ({
                    error: t('signOut/error'),
                    loading: false
                  }))
                }
              })
              .catch(error => {
                this.setState(() => ({
                  error: errorToString(error),
                  loading: false
                }))
              })
          }}>abmelden</Button>
        <br />
        {loading ? t('signOut/loading') : ''}
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

export const withSignOut = compose(
  graphql(signOutMutation, {
    props: ({mutate, ownProps}) => ({
      signOut: () => mutate({
        refetchQueries: [{
          query: meQuery
        }]
      })
    })
  })
)

export default compose(
  withSignOut,
  withT
)(SignOut)
