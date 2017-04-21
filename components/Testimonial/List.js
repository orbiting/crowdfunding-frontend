import React, {Component} from 'react'
import {gql, graphql} from 'react-apollo'
import {compose} from 'redux'
import {css} from 'glamor'
import {max} from 'd3-array'

import withT from '../../lib/withT'
import RawHtml from '../RawHtml'
import Loader from '../Loader'
import Share from '../Share'

import {
  Interaction, mediaQueries, fontFamilies,
  Field, P as SerifP, colors
} from '@project-r/styleguide'

import {
  PUBLIC_BASE_URL
} from '../../constants'

const {P, H2} = Interaction

const SIZES = [
  {minWidth: 0, columns: 3},
  {minWidth: 400, columns: 4},
  {minWidth: 700, columns: 5},
  {minWidth: mediaQueries.mBreakPoint, columns: 3}, // 768
  {minWidth: 900, columns: 4},
  {minWidth: 1000, columns: 5}
]

const PADDING = 5
const styles = {
  grid: css({
    margin: '0 -5px',
    ':after': {
      content: '""',
      display: 'table',
      clear: 'both'
    }
  }),
  item: css({
    cursor: 'pointer',
    float: 'left',
    ...(SIZES.reduce(
      (styles, size) => {
        const width = `${100 / size.columns}%`
        if (size.minWidth) {
          styles[`@media only screen and (min-width: ${size.minWidth}px)`] = {
            width
          }
        } else {
          styles.width = width
        }
        return styles
      },
      {}
    )),
    lineHeight: 0,
    padding: PADDING,
    '& img': {
      width: '100%'
    },
    position: 'relative'
  }),
  name: css({
    position: 'absolute',
    bottom: PADDING + 5,
    left: PADDING + 5,
    right: PADDING + 5,
    fontSize: 12,
    lineHeight: '15px',
    [mediaQueries.mUp]: {
      fontSize: 17,
      lineHeight: '22px'
    },
    color: '#fff',
    fontFamily: fontFamilies.sansSerifMedium
  }),
  detail: css({
    width: '100%',
    padding: '30px 45px',
    float: 'left'
  }),
  detailRole: css({
    fontSize: 17,
    fontFamily: fontFamilies.sansSerifRegular,
    color: colors.secondary
  })
}

const Detail = ({t, data: {id, name, role, quote}}) => (
  <div {...styles.detail}>
    <H2>{name} <span {...styles.detailRole}>{role}</span></H2>
    <SerifP>«{quote}»</SerifP>
    <Share
      fill={colors.secondary}
      url={`${PUBLIC_BASE_URL}/community?id=${id}`}
      emailSubject={t('testimonial/detail/share/emailSubject', {
        name,
        role
      })} />
  </div>
)

class List extends Component {
  constructor (props) {
    super(props)
    this.state = {
      seed: props.seed || generateSeed(),
      columns: 3,
      open: {
        0: props.firstId
      }
    }
    this.measure = () => {
      const sizeIndex = max(SIZES, (d, i) => (
        d.minWidth <= window.innerWidth ? i : -1
      ))
      const size = SIZES[sizeIndex]
      const columns = size.columns
      console.log('measure', size)
      if (columns !== this.state.columns) {
        this.setState(() => ({columns}))
      }
      // this.onScroll()
    }
  }
  componentDidMount () {
    // window.addEventListener('scroll', this.onScroll)
    window.addEventListener('resize', this.measure)
    this.measure()
  }
  componentDidUpdate () {
    this.measure()
  }
  componentWillUnmount () {
    // window.removeEventListener('scroll', this.onScroll)
    window.removeEventListener('resize', this.measure)
  }
  render () {
    const {loading, error, testimonials, t} = this.props
    const {columns, open} = this.state

    return (
      <Loader loading={testimonials ? false : loading} error={error} render={() => {
        const items = []
        const lastIndex = testimonials.length - 1
        testimonials.forEach(({id, image, name}, i) => {
          const row = Math.floor(i / columns)
          const offset = i % columns
          const openId = open[row - 1] || (i === lastIndex && open[row])
          if (
            (offset === 0 || i === lastIndex) &&
            openId
          ) {
            const openItem = testimonials
              .find(testimonial => testimonial.id === openId)
            if (openItem) {
              items.push(
                <Detail key={`detail-${row - 1}`} t={t} data={openItem} />
              )
            }
          }

          items.push((
            <div key={id} {...styles.item} onClick={(e) => {
              window.location = `/community?id=${id}`
            }}>
              <img src={image} />
              <div {...styles.name}>{name}</div>
            </div>
          ))
        })

        return (
          <div {...styles.grid}>
            {items}
          </div>
        )
      }} />
    )
  }
}

const query = gql`query testimonials($seed: Float!, $name: String, $firstId: ID) {
  testimonials(seed: $seed, name: $name, firstId: $firstId) {
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

const ListWithQuery = compose(
  withT,
  graphql(query, {
    props: ({data, ownProps: {name}}) => {
      return ({
        loading: data.loading,
        error: data.error,
        testimonials: data.testimonials
      })
    }
  })
)(List)

export const generateSeed = () => Math.random() * 2 - 1

class Container extends Component {
  constructor (props) {
    super(props)
    this.state = {
      seed: props.seed || generateSeed()
    }
  }
  render () {
    const {t, id} = this.props
    const {seed, query} = this.state
    return (
      <div>
        <RawHtml type={P} dangerouslySetInnerHTML={{
          __html: t('testimonial/list/before')
        }} />
        <Field label={t('testimonial/search/label')}
          name='search'
          value={query}
          autoComplete='off'
          onChange={(_, value) => {
            this.setState(() => ({
              query: value
            }))
          }} />
        <br /><br />
        <ListWithQuery firstId={query ? undefined : id} name={query} seed={seed} />
      </div>
    )
  }
}

export default compose(
  withT
)(Container)
