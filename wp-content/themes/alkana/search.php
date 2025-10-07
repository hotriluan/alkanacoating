<?php get_header(); ?>
<main id="content" class="container">
  <header>
    <h1><?php printf(esc_html__('Search results for: %s', 'alkana'), get_search_query()); ?></h1>
    <?php get_search_form(); ?>
  </header>
  <?php if (have_posts()): ?>
    <ul class="search-results" style="display:grid; gap:16px;">
      <?php while (have_posts()): the_post(); ?>
      <li>
        <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
        <div class="excerpt"><?php the_excerpt(); ?></div>
      </li>
      <?php endwhile; ?>
    </ul>
    <?php the_posts_pagination(); ?>
  <?php else: ?>
    <p><?php esc_html_e('No results found. Try another search.', 'alkana'); ?></p>
  <?php endif; ?>
</main>
<?php get_footer(); ?>
