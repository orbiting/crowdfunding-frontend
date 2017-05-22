import React, {Component} from 'react'
import {graphql} from 'react-apollo'
import {compose} from 'redux'

import Loader from '../Loader'
import withMe from '../../lib/withMe'
import withT from '../../lib/withT'
import Meta from '../Frame/Meta'
import Router from 'next/router'

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
    this.onScroll = () => {
      const {feed} = this.props

      if (this.container && feed && feed.comments) {
        const bbox = this.container.getBoundingClientRect()
        if (bbox.bottom < window.innerHeight * 2) {
          const {isFetchingMore, hasReachEnd} = this.state
          if (
            isFetchingMore || hasReachEnd
          ) {
            return
          }
          this.setState(() => ({
            isFetchingMore: true
          }), () => {
            const query = this.query = [
              this.props.name
            ].join('_')
            this.props.loadMore().then(({data}) => {
              if (query !== this.query) {
                this.setState(() => ({
                  isFetchingMore: false
                }), () => {
                  this.onScroll()
                })
                return
              }
              this.setState(() => ({
                isFetchingMore: false,
                hasReachEnd: !data.feed.comments.length
              }))
            })
          })
        }
      }
    }
  }
  componentDidMount () {
    const {firstId} = this.props
    if (firstId && this.container) {
      const {top} = this.container.getBoundingClientRect()
      window.scrollTo(0, window.pageYOffset + top - 100)
    }
    window.addEventListener('scroll', this.onScroll)
  }
  componentWillUnmount () {
    window.removeEventListener('scroll', this.onScroll)
  }
  render () {
    const {loading, error, feed, t, name, firstId} = this.props

    return (
      <Loader loading={!feed || loading} error={error} render={() => {
        let {meta: metaData} = this.props
        if (metaData && firstId) {
          const first = feed.comments[0]
          if (first.smImage) {
            metaData = {
              ...metaData,
              image: first.smImage
            }
          }
        }

        const userWaitUntil = feed.userWaitUntil
          ? new Date(feed.userWaitUntil)
          : null
        const now = new Date()
        const userHasToWait = userWaitUntil > now

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
                <Form
                  feedName={name}
                  maxLength={feed.commentMaxLength}
                  onSave={({id}) => {
                    Router.push({pathname: '/vote', query: {id}}, '/vote')
                  }} />
              </div>
            )}
            {feed.comments.map(comment => (
              <Comment key={comment.id}
                feedName={name}
                maxLength={feed.commentMaxLength}
                userIsEligitable={feed.userIsEligitable}
                data={comment}
                meta={metaData} />
            ))}
          </div>
        )
      }} />
    )
  }
}

export default compose(
  withMe,
  withT,
  graphql(feedQuery, {
    props: ({data, ownProps}) => {
      return ({
        loading: data.loading,
        error: data.error,
        feed: data.feed,
        loadMore () {
          return data.fetchMore({
            updateQuery: (previousResult, {fetchMoreResult, queryVariables}) => {
              let comments = [
                ...previousResult.feed.comments,
                ...fetchMoreResult.feed.comments
              ]
                .filter(Boolean)
                .filter(({id}, i, array) => {
                  return i === array.findIndex(d => d.id === id)
                })
              return {
                ...previousResult,
                feed: {
                  ...previousResult.feed,
                  ...fetchMoreResult.feed,
                  comments
                }
              }
            },
            variables: {
              name: ownProps.name,
              limit: ((data.feed || {}).comments || []).length + ownProps.limit
            }
          })
        }
      })
    }
  })
)(Feed)
