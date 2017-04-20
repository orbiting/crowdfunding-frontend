import React from 'react'
import {gql, graphql} from 'react-apollo'
import {compose} from 'redux'
import Link from 'next/link'

import Loader from '../Loader'
import Meta from '../Frame/Meta'

import withT from '../../lib/withT'

import {
  linkRule
} from '@project-r/styleguide'

import {
  PUBLIC_BASE_URL
} from '../../constants'

import Update from './Detail'

const query = gql`
query {
  updates {
    slug
    title
    text
    metaDescription
    socialMediaImage
    publishedDateTime
  }
}
`

const Overview = compose(
  withT,
  graphql(query, {
    props: ({ data, ownProps: {slug, t, serverContext} }) => {
      let error = data.error
      let update
      if (slug && data.updates && !error) {
        update = data.updates.find(update => (
          update.slug === slug
        ))
        if (!update) {
          error = t('updates/404')
          if (serverContext) {
            serverContext.res.statusCode = 404
          }
        }
      }
      return {
        loading: data.loading,
        updates: data.updates,
        error,
        update
      }
    }
  })
)(({updates, update, t, loading, error}) => (
  <Loader loading={loading} error={error} render={() => {
    if (update) {
      return (
        <div>
          <Meta data={{
            title: update.title,
            description: update.metaDescription,
            url: `${PUBLIC_BASE_URL}/updates/${update.slug}`,
            image: update.socialMediaImage
          }} />
          <Update data={update} />
          <Link href='/updates'>
            <a {...linkRule}>{t('updates/all')}</a>
          </Link>
        </div>
      )
    }

    return (
      <div>
        <Meta data={{
          title: t('updates/pageTitle'),
          description: t('updates/metaDescription'),
          url: `${PUBLIC_BASE_URL}/updates`,
          image: `${PUBLIC_BASE_URL}/static/social-media/updates.png`
        }} />
        {updates.map(update => (
          <Update key={update.slug} data={update} />
        ))}
      </div>
    )
  }} />
))

export default Overview
