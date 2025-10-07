<?php /* Template for Substrate term */ get_header(); ?>
<main id="content" class="container">
  <header class="archive-header">
    <h1><?php single_term_title(); ?></h1>
    <?php the_archive_description('<div class="archive-description">','</div>'); ?>
  </header>
  <?php if (have_posts()): ?>
    <div class="grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(260px,1fr)); gap:20px;">
      <?php while (have_posts()): the_post(); get_template_part('template-parts/content','card'); endwhile; ?>
    </div>
    <?php the_posts_pagination(); ?>
  <?php else: ?>
    <p><?php esc_html_e('No items found for this substrate.', 'alkana'); ?></p>
  <?php endif; ?>
</main>
<?php get_footer(); ?>
