import React from 'react'
import Link from 'next/link'

import {
  STATIC_BASE_URL
} from '../../constants'

import {
  linkRule
} from '@project-r/styleguide'

const WerSindSie = {
  slug: 'wer-sind-sie',
  title: 'Wer sind Sie?',
  publishedDateTime: '2017-05-15T05:00:00.000Z',
  children: (
    <div>
      <p>
        Wir haben zum Start der Republik einiges darüber geschrieben, wer wir sind. Nun ist mehr als die Hälfte der Kampagne vorbei. Und wir können endlich über ein wirklich interessantes Thema reden: wer Sie sind.
      </p>
      <p>
        <Link href='/updates/wer-sind-sie'><a {...linkRule}>Bericht lesen und Visualisierungen ansehen</a></Link>
      </p>
      <Link href='/updates/wer-sind-sie'>
        <a>
          <img
            style={{width: '100%'}}
            src={`${STATIC_BASE_URL}/static/social-media/wer-sind-sie.png`} />
        </a>
      </Link>
    </div>
  )
}

export default [
  WerSindSie
]
