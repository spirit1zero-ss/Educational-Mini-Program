import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
const read = (path) => readFile(new URL(path, root), 'utf8')

const [dockerfile, dockerignore, composerSource, queueConfig] = await Promise.all([
  read('src/CRMEB/CRMEB-master/crmeb/Dockerfile'),
  read('src/CRMEB/CRMEB-master/crmeb/.dockerignore'),
  read('src/CRMEB/CRMEB-master/crmeb/composer.json'),
  read('src/CRMEB/CRMEB-master/crmeb/config/queue.php'),
])

const composer = JSON.parse(composerSource)

assert.match(dockerfile, /FROM php:8\.3-apache-bookworm AS php-base/)
assert.match(dockerfile, /FROM php-base AS build/)
assert.match(dockerfile, /FROM php-base AS runtime/)
assert.match(dockerfile, /COPY --from=composer:2\.8/)
assert.match(dockerfile, /COPY composer\.json composer\.lock/)
assert.match(dockerfile, /composer install/)
assert.match(dockerfile, /composer check-platform-reqs --no-dev/)
assert.match(dockerfile, /\bmbstring\b/)
assert.doesNotMatch(dockerfile, /pecl install redis/)

assert.match(dockerignore, /^vendor\/$/m)
assert.equal(composer.config['platform-check'], true)
assert.match(queueConfig, /Env::get\('queue\.driver', 'sync'\)/)

console.log('cloudrun dependency build contract checks passed')
