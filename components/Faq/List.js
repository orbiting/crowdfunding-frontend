import React, {Component} from 'react'
import {gql, graphql} from 'react-apollo'
import {css, merge} from 'glamor'
import {compose} from 'redux'

import Loader from '../Loader'
import Meta from '../Frame/Meta'
import withT from '../../lib/withT'

import {
  Interaction, colors,
  fontFamilies, mediaQueries
} from '@project-r/styleguide'

import {
  HEADER_HEIGHT, HEADER_HEIGHT_MOBILE,
  MENUBAR_HEIGHT
} from '../Frame/constants'

import {
  PUBLIC_BASE_URL
} from '../../constants'

import {nest} from 'd3-collection'

const {P} = Interaction

const styles = {
  category: css({
    marginBottom: 40
  }),
  title: css({
    fontFamily: fontFamilies.sansSerifRegular,
    fontWeight: 'normal',
    fontSize: 30,
    letterSpacing: -0.26,
    marginBottom: 20
  }),
  faq: css({
    padding: '10px 0',
    borderBottom: `1px solid ${colors.divider}`
  }),
  faqAnchor: css({
    display: 'block',
    visibility: 'hidden',
    position: 'relative',
    top: -(HEADER_HEIGHT_MOBILE + MENUBAR_HEIGHT + 5),
    [mediaQueries.mUp]: {
      top: -(HEADER_HEIGHT + 5)
    }
  }),
  question: css({
    cursor: 'pointer',
    '& a': {
      color: 'inherit',
      textDecoration: 'none'
    }
  }),
  active: css({
    fontFamily: fontFamilies.sansSerifMedium,
    marginBottom: 10
  })
}

export const H2 = ({children}) => (
  <h2 {...styles.title}>{children}</h2>
)

const slug = string => string
  .toLowerCase()
  .replace(/[^0-9a-zäöü]+/g, ' ')
  .trim()
  .replace(/\s+/g, '-')

class FaqList extends Component {
  constructor (...args) {
    super(...args)

    this.state = {}
  }
  componentDidMount () {
    if (window.location.hash) {
      this.setState(() => ({
        [window.location.hash.replace(/^#/, '')]: true
      }))
    }
  }
  render () {
    const {data: {loading, error, faqs}, t} = this.props
    return (
      <Loader loading={loading} error={error} render={() => {
        const faqsByCategory = nest()
          .key(d => d.category)
          .entries(faqs)

        return (
          <div>
            <Meta data={{
              title: t('faq/pageTitle'),
              description: t('faq/metaDescription'),
              url: `${PUBLIC_BASE_URL}/faq`,
              image: `${PUBLIC_BASE_URL}/static/social-media/faq.png`
            }} />
            {faqsByCategory.map(({key: title, values}) => (
              <div {...styles.category} key={title}>
                <H2>{title}</H2>
                {values.map(faq => {
                  const active = this.state[slug(faq.question)]
                  return (
                    <div {...styles.faq}>
                      <a {...styles.faqAnchor} id={slug(faq.question)} />
                      <P {...merge(styles.question, active && styles.active)}>
                        <a href={`#${slug(faq.question)}`}
                          onClick={e => {
                            e.preventDefault()
                            this.setState(() => ({
                              [slug(faq.question)]: !active
                            }))
                          }}>
                          {faq.question}
                        </a>
                      </P>
                      {active && <P>{faq.answer}</P>}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )
      }} />
    )
  }
}

const publishedFaqs = gql`
query {
  faqs {
    category
    question
    answer
  }
}
`

export default compose(
  withT,
  graphql(publishedFaqs)
)(FaqList)
