FROM php:8.3-apache-bookworm

ENV TZ=Asia/Shanghai \
    APACHE_DOCUMENT_ROOT=/var/www/html/public

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        curl \
        libcurl4-openssl-dev \
        libfreetype6-dev \
        libjpeg62-turbo-dev \
        libonig-dev \
        libpng-dev \
        libxml2-dev \
        libzip-dev \
        unzip \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" \
        bcmath \
        curl \
        dom \
        gd \
        mbstring \
        mysqli \
        opcache \
        pdo_mysql \
        simplexml \
        xml \
        xmlreader \
        xmlwriter \
        zip \
    && pecl install redis-6.0.2 \
    && docker-php-ext-enable redis \
    && a2enmod rewrite headers expires \
    && rm -rf /var/lib/apt/lists/* /tmp/pear

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
