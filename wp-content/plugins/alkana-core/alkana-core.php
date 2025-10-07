<?php
/**
 * Plugin Name: Alkana Core
 * Description: Core functionality for Alkana Coating (CPTs, taxonomies, performance helpers).
 * Version: 0.1.0
 * Author: Alkana
 * Text Domain: alkana
 */

if (!defined('ABSPATH')) { exit; }

// Autoload includes
require_once __DIR__ . '/includes/cpt-projects.php';
require_once __DIR__ . '/includes/cpt-distributors.php';
require_once __DIR__ . '/includes/taxonomies.php';

register_activation_hook(__FILE__, function(){
    // Ensure permalinks for CPTs work after activation
    cptui_register_alkana_projects();
    cptui_register_alkana_distributors();
    alkana_register_taxonomies();
    flush_rewrite_rules();
});

register_deactivation_hook(__FILE__, function(){
    flush_rewrite_rules();
});
