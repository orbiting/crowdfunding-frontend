import {gql} from 'react-apollo'

export const feed = gql`
query($name: String!) {
  feed(name: $name) {
    id
    name
    createdAt
    updatedAt
    userIsEligitable
    userWaitUntil
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
      userCanEdit
      createdAt
      updatedAt
    }
  }
}
`
