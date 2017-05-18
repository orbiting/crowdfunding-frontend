import React, {Component} from 'react'
import {gql, graphql, withApollo} from 'react-apollo'
import {css} from 'glamor'
import {compose} from 'redux'

import Loader from '../Loader'
import withT from '../../lib/withT'

import {
  Interaction
} from '@project-r/styleguide'

import Form from './Form'

const {H2} = Interaction

const styles = {
  comment: css({
    marginBottom: 40
  })
}

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
    this.subscribe(
      this.props.name,
      this.props.data.refetch
    )
  }

  subscribe (feedName, refetch) {
    this.subscriptionObserver = this.props.client.subscribe({
      query: commentsSubscription,
      variables: {
        feedName: feedName
      }
    }).subscribe({
      next (data) {
        console.log('real time update!')
        refetch()
      },
      error (err) { console.error('err', err) }
    })
  }

  render () {
    const {data: {loading, error, feed}, t} = this.props
    return (
      <Loader loading={!feed || loading} error={error} render={() => {
        return (
          <div>
            <H2>{t('discuss/title')}</H2>
            <br />
            {feed.userCanComment && (
              <Form />
            )}
            {feed.comments.map(comment => (
              <div {...styles.comment} key={comment.id}>
                {comment.content}
              </div>
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
      score
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
