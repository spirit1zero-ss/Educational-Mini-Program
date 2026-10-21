#!/bin/sh
# Run only in an isolated Docker test environment. Does not deploy or contact production.
set -eu
script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
app_dir=$(CDPATH= cd -- "$script_dir/../.." && pwd)
cd "$app_dir"
image=${1:-education-php-security:local}
command -v docker >/dev/null 2>&1 || { echo 'BLOCKED: Docker is not installed' >&2; exit 2; }
# Do not accidentally build/run on a remote or production Docker context.
if [ -n "${DOCKER_CONTEXT:-}" ] || [ -z "${DOCKER_HOST:-}" ]; then
    endpoint=$(docker context inspect --format '{{.Endpoints.docker.Host}}')
else
    endpoint=$DOCKER_HOST
fi
case "$endpoint" in
    unix://*) ;;
    *) echo "BLOCKED: requires a local Unix-socket Docker daemon, not $endpoint" >&2; exit 2 ;;
esac
docker info >/dev/null
docker build --pull -t "$image" .
docker run --rm --network none "$image" php /usr/local/bin/verify-php-runtime.php
docker run --rm --network none "$image" apache2ctl -t
docker run --rm --network none "$image" sh -ec 'apache2ctl -M 2>/dev/null | grep -q php_module'
# Check mod_php itself, without starting CRMEB or using DB/Redis credentials.
probe_dir=$(mktemp -d)
container=''
cleanup() {
    if [ -n "$container" ]; then docker rm -f "$container" >/dev/null 2>&1 || :; fi
    rm -rf "$probe_dir"
}
trap cleanup EXIT HUP INT TERM
printf '%s\n' '<?php header("Content-Type: text/plain"); echo PHP_VERSION, "|", PHP_SAPI;' > "$probe_dir/index.php"
chmod 755 "$probe_dir"
chmod 644 "$probe_dir/index.php"
container=$(docker run -d --network none --health-cmd='exit 0' --mount "type=bind,src=$probe_dir,dst=/var/www/html/public,readonly" "$image")
count=0
until response=$(docker exec "$container" curl --fail --silent --connect-timeout 1 --max-time 2 http://127.0.0.1/index.php); do
    count=$((count + 1))
    [ "$count" -lt 30 ] || { docker logs "$container"; exit 1; }
    sleep 1
done
[ "$response" = '8.3.36|apache2handler' ] || { printf 'Unexpected Apache PHP result: %s\n' "$response" >&2; exit 1; }
echo 'PASS: PHP CLI, required extensions, Apache configuration/module and isolated HTTP mod_php smoke test'
echo 'NOT TESTED: application login, payment, uploads, database/Redis and production health check'
