dev:
	doppler run -- npm run dev

test:
	doppler run -- npm run test

commit:
	git add .
	git commit -m "$m"
	git push

generate-shopify:
	doppler run -- npm run generate:shopify
