import React from 'react'
import {gql, graphql} from 'react-apollo'
import {css} from 'glamor'
import {compose} from 'redux'

import withT from '../../lib/withT'

import Loader from '../Loader'

import {
  Interaction, P
} from '@project-r/styleguide'

const {H2} = Interaction

const styles = {
  container: css({
    width: 1200,
    height: 628
  })
}

const Item = ({loading, error, testimonial: {name, role, quote, image, video}}) => (
  <Loader loading={loading} error={error} render={() => (
    <div {...styles.container}>
      <img src={image} />
      <H2>{name} <span>{role}</span></H2>
      <P>«{quote}»</P>
    </div>
  )} />
)

const query = gql`query testimonials($firstId: ID) {
  testimonials(seed: -0.2, firstId: $firstId, limit: 1) {
    id
    name
    role
    quote
    image
    video {
      hls
      mp4
      youtube
    }
  }
}`

export default compose(
  graphql(query, {
    props: ({data, ownProps: {name}}) => {
      return ({
        loading: data.loading,
        error: data.error,
        testimonial: data.testimonials && data.testimonials[0]
      })
    }
  }),
  withT
)(Item)
