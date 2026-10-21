# Vendored phpredis 6.0.2 source

Official upstream: https://github.com/phpredis/phpredis
Release: https://github.com/phpredis/phpredis/releases/tag/6.0.2
Tag 6.0.2 resolves to commit: 62cf943fecc5182c6329b332df43cf28012cef55
Archive downloaded unchanged from:
https://codeload.github.com/phpredis/phpredis/tar.gz/62cf943fecc5182c6329b332df43cf28012cef55
Saved locally as: phpredis-6.0.2.tar.gz
SHA-256: 5db21869c88b61bf0e6db07863602353f02506f4a2b38f60c8fc9ba9c15050b4

The checksum was calculated from the downloaded official archive and is pinned in the Dockerfile; it is not claimed to be a separately signed upstream checksum. The archive includes the upstream LICENSE and INSTALL.md unchanged. Its php_redis.h declares PHP_REDIS_VERSION 6.0.2. Build-time SHA-256 validation occurs before extraction or compilation.

Vendoring removes the failed PECL download from the Tencent build path. No runtime Redis server is installed or started. Existing application cache/session/queue/environment settings remain unchanged. Compilation uses the release defaults, as the previous noninteractive PECL installation did.
