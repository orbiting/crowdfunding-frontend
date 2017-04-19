import React from 'react'
import withData from '../lib/withData'
import Frame from '../components/Frame'
import Content from '../components/Frame/Content'
import Portrait from '../components/Portrait'

import {
  P
} from '@project-r/styleguide'

import team from '../lib/staticData'

export default withData(({url}) => {
  const meta = {
    title: 'Project-R-Crew',
    description: 'Die Project-R-Crew arbeitet derzeit – gemeinsam mit zahlreichen Komplizinnen im Hintergrund – an der Gesellschaftsform, dem Aufbau der Crowdfunding-Plattform, der IT-Entwicklung und dem Redaktionskonzept.',
    image: 'https://assets.project-r.construction/images/project_r_crew2.jpg',
    url: `https://project-r.construction${url.pathname}`
  }

  return (
    <Frame url={url}>
      <Content indented>
        <img src={meta.image} style={{
          width: '100%',
          marginBottom: 30
        }} />
        <P>Zur Aufbau-Crew gehören:</P>
        {team.map((person, i) => <Portrait key={i} {...person} odd={!(i % 2)} />)}
      </Content>
    </Frame>
  )
})
