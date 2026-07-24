# syntax=docker/dockerfile:1

FROM php:8.3-apache-bookworm AS php-base

ENV TZ=Asia/Shanghai \
    APACHE_DOCUMENT_ROOT=/var/www/html/public \
    COMPOSER_ALLOW_SUPERUSER=1 \
    COMPOSER_NO_INTERACTION=1

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        libfreetype6-dev \
        libjpeg62-turbo-dev \
        libonig-dev \
        libpng-dev \
        libzip-dev \
        unzip \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j1 \
        bcmath \
        gd \
        mbstring \
        mysqli \
        opcache \
        pdo_mysql \
        zip \
    && a2enmod rewrite headers expires \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html

FROM php-base AS build

ARG COMPOSER_REPOSITORY_URL=https://mirrors.tencent.com/composer/

COPY --from=composer:2.8 /usr/bin/composer /usr/local/bin/composer
COPY composer.json composer.lock ./

RUN composer config --global repos.packagist composer "${COMPOSER_REPOSITORY_URL}" \
    && composer install \
        --no-dev \
        --prefer-dist \
        --no-progress \
        --no-interaction \
        --no-scripts \
        --optimize-autoloader

COPY . /var/www/html

RUN mkdir -p runtime/cache runtime/log runtime/storage runtime/pem public/uploads public/phpExcel \
    && composer dump-autoload --no-dev --optimize --no-interaction \
    && composer check-platform-reqs --no-dev

FROM php-base AS runtime

COPY --from=build /var/www/html /var/www/html
COPY deploy/cloudrun/apache-vhost.conf /etc/apache2/sites-available/000-default.conf
COPY deploy/cloudrun/php.ini /usr/local/etc/php/conf.d/99-cloudrun.ini

RUN mkdir -p runtime/cache runtime/log runtime/storage runtime/pem public/uploads public/phpExcel \
    && chown -R www-data:www-data runtime public/uploads public/phpExcel \
    && find runtime public/uploads public/phpExcel -type d -exec chmod 775 {} \;

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl --fail --silent --show-error http://127.0.0.1/api/index > /dev/null || exit 1

CMD ["apache2-foreground"]
