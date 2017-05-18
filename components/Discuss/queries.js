import {gql} from 'react-apollo'

export const feed = gql`
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
      authorImage
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
