<?php /* Template for single Distributor */ get_header(); ?>
<main id="content" class="container">
  <?php if (have_posts()): while (have_posts()): the_post(); ?>
    <article <?php post_class('single-distributor'); ?>>
      <header>
        <h1 class="entry-title"><?php the_title(); ?></h1>
        <div class="terms" style="color:#666;">
          <?php echo get_the_term_list(get_the_ID(), 'application', '<span class="term">', ', ', '</span>'); ?>
          <?php echo get_the_term_list(get_the_ID(), 'substrate', ' | <span class="term">', ', ', '</span>'); ?>
        </div>
      </header>
      <div class="entry-content">
        <?php the_content(); ?>
      </div>
    </article>
  <?php endwhile; endif; ?>
</main>
<?php get_footer(); ?>
