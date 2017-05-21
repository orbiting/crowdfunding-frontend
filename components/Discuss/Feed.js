import React, {Component} from 'react'
import {graphql} from 'react-apollo'
import {compose} from 'redux'

import Loader from '../Loader'
import withT from '../../lib/withT'

import {
  Interaction
} from '@project-r/styleguide'

import Form from './Form'
import Comment from './Comment'

import {feed as feedQuery} from './queries'

const {H2, P} = Interaction

class ChatList extends Component {
  constructor (...args) {
    super(...args)
    this.state = {}
  }

  render () {
    const {data: {loading, error, feed}, t, name} = this.props
    return (
      <Loader loading={!feed || loading} error={error} render={() => {
        return (
          <div>
            <H2 style={{marginTop: 80}}>{t('discuss/title')}</H2>
            <br />
            {feed.userCanComment && !!feed.userWaitingTime && (
              <P>{t('discuss/comment/userWaitingTime')}</P>
            )}
            {feed.userCanComment && !feed.userWaitingTime && (
              <div>
                <P>{t('discuss/form/lead')}</P>
                <Form feedName={name} maxLength={feed.commentMaxLength} />
              </div>
            )}
            {feed.comments.map(comment => (
              <Comment feedName={name} maxLength={feed.commentMaxLength} data={comment} key={comment.id} />
            ))}
          </div>
        )
      }} />
    )
  }
}

export default compose(
  withT,
  graphql(feedQuery)
)(ChatList)
