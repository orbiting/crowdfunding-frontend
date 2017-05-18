import React from 'react'
import {css} from 'glamor'
import {gql, graphql} from 'react-apollo'
import {compose} from 'redux'
import withT from '../../lib/withT'

import {feed as feedQuery} from './queries'

import {
  Interaction, linkRule
} from '@project-r/styleguide'

const {H3, P} = Interaction

const styles = {
  comment: css({
    marginBottom: 40
  })
}

const Comment = ({
  data: {
    content, authorName, authorImage,
    id, upVotes, downVotes, userVote
  },
  upVote, downVote
}) => {
  return (
    <div {...styles.comment}>
      {!!id && (
        <div style={{float: 'right', textAlign: 'right'}}>
          <a {...linkRule} href='#' onClick={event => {
            event.preventDefault()
            upVote()
          }}>up</a><br />
          {upVotes - downVotes}<br />
          <a {...linkRule} href='#' onClick={event => {
            event.preventDefault()
            downVote()
          }}>down</a>
        </div>
      )}
      {!!authorImage && (
        <img src={authorImage} style={{float: 'left', maxWidth: 100, marginBottom: 5, marginRight: 5}} />
      )}
      <H3>{authorName}</H3>
      <P>{content}</P>
      <br style={{clear: 'both'}} />
    </div>
  )
}

const upvote = gql`
mutation upvoteComment($commentId: ID!) {
  upvoteComment(commentId: $commentId)
}
`
const downvote = gql`
mutation downvoteComment($commentId: ID!) {
  downvoteComment(commentId: $commentId)
}
`

export default compose(
  graphql(upvote, {
    props: ({mutate, ownProps}) => ({
      upVote: () => mutate({
        variables: {
          commentId: ownProps.data.id
        },
        refetchQueries: [{
          query: feedQuery,
          variables: {
            name: ownProps.feedName
          }
        }]
      })
    })
  }),
  graphql(downvote, {
    props: ({mutate, ownProps}) => ({
      downVote: () => mutate({
        variables: {
          commentId: ownProps.data.id
        },
        refetchQueries: [{
          query: feedQuery,
          variables: {
            name: ownProps.feedName
          }
        }]
      })
    })
  }),
  withT
)(Comment)
