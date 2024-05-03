bootstrap:
	doppler run -- bun install
	doppler run -- bun clean
	doppler run -- bun run-p database:deploy build:server

dev:
	doppler run -- bun dev

test:
	doppler run -- bun test

commit:
	git add .
	git commit -m "$m"
	git push

generate-routes:
	doppler run -- bun generate:routes