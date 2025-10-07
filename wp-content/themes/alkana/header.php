<!doctype html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo('charset'); ?>" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php if ( function_exists( 'wp_body_open' ) ) { wp_body_open(); } ?>
<a class="skip-link screen-reader-text" href="#content"><?php esc_html_e('Skip to content', 'alkana'); ?></a>
<header class="site-header">
  <div class="container" style="display:flex; align-items:center; gap:24px; padding:12px 0;">
    <div class="site-branding">
      <a href="<?php echo esc_url(home_url('/')); ?>" class="site-title" style="font-weight:700; font-size:20px; color:#111;">
        <?php bloginfo('name'); ?>
      </a>
    </div>
    <button class="menu-toggle" data-toggle="primary-menu" aria-expanded="false" aria-controls="primary-menu" style="margin-left:auto;display:none;">
      <span><?php esc_html_e('Menu', 'alkana'); ?></span>
    </button>
    <nav class="site-nav" aria-label="Primary">
      <?php wp_nav_menu(['theme_location' => 'primary', 'container' => false, 'fallback_cb' => '__return_empty_string']); ?>
    </nav>
  </div>
</header>
