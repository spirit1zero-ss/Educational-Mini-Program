<?php
// Safe, local runtime checks only. No application boot, secrets, DB or exploit payloads.
if (PHP_VERSION !== '8.3.36') {
    fwrite(STDERR, 'Unexpected PHP version: ' . PHP_VERSION . PHP_EOL);
    exit(1);
}
foreach (['bcmath', 'gd', 'mysqli', 'Zend OPcache', 'pdo_mysql', 'zip', 'redis', 'mbstring', 'openssl', 'session'] as $extension) {
    if (!extension_loaded($extension)) {
        fwrite(STDERR, 'Missing PHP extension: ' . $extension . PHP_EOL);
        exit(1);
    }
}
if (phpversion('redis') !== '6.0.2') {
    fwrite(STDERR, 'Unexpected Redis extension version' . PHP_EOL);
    exit(1);
}
echo 'PASS: PHP 8.3.36 and required extensions' . PHP_EOL;
