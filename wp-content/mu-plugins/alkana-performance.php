<?php
/**
 * Plugin Name: Alkana Performance (MU)
 * Description: Must-use performance optimizations for WordPress.
 */

if (!defined('ABSPATH')) { exit; }

// --- Toggle flags (set to true to enable more aggressive behavior) ---
if (!defined('ALKANA_DISABLE_EMOJI')) define('ALKANA_DISABLE_EMOJI', true);
if (!defined('ALKANA_DISABLE_EMBEDS')) define('ALKANA_DISABLE_EMBEDS', true);
if (!defined('ALKANA_CLEAN_HEAD')) define('ALKANA_CLEAN_HEAD', true);
if (!defined('ALKANA_DEQUEUE_EMBED_SCRIPT')) define('ALKANA_DEQUEUE_EMBED_SCRIPT', true);
if (!defined('ALKANA_TAME_HEARTBEAT')) define('ALKANA_TAME_HEARTBEAT', true);
if (!defined('ALKANA_REMOVE_JQUERY_MIGRATE')) define('ALKANA_REMOVE_JQUERY_MIGRATE', true);

// Disable emojis
if (ALKANA_DISABLE_EMOJI) {
    remove_action('wp_head', 'print_emoji_detection_script', 7);
    remove_action('wp_print_styles', 'print_emoji_styles');
    remove_action('admin_print_scripts', 'print_emoji_detection_script');
    remove_action('admin_print_styles', 'print_emoji_styles');
    remove_filter('the_content_feed', 'wp_staticize_emoji');
    remove_filter('comment_text_rss', 'wp_staticize_emoji');
    remove_filter('wp_mail', 'wp_staticize_emoji_for_email');
}

// Disable embeds
if (ALKANA_DISABLE_EMBEDS) {
    remove_action('rest_api_init', 'wp_oembed_register_route');
    add_filter('embed_oembed_discover', '__return_false');
    remove_filter('oembed_dataparse', 'wp_filter_oembed_result', 10);
    remove_action('wp_head', 'wp_oembed_add_discovery_links');
    remove_action('wp_head', 'wp_oembed_add_host_js');
}

// Clean up head
if (ALKANA_CLEAN_HEAD) {
    remove_action('wp_head', 'rsd_link');
    remove_action('wp_head', 'wlwmanifest_link');
    remove_action('wp_head', 'wp_generator');
    remove_action('wp_head', 'rest_output_link_wp_head');
    remove_action('wp_head', 'wp_shortlink_wp_head');
    remove_action('template_redirect', 'rest_output_link_header', 11);
}

// Dequeue wp-embed
if (ALKANA_DEQUEUE_EMBED_SCRIPT) {
    add_action('wp_footer', function(){
        wp_deregister_script('wp-embed');
    }, 1);
}

// Tame heartbeat
if (ALKANA_TAME_HEARTBEAT) {
    add_filter('heartbeat_settings', function($settings){
        $settings['interval'] = 60; // default 15
        return $settings;
    });
    add_action('init', function(){
        if (!is_admin()) {
            wp_deregister_script('heartbeat');
        }
    }, 1);
}

// Remove jQuery Migrate on frontend
if (ALKANA_REMOVE_JQUERY_MIGRATE) {
    add_action('wp_default_scripts', function($scripts){
        if (!is_admin() && isset($scripts->registered['jquery'])) {
            $deps = $scripts->registered['jquery']->deps;
            $scripts->registered['jquery']->deps = array_diff($deps, ['jquery-migrate']);
        }
    });
}

// Force lazyloading of images (WP default is already lazy)
add_filter('wp_lazy_loading_enabled', '__return_true');
