export SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN
export SENTRY_ORG=thelisting
export SENTRY_PROJECT=app

VERSION=$RAILWAY_GIT_COMMIT_SHA

echo "Uploading sourcemaps to Sentry"

sentry-cli releases new "$VERSION"
# upload server sourcemaps
sentry-cli releases files "$VERSION" upload-sourcemaps ./ --ignore node_modules --ignore public --url-prefix="/app"
# upload client sourcemaps (fully separate them by setting dist to client)
sentry-cli releases files "$VERSION" upload-sourcemaps ./public --dist "client"
sentry-cli releases finalize "$VERSION"

# remove source maps so we don't leak them to the client
echo "Removing sourcemaps"

rm -v ./public/**/*.map
