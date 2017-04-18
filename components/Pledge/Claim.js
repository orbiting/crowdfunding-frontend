import React, {Component, PropTypes} from 'react'
import {gql, graphql} from 'react-apollo'
import SignIn from '../Auth/SignIn'
import Loader from '../Loader'
import ErrorMessage from '../ErrorMessage'
import {gotoMerci} from './Merci'

import {
  P
} from '@project-r/styleguide'

class ClaimPledge extends Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: false,
      error: undefined
    }
  }
  claim () {
    const {me, id} = this.props
    const {loading, error} = this.state

    if (loading || error || !me) {
      return
    }
    this.setState(() => ({
      loading: true
    }))
    this.props.claim(id)
      .then(() => {
        gotoMerci({
          id
        })
      })
      .catch(error => {
        if (error.toString() === 'TypeError: Cannot read property \'variables\' of undefined') {
          gotoMerci({
            id
          })
          return
        }
        this.setState(() => ({
          loading: false,
          error
        }))
      })
  }
  componentDidMount () {
    this.claim()
  }
  componentDidUpdate () {
    this.claim()
  }
  render () {
    const {t, me} = this.props

    if (me) {
      const {error} = this.state
      if (error) {
        return <ErrorMessage error={error} />
      } else {
        return <Loader loading message={t('merci/claim/loading')} />
      }
    }

    return (
      <div>
        <P>
          {t('merci/claim/signIn/before')}
        </P>
        <SignIn label={t('merci/claim/signIn/button')} />
      </div>
    )
  }
}

ClaimPledge.propTypes = {
  me: PropTypes.object,
  id: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired
}

const claimPledge = gql`
mutation reclaimPledge($pledgeId: ID!) {
  reclaimPledge(pledgeId: $pledgeId)
}
`

export default graphql(claimPledge, {
  props: ({mutate}) => ({
    claim: pledgeId => mutate({
      variables: {
        pledgeId
      }
    })
  })
})(ClaimPledge)
