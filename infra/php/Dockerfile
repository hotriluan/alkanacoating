FROM php:8.3-fpm-alpine

RUN apk add --no-cache bash git unzip libpng-dev libjpeg-turbo-dev libwebp-dev libzip-dev oniguruma-dev icu-dev mariadb-connector-c-dev

# PHP extensions
RUN docker-php-ext-configure gd --with-jpeg --with-webp \
    && docker-php-ext-install pdo pdo_mysql mbstring zip intl gd

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Entrypoint to auto-create project if backend is empty
COPY init.sh /usr/local/bin/init.sh
RUN chmod +x /usr/local/bin/init.sh

ENTRYPOINT ["/usr/local/bin/init.sh"]
CMD ["php-fpm"]
