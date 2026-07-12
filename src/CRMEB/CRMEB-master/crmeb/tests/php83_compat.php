<?php

declare(strict_types=1);

$root = dirname(__DIR__);
$requiredExtensions = [
    'bcmath',
    'curl',
    'gd',
    'intl',
    'json',
    'mbstring',
    'mysqli',
    'pdo_mysql',
    'redis',
    'simplexml',
    'xml',
    'zip',
];

$missingExtensions = array_values(array_filter(
    $requiredExtensions,
    static function (string $extension): bool {
        return !extension_loaded($extension);
    }
));

if ($missingExtensions) {
    fwrite(STDERR, 'Missing PHP extensions: ' . implode(', ', $missingExtensions) . PHP_EOL);
    exit(1);
}

$directories = ['app', 'crmeb', 'config', 'route'];
$checked = 0;
$failures = [];

foreach ($directories as $directory) {
    $path = $root . DIRECTORY_SEPARATOR . $directory;
    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($path, FilesystemIterator::SKIP_DOTS)
    );

    foreach ($iterator as $file) {
        if (!$file->isFile() || strtolower($file->getExtension()) !== 'php') {
            continue;
        }

        $output = [];
        $exitCode = 0;
        exec(PHP_BINARY . ' -l ' . escapeshellarg($file->getPathname()) . ' 2>&1', $output, $exitCode);
        $checked++;
        if ($exitCode !== 0) {
            $failures[] = implode(PHP_EOL, $output);
        }
    }
}

if ($failures) {
    fwrite(STDERR, implode(PHP_EOL . PHP_EOL, $failures) . PHP_EOL);
    exit(1);
}

echo sprintf(
    "PHP %s compatibility syntax check passed (%d files, %d required extensions).%s",
    PHP_VERSION,
    $checked,
    count($requiredExtensions),
    PHP_EOL
);
