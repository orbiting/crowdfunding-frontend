import React, {Component} from 'react'
import {graphql} from 'react-apollo'
import {compose} from 'redux'
import {format} from 'url'
import {css} from 'glamor'
import Router from 'next/router'

import Loader from '../Loader'
import withMe from '../../lib/withMe'
import withT from '../../lib/withT'
import {intersperse} from '../../lib/utils/helpers'
import Meta from '../Frame/Meta'
import {InlineSpinner} from '../Spinner'

import {
  Interaction, Label, linkRule, mediaQueries
} from '@project-r/styleguide'

import Form from './Form'
import Comment from './Comment'

import {feed as feedQuery} from './queries'

const ORDERS = [
  'HOT', 'NEW', 'TOP'
]
export const DEFAULT_ORDER = 'HOT'

const NBSP = ' '

const {H2, P} = Interaction

const styles = {
  statsFilter: css({
    lineHeight: 1.3,
    [mediaQueries.mUp]: {
      float: 'left',
      paddingRight: 10,
      width: '50%'
    }
  }),
  statsOrder: css({
    lineHeight: 1.3,
    [mediaQueries.mUp]: {
      textAlign: 'right',
      float: 'right',
      paddingLeft: 10,
      width: '50%',
      marginBottom: 0,
      marginTop: 0
    },
    marginTop: 10,
    marginBottom: 10
  })
}

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
                hasReachEnd: data.feed.comments.length === feed.comments.length
              }))
            })
          })
        }
      }
    }
  }
  componentDidMount () {
    if (this.container && (
      this.props.firstId ||
      this.props.order !== DEFAULT_ORDER ||
      this.props.tags
    )) {
      const {top} = this.container.getBoundingClientRect()
      window.scrollTo(0, window.pageYOffset + top - 100)
    }
    window.addEventListener('scroll', this.onScroll)
  }
  componentWillReceiveProps (nextProps) {
    if (nextProps.me !== this.props.me) {
      this.props.refetch && this.props.refetch({
        name: this.props.name,
        limit: this.props.limit
      })
    }
    if (
      nextProps.firstId !== this.props.firstId ||
      nextProps.order !== this.props.order ||
      String(nextProps.tags) !== String(this.props.tags)
    ) {
      this.setState(() => ({
        hasReachEnd: false
      }))
    }
  }
  componentWillUnmount () {
    window.removeEventListener('scroll', this.onScroll)
  }
  render () {
    const {
      loading, error, feed,
      t, name, firstId, limit: feedLimit,
      order, tags
    } = this.props

    return (
      <Loader loading={loading && !feed} error={error} render={() => {
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

        const tagFilters = [
          {
            tag: undefined
          }
        ].concat(feed.stats.tags)

        const currentTag = tags
          ? (tags[0] || null)
          : undefined

        const facetLink = facet => {
          const to = {
            pathname: '/vote',
            query: {}
          }
          const toOrder = facet.order || order
          if (toOrder !== DEFAULT_ORDER) {
            to.query.order = toOrder
          }
          const toTag = facet.tag !== undefined
            ? facet.tag
            : currentTag
          if (!facet.unsetTag && toTag !== undefined) {
            to.query.tag = toTag
          }

          return {
            href: format(to),
            onClick: event => {
              event.preventDefault()
              Router.push(to, to, {shallow: true})
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
                <Form
                  feedName={name}
                  feedLimit={feedLimit}
                  maxLength={feed.commentMaxLength}
                  onSave={({id}) => {
                    Router.push({pathname: '/vote', query: {id}}, '/vote')
                  }} />
              </div>
            )}
            <div style={{marginTop: feed.userIsEligitable ? 40 : 0}}>
              <P>{t.pluralize('discuss/stats', {
                count: feed.stats.count
              })}</P>
              <div {...styles.statsOrder}>
                <Label>{t('discuss/order/title')}</Label><br />
                {intersperse(ORDERS.map(key => {
                  const label = t(`discuss/order/${key}`)
                  if (key === order) {
                    return label
                  }
                  return (
                    <a key={key} {...linkRule} {...facetLink({
                      order: key
                    })}>
                      {label}
                    </a>
                  )
                }), () => ', ')}
              </div>
              <div {...styles.statsFilter}>
                <Label>{t('discuss/tags/title')}</Label><br />
                {intersperse(tagFilters.map(({tag, count}) => {
                  let label
                  if (tag === undefined) {
                    label = t('discuss/tags/all')
                  } else if (tag === null) {
                    label = t('discuss/tags/none')
                  } else {
                    label = t(
                      `vote/${name}/options/${tag}/title`,
                      undefined,
                      tag
                    )
                  }
                  if (count !== undefined) {
                    label = `${label}${NBSP}(${count})`
                  }
                  if (tag === currentTag) {
                    return label
                  }
                  return (
                    <a key={String(tag)} {...linkRule} {...facetLink({
                      tag,
                      unsetTag: tag === undefined
                    })}>
                      {label}
                    </a>
                  )
                }), () => ', ')}
              </div>
              <div style={{clear: 'both'}} />
            </div>

            {feed.comments.map(comment => (
              <Comment key={comment.id}
                feedName={name}
                feedLimit={feedLimit}
                maxLength={feed.commentMaxLength}
                userIsEligitable={feed.userIsEligitable}
                data={comment}
                meta={metaData} />
            ))}
            {!!this.state.isFetchingMore && (
              <div style={{textAlign: 'center'}}>
                <InlineSpinner />
              </div>
            )}
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
        refetch: data.refetch,
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
