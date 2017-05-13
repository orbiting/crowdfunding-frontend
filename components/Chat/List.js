import React, {Component} from 'react'
import {gql, graphql} from 'react-apollo'
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

class ChatList extends Component {
  constructor (...args) {
    super(...args)
    this.state = {}
  }
  render () {
    const {data: {loading, error, feed}} = this.props
    console.log(feed)
    return (
      <Loader loading={loading} error={error} render={() => {
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
  graphql(chatFeed)
)(ChatList)
