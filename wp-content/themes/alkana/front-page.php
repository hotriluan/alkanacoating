<?php get_header(); ?>
<main id="content" class="container">
  <?php if (have_posts()): while (have_posts()): the_post(); ?>
    <article <?php post_class('front-page'); ?>>
      <h1 class="page-title"><?php the_title(); ?></h1>
      <div class="entry">
        <?php the_content(); ?>
      </div>
    </article>
  <?php endwhile; else: ?>
    <p><?php esc_html_e('No content yet. Create your homepage content.', 'alkana'); ?></p>
  <?php endif; ?>
</main>
<?php get_footer(); ?>
