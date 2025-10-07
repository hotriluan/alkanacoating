<article <?php post_class('card'); ?>>
  <a href="<?php the_permalink(); ?>" class="card-link" style="display:block; text-decoration:none; color:inherit;">
    <?php if (has_post_thumbnail()) : ?>
      <figure class="card-media" style="margin:0 0 8px 0;">
        <?php the_post_thumbnail('medium_large', ['style' => 'width:100%;height:auto;display:block;']); ?>
      </figure>
    <?php endif; ?>
    <h2 class="card-title" style="font-size:18px; line-height:1.3; margin:0 0 6px; "><?php the_title(); ?></h2>
    <div class="card-excerpt" style="color:#555; font-size:14px;">
      <?php the_excerpt(); ?>
    </div>
  </a>
</article>
