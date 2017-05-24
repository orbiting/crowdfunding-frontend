import {gql} from 'react-apollo'

export const feed = gql`
query($name: String!, $firstId: ID, $limit: Int, $offset: Int, $tags: [String!], $order: OrderType) {
  feed(name: $name) {
    id
    name
    createdAt
    updatedAt
    userIsEligitable
    userWaitUntil
    commentMaxLength
    stats {
      count
      tags {
        tag
        count
      }
    }
    comments(firstId: $firstId, limit: $limit, offset: $offset, tags: $tags, order: $order) {
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
