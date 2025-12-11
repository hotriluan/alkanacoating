<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Google Analytics Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your Google Analytics settings. You can get these
    | values from your Google Analytics account.
    |
    */

    'property_id' => env('GOOGLE_ANALYTICS_PROPERTY_ID'),

    'service_account_credentials_json' => storage_path('app/analytics/service-account-credentials.json'),
];
