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

const {H2} = Interaction

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
            <H2>{t('discuss/title')}</H2>
            <br />
            {feed.userCanComment && (
              <Form name={name} maxLength={feed.commentMaxLength} />
            )}
            {feed.comments.map(comment => (
              <Comment data={comment} key={comment.id} />
            ))}
          </div>
        )
      }} />
    )
  }
}

const chatFeed = gql`
query($name: String!) {
  feed(name: $name) {
    id
    name
    createdAt
    updatedAt
    userCanComment
    userWaitingTime
    commentMaxLength
    comments {
      id
      content
      authorName
      tags
      score
      upVotes
      downVotes
      userVote
      createdAt
      updatedAt
    }
  }
}
`

export default compose(
  withT,
  graphql(chatFeed),
  withApollo
)(ChatList)
