import React from 'react'
import withData from '../../lib/withData'
import Frame from '../../components/Frame'
import Content from '../../components/Frame/Content'

import {
  A, Interaction
} from '@project-r/styleguide'

const {H1, H2, P} = Interaction

export default withData(({url}) => {
  const title = 'Impressum'
  return (
    <Frame url={url} meta={{title}}>
      <Content>
        <H1>
          {title}
        </H1>
        <br />
        <H2>Kontakt</H2>
        <P>
          Republik<br />
          c/o Hotel Rothaus<br />
          Sihlhallenstrasse 1<br />
          8004 Zürich<br />
          <A href='mailto:kontakt@republik.ch'>
            kontakt@republik.ch
          </A>
        </P>

        <br />
        <H2>Verantwortlich für den Inhalt der Seiten</H2>
        <P>
          Project R Genossenschaft<br />
          Sihlhallenstrasse 1<br />
          8004 Zürich<br />
          <A href='mailto:office@project-r.construction'>
            office@project-r.construction
          </A>
        </P>

        <br />
        <H2>Vorstand</H2>
        <P>
          Nadja Schnetzler, Präsidentin<br />
          Susanne Sugimoto, Geschäftsführerin, +41 78 897 70 28<br />
          Laurent Burst<br />
          Clara Vuillemin
        </P>

        <br />
        <H2>Redaktion</H2>
        <P>
          Christof Moser<br />
          Constantin Seibt
        </P>

        <br />
        <H2>IT-Entwicklung</H2>
        <P>
          Clara Vuillemin<br />
          Thomas Preusse<br />
          Patrick Recher
        </P>

        <br />
        <H2>Gestaltung</H2>
        <P>
          Bodara GmbH (Tobias Peier, Dominique Schmitz)<br />
          Thomas Preusse
        </P>

        <br />
        <H2>Fotos</H2>
        <P>
          Simon Tanner<br />
          Laurent Burst<br />
          Jan Bolomey
        </P>

        <br />
        <H2>Videofilme</H2>
        <P>
          real Film GmbH (Stefan Jung)<br />
          Regardez! Entertainment GmbH (Bart Wasem, Matthias Zurbriggen)<br />
          Martin Skalsky<br />
          Marco di Nardo<br />
          Risa Chiappori<br />
          Severin Bärenbold<br />
          Christian Rösch<br />
          Fabian Scheffold<br />
          Richard Höchner<br />
          Christof Moser<br />
          Yvonne Kunz<br />
          Clara Vuillemin
        </P>

        <br />
        <H2>Copyright</H2>
        <P>
          Das Copyright für sämtliche Inhalte dieser Website liegt bei der Project R Genossenschaft.
        </P>

        <br />
        <H2>Disclaimer</H2>
        <P>
          Alle Texte und Links wurden sorgfältig geprüft und werden laufend aktualisiert. Wir sind bemüht, richtige und vollständige Informationen auf dieser Website bereitzustellen, übernehmen aber keinerlei Verantwortung, Garantien oder Haftung dafür, dass die durch diese Website bereitgestellten Informationen, einschliesslich jeglicher Datenbankeinträge, richtig, vollständig oder aktuell sind.
        </P>
        <P>
          Wir behalten uns das Recht vor, jederzeit und ohne Vorankündigung die Informationen auf dieser Website zu ändern, und verpflichten uns auch nicht, die enthaltenen Informationen zu aktualisieren. Alle Links zu externen Anbietern wurden zum Zeitpunkt ihrer Aufnahme auf ihre Richtigkeit überprüft. Dennoch haften wir nicht für Inhalte und Verfügbarkeit von Websites, die mittels Hyperlinks zu erreichen sind.
        </P>
        <P>
          Für illegale, fehlerhafte oder unvollständige Inhalte und insbesondere für Schäden, die durch die ungeprüfte Nutzung von Inhalten verknüpfter Seiten entstehen, haftet allein der Anbieter der Seite, auf welche verwiesen wurde. Dabei ist es gleichgültig, ob der Schaden direkter, indirekter oder finanzieller Natur ist oder ein sonstiger Schaden vorliegt, der sich aus Datenverlust, Nutzungsausfall oder anderen Gründen aller Art ergeben könnte.
        </P>
      </Content>
    </Frame>
  )
})
