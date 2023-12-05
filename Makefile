bootstrap:
	doppler run -- pnpm install
	doppler run -- pnpm clean
	doppler run -- pnpm run-p database:deploy build:server

dev:
	doppler run -- pnpm dev

test:
	doppler run -- pnpm test

commit:
	git add .
	git commit -m "$m"
	git push

generate-shopify:
	doppler run -- pnpm generate:shopify

generate-routes:
	doppler run -- pnpm generate:routes