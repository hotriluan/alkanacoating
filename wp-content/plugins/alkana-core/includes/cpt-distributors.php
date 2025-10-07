<?php
if (!defined('ABSPATH')) { exit; }

function cptui_register_alkana_distributors() {
    $labels = [
        'name' => __('Distributors', 'alkana'),
        'singular_name' => __('Distributor', 'alkana'),
    ];
    $args = [
        'labels' => $labels,
        'public' => true,
        'has_archive' => true,
        'menu_icon' => 'dashicons-store',
        'supports' => ['title', 'editor', 'thumbnail', 'excerpt'],
        'rewrite' => ['slug' => 'distributors'],
        'show_in_rest' => true,
    ];
    register_post_type('distributor', $args);
}
add_action('init', 'cptui_register_alkana_distributors');
