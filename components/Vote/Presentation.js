import React, {Component} from 'react'
import {gql, graphql} from 'react-apollo'
import {compose} from 'redux'
import {css} from 'glamor'
import {sum, descending} from 'd3-array'
import Router from 'next/router'

import Loader from '../Loader'

import {countFormat} from '../../lib/utils/formats'

import withT from '../../lib/withT'

import {
  Interaction, H1, Label, A
} from '@project-r/styleguide'

import CantonMap from './CantonMap'
import BarChart from './BarChart'
import colors from './colors'

import {styles as resultStyles, LegendBlock} from './Result'
import {styles as pollStyles} from './Poll'

const {P, H2, H3} = Interaction

const presentationStyles = {
  container: css({
    padding: 10,
    '@media (min-width: 1600px)': {
      padding: 0,
      transform: 'scale(2)',
      transformOrigin: 'top center',
      width: '33%',
      margin: '50px auto'
    }
  })
}

const Slides = {
  1: ({t, voting}) => (
    <div style={{textAlign: 'center'}}>
      <H1 {...pollStyles.title}>
        {t(`vote/${voting.name}/title`)}
      </H1>
      <H2 style={{marginTop: 40, marginBottom: 20, textAlign: 'center'}}>
        {t(`vote/${voting.name}/options/title/generic`)}
      </H2>
      <div {...pollStyles.options}>
        {voting.result.options.map(option => {
          const title = t(`vote/${voting.name}/options/${option.name}/title`)
          const text = t(`vote/${voting.name}/options/${option.name}`)

          const optionColor = colors[option.name]

          const content = [
            <H3 key='title' {...pollStyles.optionTitle} style={{color: optionColor}}>
              {title}
            </H3>,
            <div key='text' {...pollStyles.optionText}>
              {text}
            </div>
          ]

          return (
            <div key={option.id} {...pollStyles.option}>
              {content}
            </div>
          )
        })}
      </div>
    </div>
  ),
  2: ({t, voting, totalVotes}) => {
    const winner = voting.result.options.find(o => o.winner)
    const bars = [
      {
        key: t('vote/result/total'),
        count: totalVotes,
        options: voting.result.options
      }
    ]
    const orderedOptions = [].concat(voting.result.options)
      .sort((a, b) => (
        descending(a.winner, b.winner) ||
        descending(a.count, b.count)
      ))
    const order = orderedOptions
      .map(option => option.name)

    return (
      <div style={{marginTop: 150}}>
        <P>
          {t.elements('vote/result/winner', {
            winner: (
              <span key='winner' {...resultStyles.badge} style={{
                backgroundColor: colors[winner.name]
              }}>
                {t(`vote/${voting.name}/options/${winner.name}/title`)}
              </span>
            ),
            count: countFormat(winner.count),
            percentage: Math.round(winner.count / totalVotes * 1000) / 10
          })}
        </P>

        <br />
        <BarChart order={order} t={t} data={bars} />
        <LegendBlock data={voting.result} name={voting.name} t={t} />

        <P>
          {
            t('vote/result/turnout', {
              percentage: Math.round(
                voting.turnout.submitted / voting.turnout.eligitable * 100
              )
            })
          }
        </P>
      </div>
    )
  },
  3: ({t, voting, totalVotes}) => {
    const orderedOptions = [].concat(voting.result.options)
      .sort((a, b) => (
        descending(a.winner, b.winner) ||
        descending(a.count, b.count)
      ))

    return (
      <div style={{marginTop: 70, 'width': '75%', marginLeft: 'auto', marginRight: 'auto'}}>
        {orderedOptions.map(o => o.name).map((option, i) => (
          <div key={option} style={{width: i === 0 ? '100%' : '50%', float: 'left'}}>
            <span {...resultStyles.badge} style={{
              backgroundColor: colors[option]
            }}>
              {t(`vote/${voting.name}/options/${option}/title`)}
            </span>
            <CantonMap
              t={t}
              data={voting.result.stats.chCantons}
              fill={colors[option]}
              accessor={d => (
                (d.options.find(o => o.name === option) || {}).count
              )} />
            <br />
            <br />
          </div>
        ))}
        <Label>
          {t('vote/result/geoLegendLabel')}
          {' '}
          <A href='https://shop.swisstopo.admin.ch/de/products/landscape/boundaries3D' target='_blank'>swisstopo</A>
          {', '}
          <A href='http://www.geonames.org/countries/' target='_blank'>geonames.org</A>
        </Label>
      </div>
    )
  },
  4: ({t, voting, totalVotes}) => {
    const data = voting.result
    const orderedOptions = [].concat(voting.result.options)
      .sort((a, b) => (
        descending(a.winner, b.winner) ||
        descending(a.count, b.count)
      ))
    const order = orderedOptions
      .map(option => option.name)

    return (
      <div style={{marginTop: 60}}>
        <H3>{t('vote/result/byCountry/first')}</H3>
        <BarChart order={order} t={t} compact data={data.stats.countries} />
        <Label>
          {t('vote/result/geoLegendLabel')}
          {' '}
          <A href='http://www.geonames.org/countries/' target='_blank'>geonames.org</A>
        </Label>
      </div>
    )
  },
  5: ({t, voting, totalVotes}) => {
    const data = voting.result
    const orderedOptions = [].concat(voting.result.options)
      .sort((a, b) => (
        descending(a.winner, b.winner) ||
        descending(a.count, b.count)
      ))
    const order = orderedOptions
      .map(option => option.name)

    return (
      <div style={{marginTop: 60}}>
        <H3>{t('vote/result/byAgeGroup')}</H3>
        <BarChart order={order} t={t} compact data={data.stats.ages} />
      </div>
    )
  }
}

class Presentation extends Component {
  constructor (...args) {
    super(...args)

    this.state = {}
    this.onKeyUp = event => {
      if (event.which === 37) {
        Router.push(`/vote?presentation=1&slide=${parseInt(this.props.slide) - 1}`)
      }
      if (event.which === 39) {
        Router.push(`/vote?presentation=1&slide=${parseInt(this.props.slide) + 1}`)
      }
    }
  }
  componentDidMount () {
    document.addEventListener('keyup', this.onKeyUp)
  }
  componentWillUnmount () {
    document.removeEventListener('keyup', this.onKeyUp)
  }
  render () {
    const {data: {loading, error, voting}, slide, t} = this.props

    return (
      <Loader loading={loading && !voting} error={!voting && error} render={() => {
        if (!voting.result) {
          return <div>Resultat noch nicht bereit.</div>
        }

        const Slide = Slides[slide] || (() => (
          <div style={{textAlign: 'center', marginTop: 300}}>
            {t('vote/result/presentation/noSlide')}
          </div>
        ))

        const totalVotes = sum(voting.result.options, o => o.count)

        return (
          <div {...presentationStyles.container}>
            <Slide t={t} voting={voting} totalVotes={totalVotes} />
          </div>
        )
      }} />
    )
  }
}

const query = gql`
query($name: String!) {
  voting(name: $name) {
    name
    turnout {
      eligitable
      submitted
    }
    result {
      options {
        id
        name
        count
        winner
      }
      stats {
        ages {
          key
          count
          options {
            name
            count
          }
        }
        countries {
          key
          count
          options {
            name
            count
          }
        }
        chCantons {
          key
          count
          options {
            name
            count
          }
        }
      }
      message
      createdAt
      updatedAt
    }
  }
}
`

export default compose(
  graphql(query),
  withT
)(Presentation)
