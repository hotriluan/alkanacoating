<?php
// Theme setup and performance-conscious enqueues

if (!defined('ALKANA_THEME_VERSION')) {
    define('ALKANA_THEME_VERSION', '0.1.0');
}

add_action('after_setup_theme', function () {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('responsive-embeds');
    add_theme_support('editor-styles');
    add_theme_support('html5', ['search-form', 'gallery', 'caption', 'style', 'script']);

    // WooCommerce styling compatibility
    add_theme_support('woocommerce');

    register_nav_menus([
        'primary' => __('Primary Menu', 'alkana'),
        'footer'  => __('Footer Menu', 'alkana'),
    ]);
});

add_action('wp_enqueue_scripts', function () {
    $theme_uri = get_template_directory_uri();
    $style_path = get_template_directory() . '/assets/css/main.css';
    $script_path = get_template_directory() . '/assets/js/main.js';

    $style_ver = file_exists($style_path) ? filemtime($style_path) : ALKANA_THEME_VERSION;
    $script_ver = file_exists($script_path) ? filemtime($script_path) : ALKANA_THEME_VERSION;

    wp_enqueue_style('alkana-main', $theme_uri . '/assets/css/main.css', [], $style_ver);

    // Enqueue vanilla JS, defer by filter below
    wp_enqueue_script('alkana-main', $theme_uri . '/assets/js/main.js', [], $script_ver, true);
}, 20);

// Add defer to our scripts (avoid jQuery)
add_filter('script_loader_tag', function ($tag, $handle, $src) {
    $no_defer = ['jquery-core', 'jquery', 'jquery-migrate'];
    if (in_array($handle, $no_defer, true)) {
        return $tag;
    }
    if (strpos($tag, ' src=') !== false) {
        $tag = str_replace('<script ', '<script defer ', $tag);
    }
    return $tag;
}, 10, 3);

// Editor styles
add_action('after_setup_theme', function () {
    add_editor_style('assets/css/main.css');
});

// Tweak image sizes for performance
add_filter('big_image_size_threshold', function () { return 2560; });
add_filter('intermediate_image_sizes_advanced', function ($sizes) {
    // Keep common sizes; remove very large sizes to save space
    unset($sizes['1536x1536'], $sizes['2048x2048']);
    return $sizes;
});
