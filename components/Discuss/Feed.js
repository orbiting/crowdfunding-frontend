import React, {Component} from 'react'
import {gql, graphql, withApollo} from 'react-apollo'
import {compose} from 'redux'

import Loader from '../Loader'
import withT from '../../lib/withT'

import {
  Interaction
} from '@project-r/styleguide'

import Form from './Form'
import Comment from './Comment'

import {feed as feedQuery} from './queries'

const {H2, P} = Interaction

const commentsSubscription = gql`
subscription onCommentAdded($feedName: String!) {
  commentAdded(feedName: $feedName){
    id
    content
  }
}
`

class ChatList extends Component {
  constructor (...args) {
    super(...args)
    this.state = {}
  }

  componentDidMount () {
    this.subscribe()
  }

  subscribe () {
    const {
      name,
      data: {refetch}
    } = this.props
    this.subscriptionObserver = this.props.client.subscribe({
      query: commentsSubscription,
      variables: {
        feedName: name
      }
    }).subscribe({
      next (data) {
        console.log('real time update!')
        refetch({
          name
        })
      },
      error (err) { console.error('err', err) }
    })
  }

  render () {
    const {data: {loading, error, feed}, t, name} = this.props
    return (
      <Loader loading={!feed || loading} error={error} render={() => {
        return (
          <div>
            <H2 style={{marginTop: 80}}>{t('discuss/title')}</H2>
            <br />
            {feed.userCanComment && !!feed.userWaitingTime && (
              <P>{t('discuss/comment/userWaitingTime')}</P>
            )}
            {feed.userCanComment && !feed.userWaitingTime && (
              <div>
                <P>{t('discuss/form/lead')}</P>
                <Form feedName={name} maxLength={feed.commentMaxLength} />
              </div>
            )}
            {feed.comments.map(comment => (
              <Comment feedName={name} maxLength={feed.commentMaxLength} data={comment} key={comment.id} />
            ))}
          </div>
        )
      }} />
    )
  }
}

export default compose(
  withT,
  graphql(feedQuery),
  withApollo
)(ChatList)
