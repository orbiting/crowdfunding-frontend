# Crowdfunding Frontend

A crowdfunding front end written with [Next.js and Apollo](https://github.com/zeit/next.js/tree/master/examples/with-apollo). Developed and sucessfully used for [republik.ch](https://www.republik.ch/crowdfunding).

Related Repositories:

- [Crowdfunding Backend](https://github.com/orbiting/crowdfunding-backend)
- [Styleguide](https://github.com/orbiting/styleguide)

## License

The content, logo and fonts are the property of their owners (content and logo—Project R, GT America—GrilliType and Rubis—Nootype), and may not be reproduced without permission.

The source code is «BSD 3-clause» licensed.

## Adaption Checklist

You'd like to use this software for your own crowdfunding?

Here a rough checklist of tasks:

- Setup the [backend](https://github.com/orbiting/crowdfunding-backend), read the third party services section carefully
- Fork this repository
- Configure your environment, [see below](#environment)
    + Including your own colors, logo and fonts—see [styleguide theming](https://github.com/orbiting/styleguide#theming)
- Customize `pages` directory
    + write your own `crowdfunding.js`, add your own video and project description
    + write your own `index.js`, this is the page shown after the end
    + adapt or remove the following
        - `legal/*`, `updates/*` (see `components/Stats/Story.js`), `crew.js` (see `lib/team.js`), `en.js`, `manifest.js`, `media.js`, `vote.js`
- Adapt the header and footer in `components/Frame` for your pages. `menuItems` in `Header.js`, the whole component in `Footer.js` and `PureFooter.js` and `Meta.js` for the default page title
- Write your own structure texts in `lib/translations.json`, can be done comfortably by forking this [gsheets](https://docs.google.com/spreadsheets/d/1OHoiENwJH-tqf9yXfXHOevAn17daO_CvB21Rym-oiqk) and adapting the `translations` task in `package.json`
- Adapt the `static` folder
    + add your own social media images and favicons
    + purge our photos and assets like subtitles and fonts
- Test, keep an eye out for hard-coded Republik texts and enjoy!

## Development

### Install and Run

```bash
npm install
npm run dev
```

### Environment

You can use a git-excluded `.env` file in development:

```
PORT=3000
API_BASE_URL=http://localhost:3001
API_AUTHORIZATION_HEADER=
```

If the API is HTTP basic-auth protected, you can generate a basic authorization header with ``Basic ${(new Buffer('user:password')).toString('base64')}`` in Node.js and use it with `API_AUTHORIZATION_HEADER`.

#### Style Guide Theming

See [orbiting/styleguide](https://github.com/orbiting/styleguide#theming).

#### Public Base Url

```
PUBLIC_BASE_URL=https://example.com
```

#### Static Assets

Static assets can be loaded from a CDN.

```
STATIC_BASE_URL=https://assets.example.com
```

This defaults to `PUBLIC_BASE_URL`.

This is prepended to all `/static` references:

```
import {
  STATIC_BASE_URL
} from '../constants'

export default () => (
  <A href={`${STATIC_BASE_URL}/static/manifest.pdf`}>
    Manifest als PDF herunterladen
  </A>
)
```

#### Payment

Payment provider configuration can be passed in via the environment. `PUBLIC_BASE_URL` is used for PostFinance and PayPal return urls.

```
PUBLIC_BASE_URL=https://example.com

STRIPE_PUBLISHABLE_KEY=

PF_PSPID=
PF_FORM_ACTION=https://e-payment.postfinance.ch/ncol/test/orderstandard.asp

PAYPAL_FORM_ACTION=https://www.sandbox.paypal.com/cgi-bin/webscr
PAYPAL_BUSINESS=
PAYPAL_DONATE_LINK=
```

#### Basic Auth

Provide the following ENV variables to enable HTTP basic auth:

```
BASIC_AUTH_USER=
BASIC_AUTH_PASS=
BASIC_AUTH_REALM=
```

#### Piwik

You can enable tracking by setting a base url and site id:

```
PIWIK_URL_BASE=https://piwik.example.com
PIWIK_SITE_ID=1
```

#### Countdown Teaser

You can configure a countdown date, before that date a teaser website will be shown.

```
COUNTDOWN_UTC=2017-04-26T05:00:00.000Z
COUNTDOWN_NOTE=
```

`constants.js` will export a `COUNTDOWN_UTC` (`Date.toISOString()`) and `COUNTDOWN_DATE` from it, for usage in the application code.

Additionally you can configure a backdoor URL. Opening that URL sets a cookie which allows to circumvent the countdown page.

```
BACKDOOR_URL=/iftah-ya-simsim
```

Shout-out to [Schmidsi](https://github.com/schmidsi) for building the countdown page.

#### Crowdfunding Name(s)

Crowdfundings have a dedicated name in the backend. You can configure the currently active one via the environment. You can only point the front end at one crowdfunding at a time.

```
CROWDFUNDING_NAME=REPUBLIK
```

Additionally you can configure a second `SALES_UP` crowdfunding. This can be used after the main crowdfunding has concluded and you wish to reopen sales until your launch.

```
SALES_UP=PRESALE
```

#### Newsletter

Requires the following ENV variables:

```
MANDRILL_API_KEY=
MAILCHIMP_API_KEY=
MAILCHIMP_LIST_ID=
SUBSCRIBE_SECRET=
```

#### Polling

Polling can create considerable load. To help mitigate overloads the various polling intervals can be configured via the environment.

```
STATUS_POLL_INTERVAL_MS=10000
STATS_POLL_INTERVAL_MS=10000
VOTING_POLL_INTERVAL_MS=10000
```

### Testing

We use [webdriver.io](http://webdriver.io/) and utilize [saucelabs.com](https://saucelabs.com/) VM arsenal for end to end testing.

You will need following environment variables (`.env` supported):

```
SAUCE_USERNAME=
SAUCE_ACCESS_KEY=
```

```
npm run test
```

This will start a [Sauce Connect Proxy](https://wiki.saucelabs.com/display/DOCS/Sauce+Connect+Proxy+FAQS), make sure to allow incomming connections to it.

#### Local

To run the tests locally you will need a [running selenium standalone server](http://webdriver.io/guide.html).

```
LOCAL=1 npm run test
```

Run a [webdriver.io repl](http://webdriver.io/guide/usage/repl.html):

```
$(npm bin)/wdio repl 
```
