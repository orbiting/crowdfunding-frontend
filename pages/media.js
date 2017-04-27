import React from 'react'
import withData from '../lib/withData'
import Frame from '../components/Frame'
import Content from '../components/Frame/Content'

import {
  A, Interaction
} from '@project-r/styleguide'

const {H1, H2, P} = Interaction

export default withData(({url}) => {
  const meta = {
    title: 'Medien',
    description: 'Jetzt unser Crowdfunding unterstützen.'
  }
  return (
    <Frame url={url} meta={meta}>
      <Content>
        <H1>
          {meta.title}
        </H1>
        <br />
        <P>
          Für Auskünfte kontaktieren Sie Susanne Sugimoto.
        </P>
        <P>
          <A href='tel:+41788977028'>+41 78 897 70 28</A><br />
          <A href='mailto:susanne.sugimoto@project-r.construction'>
            susanne.sugimoto@project-r.construction
          </A>
        </P>
        <P style={{margin: '20px 0'}}>
          <A>Medienbilder und Logo herunterladen</A><br />
          (Stand 27. April 17 Uhr)
        </P>
        <P>
          Republik ist ein Projekt von Project R.
        </P>
        <H2 style={{marginTop: 20}}>
          Über Project&nbsp;R
        </H2>
        <P>
          Die Project R Genossenschaft nimmt sich der Weiterentwicklung und Stärkung des Journalismus an. Dazu gehören Projekte wie der Bau einer digitalen Open-Source-Infrastruktur, das Durchführen von Veranstaltungen und Debatten, das Entwickeln neuer journalistischer Formate sowie die Ausbildung von jungen Journalistinnen und Journalisten.
        </P>
        <H2 style={{marginTop: 20}}>
          Allgemeiner Kontakt
        </H2>
        <P>
          Republik<br />
          c/o Hotel Rothaus<br />
          Sihlhallenstrasse 1<br />
          8004 Zürich<br />
          <A href='mailto:kontakt@republik.ch'>
            kontakt@republik.ch
          </A>
        </P>
      </Content>
    </Frame>
  )
})
