<?php
if (!defined('ABSPATH')) { exit; }

function cptui_register_alkana_projects() {
    $labels = [
        'name' => __('Projects', 'alkana'),
        'singular_name' => __('Project', 'alkana'),
    ];
    $args = [
        'labels' => $labels,
        'public' => true,
        'has_archive' => true,
        'menu_icon' => 'dashicons-portfolio',
        'supports' => ['title', 'editor', 'thumbnail', 'excerpt'],
        'rewrite' => ['slug' => 'projects'],
        'show_in_rest' => true,
    ];
    register_post_type('project', $args);
}
add_action('init', 'cptui_register_alkana_projects');
