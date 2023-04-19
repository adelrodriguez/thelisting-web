export SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN
export SENTRY_ORG=thelisting
export SENTRY_PROJECT=app

VERSION=$RAILWAY_GIT_COMMIT_SHA

echo "Uploading sourcemaps to Sentry"

sentry-cli releases new "$VERSION"
sentry-cli releases set-commits --auto "$VERSION"

echo "Uploading server sourcemaps"

sentry-cli releases files "$VERSION" upload-sourcemaps ./build --url-prefix "/app/build" --ignore node_modules --ignore public

echo "Uploading client sourcemaps"

sentry-cli releases files "$VERSION" upload-sourcemaps ./public --url-prefix "~/" --dist "client"

sentry-cli releases finalize "$VERSION"

# Delete sourcemaps
echo "Deleting sourcemaps"

find ./public/build -type f -name '*.map' -delete
find ./build -type f -name '*.map' -delete
