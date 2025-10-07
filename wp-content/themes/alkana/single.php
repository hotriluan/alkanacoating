<?php get_header(); ?>
<main id="content" class="container">
  <?php if (have_posts()): while (have_posts()): the_post(); ?>
    <?php get_template_part('template-parts/content', get_post_type()); ?>
    <nav class="post-nav" style="display:flex; justify-content:space-between; margin-top:24px;">
      <div class="prev"><?php previous_post_link('%link', '&larr; %title'); ?></div>
      <div class="next"><?php next_post_link('%link', '%title &rarr;'); ?></div>
    </nav>
    <?php if (comments_open() || get_comments_number()) comments_template(); ?>
  <?php endwhile; endif; ?>
</main>
<?php get_footer(); ?>
