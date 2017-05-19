import React, {Component} from 'react'
import {css} from 'glamor'
import {gql, graphql} from 'react-apollo'
import {compose} from 'redux'
import withT from '../../lib/withT'
import {timeMinute} from 'd3-time'

import {feed as feedQuery} from './queries'
import View from './CommentView'
import Form from './Form'

import {swissTime} from '../../lib/utils/formats'

import {
  Label, A, linkRule
} from '@project-r/styleguide'

const dateTimeFormat = swissTime.format('%e. %B %H.%M Uhr')

const styles = {
  comment: css({
    marginTop: 40,
    marginBottom: 40
  })
}

class Comment extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isEditing: false
    }
  }
  render () {
    const {
      data, data: {
        id, upVotes, downVotes, userVote
      },
      t,
      upVote, downVote,
      feedName
    } = this.props
    const {
      isEditing
    } = this.state

    if (isEditing) {
      return (
        <div {...styles.comment}>
          <Form feedName={feedName} edit={data} onSave={() => {
            this.setState({
              isEditing: false
            })
          }} />
        </div>
      )
    }

    const createdAt = new Date(data.createdAt)
    const updatedAt = new Date(data.updatedAt)
    const updateOffset = timeMinute.count(createdAt, updatedAt)
    let updateNote
    if (updateOffset > 2) {
      updateNote = t('discuss/comment/updateNote', {
        updateDate: dateTimeFormat(updatedAt)
      })
    }

    return (
      <div {...styles.comment}>
        {!!id && (
          <div style={{float: 'right', textAlign: 'right'}}>
            <a {...linkRule} href='#'
              style={{opacity: userVote === 'DOWN' ? 0.3 : 1}}
              onClick={event => {
                event.preventDefault()
                upVote()
              }}>
              {t('discuss/comment/upVote')}
            </a><br />
            {upVotes - downVotes}<br />
            <a {...linkRule} href='#'
              style={{opacity: userVote === 'UP' ? 0.3 : 1}}
              onClick={event => {
                event.preventDefault()
                downVote()
              }}>
              {t('discuss/comment/downVote')}
            </a>
          </div>
        )}
        <View {...data} />
        <Label>
          {[
            dateTimeFormat(createdAt),
            updateNote
          ].filter(Boolean).join(', ')}
          {!!data.userCanEdit && (<span>
            <br />
            <A href='#' onClick={event => {
              event.preventDefault()
              this.setState({
                isEditing: true
              })
            }}>
              {t('discuss/comment/edit')}
            </A>
            {' – '}
            <A href='#' onClick={event => {
              event.preventDefault()
              this.props.unpublish()
            }}>
              {t('discuss/comment/unpublish')}
            </A>
          </span>)}
        </Label>
      </div>
    )
  }
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
const unpublish = gql`
mutation unpublishComment($commentId: ID!) {
  unpublishComment(commentId: $commentId)
}
`

export default compose(
  graphql(unpublish, {
    props: ({mutate, ownProps}) => ({
      unpublish: () => mutate({
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
