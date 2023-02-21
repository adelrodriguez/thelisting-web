export SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN
export SENTRY_ORG=thelisting
export SENTRY_PROJECT=app

echo "Uploading sourcemaps to Sentry"

node ./node_modules/@sentry/remix/scripts/sentry-upload-sourcemaps.js --release $RAILWAY_GIT_COMMIT_SHA

echo "Removing sourcemaps"

rm -v ./public/**/*.map
rm -v ./public/build/**/*.map