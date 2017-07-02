# Crowdfunding Frontend

A crowdfunding front end written with [Next.js and Apollo](https://github.com/zeit/next.js/tree/master/examples/with-apollo). Developed and sucessfully used for [republik.ch](https://www.republik.ch/crowdfunding), generating over 13k paid subscribers and more than 3.4 million swiss francs.

Related Repositories:

- [Crowdfunding API Server](https://github.com/orbiting/crowdfunding-api)
- [Styleguide](https://github.com/orbiting/styleguide)

## License

The content, logo and fonts are the property of their owners (content and logo—Project R, GT America—GrilliType and Rubis—Nootype), and may not be reproduced without permission.

The source code is «BSD 3-clause» licensed.

## Development

### Install and Run

```bash
npm install
npm run dev
```

### Environment

You will need an `NPM_TOKEN` in your system environment to install our private @project-r npm packages. For example via `~/.bash_profile`:

```
export NPM_TOKEN="00000000-0000-0000-0000-000000000000"
```

You can use a git-excluded `.env` file in development:

```
PORT=3000
API_BASE_URL=http://localhost:3001
API_AUTHORIZATION_HEADER=
```

If the API is HTTP basic-auth protected, you can generate a basic authorization header with ``Basic ${(new Buffer('user:password')).toString('base64')}`` in Node.js and use it with `API_AUTHORIZATION_HEADER`.

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
TV_POLL_INTERVAL_MS=10000
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
