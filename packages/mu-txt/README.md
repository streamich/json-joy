# `mu-txt`

This package contains the `mutxt.com` web app. 

## Development

From the monorepo root:

```sh
yarn workspace mu-txt dev
```

Other useful commands:

```sh
yarn workspace mu-txt build
yarn workspace mu-txt typecheck
yarn workspace mu-txt clean
```

## Deployment

### Wrangler / Cloudflare Pages

```sh
yarn workspace mu-txt deploy
yarn workspace mu-txt deploy:preview
```

Wrangler publishes the generated `dist/` folder.

Common commands:

| Command | Purpose |
|---|---|
| `npx wrangler login` | Authenticate once |
| `npx wrangler pages project create mutxt --production-branch=master` | Create the Pages project once |
| `npx wrangler pages deploy dist` | Deploy to production |
| `npx wrangler pages deploy dist --branch=preview` | Deploy a preview build |
| `npx wrangler pages deployment list` | Inspect recent deployments |
