<article <?php post_class('entry'); ?>>
  <header>
    <h1 class="entry-title"><?php the_title(); ?></h1>
    <time datetime="<?php echo esc_attr(get_the_date('c')); ?>"><?php echo esc_html(get_the_date()); ?></time>
  </header>
  <div class="entry-content">
    <?php the_content(); ?>
  </div>
</article>
