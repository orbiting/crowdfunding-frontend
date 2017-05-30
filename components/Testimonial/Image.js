import React, {Component} from 'react'
import {gql, graphql} from 'react-apollo'
import {css} from 'glamor'
import {compose} from 'redux'
import Head from 'next/head'
import Router from 'next/router'

import Loader from '../Loader'

const styles = {
  img: css({
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%'
  })
}

class Image extends Component {
  tick () {
    clearTimeout(this.timeout)
    this.timeout = setTimeout(
      () => {
        this.next()
        this.tick()
      },
      this.props.duration
    )
  }
  next () {
    const {testimonial, query, error} = this.props
    if (error && !query.sequenceNumber) {
      console.error(error)
      return
    }
    const to = {
      pathname: '/community',
      query: {
        ...query,
        sequenceNumber: error
          ? undefined
          : testimonial && testimonial.sequenceNumber
      }
    }
    Router.push(to, to, {shallow: true})
  }
  componentDidMount () {
    this.tick()
  }
  componentWillUnmount () {
    clearTimeout(this.timeout)
  }
  render () {
    const {
      testimonial,
      testimonial: {
        image, name, sequenceNumber
      }
    } = this.props

    return (
      <div>
        <Head>
          <meta name='robots' content='noindex' />
        </Head>
        <Loader loading={!testimonial} render={() => (
          <img {...styles.img}
            onDoubleClick={() => {
              this.next()
              this.tick()
            }}
            src={image}
            alt={`${sequenceNumber} – ${name}`} />
        )} />
      </div>
    )
  }
}

const query = gql`query aTestimonial($sequenceNumber: Int!, $orderBy: OrderBy!) {
  nextTestimonial(sequenceNumber: $sequenceNumber, orderBy: $orderBy) {
    id
    sequenceNumber
    name
    image(size: SHARE)
  }
}`

export default compose(
  graphql(query, {
    props: ({data, ownProps: {name}}) => {
      return ({
        loading: data.loading,
        error: data.error,
        testimonial: data.nextTestimonial
      })
    }
  })
)(Image)
