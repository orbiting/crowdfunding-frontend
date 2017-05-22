import {gql} from 'react-apollo'

export const feed = gql`
query($name: String!, $firstId: ID, $limit: Int, $offset: Int) {
  feed(name: $name) {
    id
    name
    createdAt
    updatedAt
    userIsEligitable
    userWaitUntil
    commentMaxLength
    comments(firstId: $firstId, limit: $limit, offset: $offset) {
      id
      content
      authorName
      authorImage
      smImage
      tags
      score
      upVotes
      downVotes
      userVote
      userCanEdit
      createdAt
      updatedAt
    }
  }
}
`
