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
PORT=3003
API_BASE_URL=http://localhost:3001
API_AUTHORIZATION_HEADER=
```

`API_BASE_URL` defaults to `https://api.satellit.io`. If the API is HTTP basic-auth protected, you can generate a basic authorization header with ``Basic ${(new Buffer('user:password')).toString('base64')}`` in Node.js and use it with `API_AUTHORIZATION_HEADER`.

#### Payment

Payment provider configuration can be passed in via the environment. `PUBLIC_BASE_URL` is used for PostFinance and PayPal return urls.

```
PUBLIC_BASE_URL=http://localhost:3003

STRIPE_PUBLISHABLE_KEY=

PF_PSPID=
PF_INPUT_SECRET=
PF_FORM_ACTION=https://e-payment.postfinance.ch/ncol/test/orderstandard.asp
```

#### Basic Auth

Provide the following ENV variables to enable HTTP basic auth:

```
BASIC_AUTH_USER=
BASIC_AUTH_PASS=
BASIC_AUTH_REALM=
```

### Install and Run

```bash
npm install
npm run dev
```
