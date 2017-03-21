# Crowdfunding

Based on [Next.js with Apollo](https://github.com/zeit/next.js/tree/master/examples/with-apollo).

## Development

### Environment

You can use a git-excluded `.env` file in development:

```
API_BASE_URL
API_AUTHORIZATION_HEADER
```

`API_BASE_URL` default to `https://api.project-r.space`. You can generate a basic authorization header with ``Basic ${(new Buffer('user:password')).toString('base64')}`` in Node.js.

### Install and Run

```bash
npm install
npm run dev
```
