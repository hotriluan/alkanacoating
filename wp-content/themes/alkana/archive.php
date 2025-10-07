<?php get_header(); ?>
<main id="content" class="container">
  <header class="archive-header">
    <h1 class="archive-title"><?php the_archive_title(); ?></h1>
    <?php the_archive_description('<div class="archive-description">','</div>'); ?>
  </header>
  <?php if (have_posts()): ?>
    <div class="posts-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(260px,1fr)); gap:20px;">
      <?php while (have_posts()): the_post(); ?>
        <?php get_template_part('template-parts/content', 'card'); ?>
      <?php endwhile; ?>
    </div>
    <div class="pagination" style="margin-top:24px; display:flex; gap:12px;">
      <?php the_posts_pagination(['mid_size'=>1]); ?>
    </div>
  <?php else: ?>
    <p><?php esc_html_e('Nothing found.', 'alkana'); ?></p>
  <?php endif; ?>
</main>
<?php get_footer(); ?>
