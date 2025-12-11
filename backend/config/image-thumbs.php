<?php

return [
    // Sizes are [width, height]
    'sizes' => [
        'small' => [40, 40],
        'medium' => [160, 160],
    ],

    // JPEG/WebP quality (0-100)
    'quality' => 85,

    // Whether to also create WebP versions alongside JPEG thumbnails
    'generate_webp' => env('THUMBS_GENERATE_WEBP', false),
];
