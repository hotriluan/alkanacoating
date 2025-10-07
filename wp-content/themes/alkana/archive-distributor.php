<?php /* Template for Distributors archive */ get_header(); ?>
<main id="content" class="container">
  <header class="archive-header">
    <h1><?php esc_html_e('Distributors', 'alkana'); ?></h1>
    <form method="get" class="filters" style="display:flex; gap:12px; align-items:end; margin:12px 0;">
      <label>
        <span><?php esc_html_e('Application', 'alkana'); ?></span>
        <?php wp_dropdown_categories(['show_option_all'=>__('All','alkana'),'taxonomy'=>'application','name'=>'application','value_field'=>'slug','selected'=>get_query_var('application'),'hide_empty'=>false]); ?>
      </label>
      <label>
        <span><?php esc_html_e('Substrate', 'alkana'); ?></span>
        <?php wp_dropdown_categories(['show_option_all'=>__('All','alkana'),'taxonomy'=>'substrate','name'=>'substrate','value_field'=>'slug','selected'=>get_query_var('substrate'),'hide_empty'=>false]); ?>
      </label>
      <button type="submit" class="button"><?php esc_html_e('Filter', 'alkana'); ?></button>
    </form>
  </header>
  <?php if (have_posts()): ?>
    <div class="grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(260px,1fr)); gap:20px;">
      <?php while (have_posts()): the_post(); get_template_part('template-parts/content','card'); endwhile; ?>
    </div>
    <?php the_posts_pagination(); ?>
  <?php else: ?>
    <p><?php esc_html_e('No distributors found.', 'alkana'); ?></p>
  <?php endif; ?>
</main>
<?php get_footer(); ?>
