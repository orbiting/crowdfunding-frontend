# Crowdfunding

Based on [Next.js with Apollo](https://github.com/zeit/next.js/tree/master/examples/with-apollo).

## Development

### Environment

You can use a git-excluded `.env` file in development:

```
PORT=3003
API_BASE_URL=http://localhost:3001/graphql
API_AUTHORIZATION_HEADER=
PUBLIC_URL=http://localhost:3003
```

`API_BASE_URL` default to `https://api.satellit.io`. If the API is HTTP basic-auth protected, you can generate a basic authorization header with ``Basic ${(new Buffer('user:password')).toString('base64')}`` in Node.js and use it with `API_AUTHORIZATION_HEADER`.

#### basic auth
provide the following ENV variables to enable HTTP basic auth.
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
