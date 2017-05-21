import React, {Component} from 'react'
import {graphql} from 'react-apollo'
import {compose} from 'redux'

import Loader from '../Loader'
import withT from '../../lib/withT'
import Meta from '../Frame/Meta'

import {
  Interaction
} from '@project-r/styleguide'

import Form from './Form'
import Comment from './Comment'

import {feed as feedQuery} from './queries'

const {H2, P} = Interaction

class Feed extends Component {
  constructor (...args) {
    super(...args)
    this.state = {}

    this.containerRef = ref => {
      this.container = ref
    }
  }
  componentDidMount () {
    const {firstId} = this.props
    if (firstId && this.container) {
      const {top} = this.container.getBoundingClientRect()
      window.scrollTo(0, window.pageYOffset + top - 100)
    }
  }
  render () {
    const {data: {loading, error, feed}, t, name, firstId} = this.props

    const userWaitUntil = feed.userWaitUntil
      ? new Date(feed.userWaitUntil)
      : null
    const now = new Date()
    const userHasToWait = userWaitUntil > now

    return (
      <Loader loading={!feed || loading} error={error} render={() => {
        let {metaData} = this.props
        if (metaData && firstId) {
          const first = feed.comments[0]
          if (first.smImage) {
            metaData = {
              ...metaData,
              image: first.smImage
            }
          }
        }

        return (
          <div ref={this.containerRef}>
            {!!metaData && (
              <Meta data={metaData} />
            )}
            <H2 style={{marginTop: 80}}>{t('discuss/title')}</H2>
            <br />
            {feed.userIsEligitable && !!userHasToWait && (
              <P>{t('discuss/comment/userWaitingTime')}</P>
            )}
            {feed.userIsEligitable && !userHasToWait && (
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
)(Feed)
