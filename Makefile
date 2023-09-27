bootstrap:
	pnpm install
	doppler run -- pnpm run clean
	doppler run -- pnpm run bootstrap

dev:
	doppler run -- pnpm run dev

test:
	doppler run -- pnpm run test

commit:
	git add .
	git commit -m "$m"
	git push

generate-shopify:
	doppler run -- pnpm run generate:shopify

generate-routes:
	doppler run -- pnpm run generate:routes