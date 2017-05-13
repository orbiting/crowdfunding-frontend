import React, {Component} from 'react'
import {gql, graphql, withApollo} from 'react-apollo'
import {css} from 'glamor'
import {compose} from 'redux'

import Loader from '../Loader'
import withT from '../../lib/withT'

import {
  H2
} from '@project-r/styleguide'

const styles = {
  comment: css({
    marginBottom: 40
  })
}

const COMMENTS_SUBSCRIPTION = gql`
  subscription onCommentAdded($feedName: String!){
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
    this.subscribe('chat', this.props.data.refetch)
  }

  subscribe (feedName, refetch) {
    this.subscriptionObserver = this.props.client.subscribe({
      query: COMMENTS_SUBSCRIPTION,
      variables: { feedName: feedName }
    }).subscribe({
      next (data) {
        console.log('real time update!')
        refetch()
      },
      error (err) { console.error('err', err) }
    })
  }

  render () {
    const {data: {loading, error, feed}} = this.props
    return (
      <Loader loading={!feed || loading} error={error} render={() => {
        return (
          <div>
            <H2>Feed</H2>
            <br />
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
query {
  feed(name: "chat") {
    id
    name
    commentMaxLength
    newCommentWaitingTime
    createdAt
    updatedAt
    comments {
      id
      content
      score
      usersVote
      usersVote
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
