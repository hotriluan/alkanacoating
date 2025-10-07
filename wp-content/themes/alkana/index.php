<?php get_header(); ?>
<main class="container">
  <?php if (have_posts()): while (have_posts()): the_post(); ?>
    <article <?php post_class(); ?>>
      <h1><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h1>
      <div class="entry">
        <?php the_excerpt(); ?>
      </div>
    </article>
  <?php endwhile; else: ?>
    <p><?php esc_html_e('No content found.', 'alkana'); ?></p>
  <?php endif; ?>
</main>
<?php get_footer(); ?>
