<?php
if (!defined('ABSPATH')) { exit; }

function alkana_register_taxonomies() {
    // Applications taxonomy (use-cases): attach to product (WooCommerce) and project
    $labels = [
        'name' => __('Applications', 'alkana'),
        'singular_name' => __('Application', 'alkana'),
    ];
    register_taxonomy('application', ['product', 'project'], [
        'labels' => $labels,
        'hierarchical' => true,
        'public' => true,
        'show_admin_column' => true,
        'rewrite' => ['slug' => 'application'],
        'show_in_rest' => true,
    ]);

    // Substrate taxonomy (surface types)
    $labels2 = [
        'name' => __('Substrates', 'alkana'),
        'singular_name' => __('Substrate', 'alkana'),
    ];
    register_taxonomy('substrate', ['product', 'project'], [
        'labels' => $labels2,
        'hierarchical' => true,
        'public' => true,
        'show_admin_column' => true,
        'rewrite' => ['slug' => 'substrate'],
        'show_in_rest' => true,
    ]);
}
add_action('init', 'alkana_register_taxonomies');
