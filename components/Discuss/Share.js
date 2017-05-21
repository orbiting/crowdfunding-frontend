import React from 'react'
import {css} from 'glamor'
import {compose} from 'redux'
import Head from 'next/head'
import {gql, graphql} from 'react-apollo'

import withT from '../../lib/withT'

import Loader from '../Loader'
import pollColors from '../Vote/colors'
import Markdown from '../Markdown'

import {
  Interaction, Logo
} from '@project-r/styleguide'

const styles = {
  container: css({
    position: 'relative',
    width: 1200,
    height: 628,
    backgroundColor: '#fff'
  }),
  logo: css({
    position: 'absolute',
    left: 628 + 50,
    right: 50,
    bottom: 50
  }),
  text: css({
    position: 'absolute',
    top: 50,
    left: 50,
    right: 50,
    bottom: 50 + 120,
    wordWrap: 'break-word'
  }),
  content: css({
    fontSize: 27,
    lineHeight: 1.42
  }),
  name: css({
    fontSize: 60,
    lineHeight: '75px',
    marginBottom: 20
  })
}

const fontSizeBoost = length => {
  if (length < 40) {
    return 36
  }
  if (length < 50) {
    return 34
  }
  if (length < 80) {
    return 20
  }
  if (length < 100) {
    return 16
  }
  if (length < 150) {
    return 10
  }
  if (length < 200) {
    return 5
  }
  if (length < 250) {
    return 2
  }
  return 0
}

const Item = ({loading, error, t, name: feedName, comment: {authorImage, authorName, content, tags = []}}) => (
  <Loader loading={loading} error={error} render={() => (
    <div {...styles.container}>
      <Head>
        <meta name='robots' content='noindex' />
      </Head>
      <div {...styles.text}>
        <Interaction.H2 {...styles.name} style={{color: pollColors[tags[0]]}}>
          {authorName}
          {!!tags[0] && (
            ' ' + t('discuss/comment/for', {
              tagName: t(`vote/${feedName}/options/${tags[0]}/title`, undefined, tags[0])
            })
          )}
        </Interaction.H2>
        {content && <div {...styles.content} {...css({
          '& > *': {
            fontSize: 32 + fontSizeBoost(content.length),
            lineHeight: 1.2
          }
        })}>
          <Markdown content={content} />
        </div>}
      </div>
      <div {...styles.logo}>
        <Logo />
      </div>
    </div>
  )} />
)

const query = gql`
query($name: String!, $firstId: ID) {
  feed(name: $name) {
    comments(firstId: $firstId, limit: 1) {
      id
      content
      authorName
      authorImage
      tags
    }
  }
}
`

export default compose(
  withT,
  graphql(query, {
    props: ({data, ownProps: {firstId}}) => {
      return ({
        loading: data.loading,
        error: data.error,
        comment: (
          data.feed &&
          data.feed.comments[0]
        )
      })
    }
  })
)(Item)
