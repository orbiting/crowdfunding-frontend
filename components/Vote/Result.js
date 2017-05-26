import React from 'react'
import {sum} from 'd3-array'
import {css} from 'glamor'

import {
  Interaction, Label, H1, A
} from '@project-r/styleguide'

import {countFormat} from '../../lib/utils/formats'
import RawHtml from '../RawHtml'

import CantonMap from './CantonMap'
import BarChart from './BarChart'
import colors from './colors'
import {styles as pollStyles} from './Poll'

const {H2, H3, P} = Interaction

export const styles = {
  legend: css({
    marginTop: 20,
    marginBottom: 20
  }),
  legendBadges: css({
    lineHeight: '20px',
    '& > *': {
      marginBottom: 5,
      marginRight: 5
    }
  }),
  badge: css({
    display: 'inline-block',
    verticalAlign: 'bottom',
    padding: '1px 6px',
    borderRadius: 4,
    color: '#fff'
  })
}

export const randomResult = (key, options, total) => {
  let remaining = 1

  const optionsTotal = sum(options, o => o.count)

  const optionResults = options.map((option, i) => {
    const part = i === options.length - 1
      ? remaining
      : (
        i === 0
        ? option.count / optionsTotal * Math.min(Math.random() + 0.5, 1)
        : Math.random() * remaining
      )
    remaining -= part
    return {
      count: Math.max(Math.max(1, total * 0.05), total * part),
      name: option.name
    }
  })

  return {
    key,
    count: sum(optionResults, o => o.count),
    options: optionResults
  }
}

export const LegendBlock = ({data, name, t}) => (
  <div {...styles.legend}>
    <Label>{t('vote/result/colorLegend')}</Label>
    <div {...styles.legendBadges}>
      {data.options.map(option => (
        <span key={option.name} {...styles.badge} style={{
          backgroundColor: colors[option.name]
        }}>
          {t(`vote/${name}/options/${option.name}/title`)}
        </span>
      ))}
    </div>
  </div>
)

