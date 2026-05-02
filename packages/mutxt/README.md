# `mutxt`

This package contains the `mutxt.com` web app. 

## Development

From the monorepo root:

```sh
yarn workspace mutxt dev
```

Other useful commands:

```sh
yarn workspace mutxt build
yarn workspace mutxt typecheck
yarn workspace mutxt clean
```

## Deployment

### Wrangler / Cloudflare Pages

```sh
yarn workspace mutxt deploy
yarn workspace mutxt deploy:preview
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
