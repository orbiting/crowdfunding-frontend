# Crowdfunding

Based on [Next.js with Apollo](https://github.com/zeit/next.js/tree/master/examples/with-apollo).

## Development

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

`API_BASE_URL` defaults to `https://api.satellit.online`. If the API is HTTP basic-auth protected, you can generate a basic authorization header with ``Basic ${(new Buffer('user:password')).toString('base64')}`` in Node.js and use it with `API_AUTHORIZATION_HEADER`.

#### Payment

Payment provider configuration can be passed in via the environment. `PUBLIC_BASE_URL` is used for PostFinance and PayPal return urls.

```
PUBLIC_BASE_URL=http://localhost:3000

STRIPE_PUBLISHABLE_KEY=

PF_PSPID=
PF_INPUT_SECRET=
PF_FORM_ACTION=https://e-payment.postfinance.ch/ncol/test/orderstandard.asp

PAYPAL_FORM_ACTION=https://www.sandbox.paypal.com/cgi-bin/webscr
PAYPAL_BUSINESS=
```

#### Basic Auth

Provide the following ENV variables to enable HTTP basic auth:

```
BASIC_AUTH_USER=
BASIC_AUTH_PASS=
BASIC_AUTH_REALM=
```

#### Piwik

Defaults to track on the listed site, can be overwritten:

```
PIWIK_URL_BASE=https://piwik.project-r.construction
PIWIK_SITE_ID=2
```

### Install and Run

```bash
npm install
npm run dev
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
