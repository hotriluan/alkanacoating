<?php get_header(); ?>
<main id="content" class="container">
  <h1>404</h1>
  <p><?php esc_html_e('Sorry, the page you are looking for could not be found.', 'alkana'); ?></p>
  <p><a href="<?php echo esc_url(home_url('/')); ?>" class="button"><?php esc_html_e('Go to Homepage', 'alkana'); ?></a></p>
</main>
<?php get_footer(); ?>
