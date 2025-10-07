<!doctype html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo('charset'); ?>" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<header class="site-header">
  <div class="container" style="display:flex; align-items:center; gap:24px; padding:12px 0;">
    <div class="site-branding">
      <a href="<?php echo esc_url(home_url('/')); ?>" class="site-title" style="font-weight:700; font-size:20px; color:#111;">
        <?php bloginfo('name'); ?>
      </a>
    </div>
    <nav class="site-nav" aria-label="Primary">
      <?php wp_nav_menu(['theme_location' => 'primary', 'container' => false, 'fallback_cb' => '__return_empty_string']); ?>
    </nav>
  </div>
</header>
