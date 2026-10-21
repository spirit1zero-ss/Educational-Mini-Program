# Official PHP 8.3.36 Apache/Bookworm image, pinned to a verified multi-platform digest.
# Runtime version and required extensions are checked during build and isolated CI.
FROM php:8.3.36-apache-bookworm@sha256:3bf3200166b7c3236ee7b33243c794f72c650980161bfb3c9ede9d94e2b04615

ENV TZ=Asia/Shanghai \
    APACHE_DOCUMENT_ROOT=/var/www/html/public

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        curl \
        libfreetype6-dev \
        libjpeg62-turbo-dev \
        libpng-dev \
        libzip-dev \
        unzip \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j1 \
        bcmath \
        gd \
        mysqli \
        opcache \
        pdo_mysql \
        zip

# Keep the existing Redis extension version without depending on PECL availability.
# This installs the PHP client extension only; it does not start Redis or change app drivers.
COPY deploy/cloudrun/redis-6.0.2/phpredis-6.0.2.tar.gz /tmp/phpredis-6.0.2.tar.gz
RUN set -eux; \
    echo '5db21869c88b61bf0e6db07863602353f02506f4a2b38f60c8fc9ba9c15050b4  /tmp/phpredis-6.0.2.tar.gz' | sha256sum -c -; \
    mkdir -p /tmp/phpredis; \
    tar -xzf /tmp/phpredis-6.0.2.tar.gz -C /tmp/phpredis --strip-components=1; \
    cd /tmp/phpredis; \
    phpize; \
    ./configure --enable-redis; \
    make -j1; \
    make install; \
    docker-php-ext-enable redis; \
    cd /; \
    rm -rf /tmp/phpredis /tmp/phpredis-6.0.2.tar.gz; \
    a2enmod rewrite headers expires; \
    rm -rf /var/lib/apt/lists/* /tmp/pear

# Fail closed: never publish a build with an unexpected PHP runtime or missing extensions.
COPY deploy/cloudrun/verify-php-runtime.php /usr/local/bin/verify-php-runtime.php
RUN php /usr/local/bin/verify-php-runtime.php

WORKDIR /var/www/html

COPY . /var/www/html
COPY deploy/cloudrun/apache-vhost.conf /etc/apache2/sites-available/000-default.conf
COPY deploy/cloudrun/php.ini /usr/local/etc/php/conf.d/99-cloudrun.ini

RUN mkdir -p runtime/cache runtime/log runtime/storage runtime/pem public/uploads public/phpExcel \
    && chown -R www-data:www-data runtime public/uploads public/phpExcel \
    && find runtime public/uploads public/phpExcel -type d -exec chmod 775 {} \;

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl --fail --silent --show-error http://127.0.0.1/api/index > /dev/null || exit 1

CMD ["apache2-foreground"]