export default ({voting, t}) => {
  const winner = voting.result.options.find(o => o.winner)
  const totalVotes = sum(voting.result.options, o => o.count)

  const bars = [
    {
      key: t('vote/result/total'),
      count: totalVotes,
      options: voting.result.options
    }
  ]

  const cantonResult = [
    ['ZH', 'Kanton Zürich', 0.35 * totalVotes],
    ['BE', 'Kanton Bern', 0.1 * totalVotes],
    ['SG', 'Kanton St. Gallen', 0.05 * totalVotes],
    ['LU', 'Kanton Luzern', 0.05 * totalVotes],
    ['AG', 'Kanton Aargau', 0.05 * totalVotes],
    ['BS', 'Kanton Basel-Stadt', 0.019 * totalVotes],
    ['SO', 'Kanton Solothurn', 0.019 * totalVotes],
    ['ZG', 'Kanton Zug', 0.019 * totalVotes],
    ['GR', 'Kanton Graubünden', 0.019 * totalVotes],
    ['SH', 'Kanton Schaffhausen', 0.019 * totalVotes],
    ['TG', 'Kanton Thurgau', 0.019 * totalVotes],
    ['FR', 'Canton de Fribourg', 0.019 * totalVotes],
    ['BL', 'Kanton Basel-Landschaft', 0.019 * totalVotes],
    ['UR', 'Kanton Uri', 0.019 * totalVotes],
    ['AR', 'Kanton Appenzell Ausserrhoden', 0.019 * totalVotes],
    ['SZ', 'Kanton Schwyz', 0.019 * totalVotes],
    ['VD', 'Canton de Vaud', 0.019 * totalVotes],
    ['NW', 'Kanton Nidwalden', 0.019 * totalVotes],
    ['GE', 'Canton de Genève', 0.019 * totalVotes],
    ['VS', 'Canton du Valais', 0.019 * totalVotes],
    ['GL', 'Kanton Glarus', 0.019 * totalVotes],
    ['OW', 'Kanton Obwalden', 0.019 * totalVotes],
    ['TI', 'Cantone Ticino', 0.019 * totalVotes],
    ['NE', 'Canton de Neuchâtel', 0.019 * totalVotes],
    ['JU', 'Canton du Jura', 0.019 * totalVotes],
    ['AI', 'Kanton Appenzell Innerrhoden', 0.019 * totalVotes]
  ].map(([key, _, total]) => (
    randomResult(key, voting.result.options, total)
  ))

  return (
    <div>
      <H1 {...pollStyles.title}>
        {t(`vote/${voting.name}/title`)}
      </H1>
      <H2 style={{marginTop: 20, marginBottom: 20}}>
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
      <RawHtml type={Label} dangerouslySetInnerHTML={{
        __html: t('vote/options/moreInfo')
      }} />

      <H2 style={{marginTop: 20, marginBottom: 20}}>{t('vote/result/title')}</H2>
      {!!voting.result.message && !!voting.result.message.trim() && <RawHtml type={P} dangerouslySetInnerHTML={{
        __html: voting.result.message
      }} />}
      <P>
        {t.elements('vote/result/winner', {
          winner: (
            <span key='winner' {...styles.badge} style={{
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
      <BarChart t={t} data={bars} />
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
      <br />
      <br />

      <H3>{t('vote/result/byCountry/first')}</H3>
      <BarChart t={t} compact data={[
        ['Schweiz', totalVotes * 0.94],
        ['Deutschland', totalVotes * 0.03],
        ['Österreich', totalVotes * 0.01],
        ['Lichtenstein', totalVotes * 0.009],
        [t('vote/result/otherValues'), totalVotes * 0.011]
      ].map(([key, total]) => (
        randomResult(key, voting.result.options, total)
      ))} />
      <Label>
        {t('vote/result/geoLegendLabel')}
        {' '}
        <A href='http://www.geonames.org/countries/' target='_blank'>geonames.org</A>
      </Label>

      <br />
      <br />
      <br />

      <H3>{t('vote/result/byCanton')}</H3>
      <br />
      {voting.result.options.map(o => o.name).map(option => (
        <div key={option}>
          <span {...styles.badge} style={{
            backgroundColor: colors[option]
          }}>
            {t(`vote/${voting.name}/options/${option}/title`)}
          </span>
          <CantonMap
            t={t}
            data={cantonResult}
            fill={colors[option]}
            accessor={d => (
              d.options.find(o => o.name === option).count / d.count
            )} />
          <br />
          <br />
        </div>
      ))}
      <Label>
        {t('vote/result/geoLegendLabel')}
        {' '}
        <A href='https://shop.swisstopo.admin.ch/de/products/landscape/boundaries3D' target='_blank'>swisstopo</A>
      </Label>

      <br />
      <br />
      <br />

      <H3>{t('vote/result/byMunicipalityTypology')}</H3>
      <BarChart t={t} compact data={[
        [t('vote/result/municipalityTypology/city'), totalVotes * 0.8],
        [t('vote/result/municipalityTypology/intermediate'), totalVotes * 0.15],
        [t('vote/result/municipalityTypology/countryside'), totalVotes * 0.05]
      ].map(([key, total]) => (
        randomResult(key, voting.result.options, total)
      ))} />
      <Label>
        {t('vote/result/municipalityTypology/footnote')}
      </Label>
      {' '}
      <Label>
        {t('vote/result/geoLegendLabel')}
        {' '}
        <A href='https://www.bfs.admin.ch/bfs/de/home/statistiken/querschnittsthemen/raeumliche-analysen.gnpdetail.2017-0593.html'>BFS</A>, <A href='https://www.cadastre.ch/de/services/service/plz.html' target='_blank'>swisstopo</A>
      </Label>

      <br />
      <br />
      <br />

      <H3>{t('vote/result/byAgeGroup')}</H3>
      <BarChart t={t} compact data={voting.result.stats.ages} />
    </div>
  )
}
