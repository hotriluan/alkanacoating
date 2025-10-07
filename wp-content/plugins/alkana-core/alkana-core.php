<?php
/**
 * Plugin Name: Alkana Core
 * Description: Core functionality for Alkana Coating (CPTs, taxonomies, performance helpers).
 * Version: 0.1.0
 * Author: Alkana
 * Text Domain: alkana
 */

if (!defined('ABSPATH')) { exit; }

// Autoload includes
require_once __DIR__ . '/includes/cpt-projects.php';
require_once __DIR__ . '/includes/cpt-distributors.php';
require_once __DIR__ . '/includes/taxonomies.php';

register_activation_hook(__FILE__, function(){
    // Ensure permalinks for CPTs work after activation
    cptui_register_alkana_projects();
    cptui_register_alkana_distributors();
    alkana_register_taxonomies();
    flush_rewrite_rules();

    // Seed essential pages if missing
    $pages = [
        'home' => ['title' => __('Home','alkana'), 'content' => "[alkana_contact_form]"],
        'about' => ['title' => __('About','alkana'), 'content' => ''],
        'products' => ['title' => __('Products','alkana'), 'content' => ''],
        'projects' => ['title' => __('Projects','alkana'), 'content' => ''],
        'distributors' => ['title' => __('Distributors','alkana'), 'content' => ''],
        'contact' => ['title' => __('Contact','alkana'), 'content' => '[alkana_contact_form]'],
    ];
    $created_ids = [];
    foreach ($pages as $slug => $data) {
        $existing = get_page_by_path($slug);
        if (!$existing) {
            $id = wp_insert_post([
                'post_title' => $data['title'],
                'post_name' => $slug,
                'post_status' => 'publish',
                'post_type' => 'page',
                'post_content' => $data['content'],
            ]);
            if (!is_wp_error($id)) $created_ids[$slug] = $id;
        }
    }
    // Optionally set a static front page if 'home' exists
    $home_page = get_page_by_path('home');
    if ($home_page) {
        update_option('show_on_front', 'page');
        update_option('page_on_front', $home_page->ID);
    }
});

register_deactivation_hook(__FILE__, function(){
    flush_rewrite_rules();
});

// Register custom meta for CPTs (REST-visible)
add_action('init', function() {
    // Project fields
    foreach ([
        'alkana_project_client' => 'string',
        'alkana_project_location' => 'string',
        'alkana_project_year' => 'string',
        'alkana_project_gallery' => 'string',
    ] as $key => $type) {
        register_post_meta('project', $key, [
            'show_in_rest' => true,
            'single' => true,
            'type' => $type,
            'auth_callback' => function() { return current_user_can('edit_posts'); }
        ]);
    }

    // Distributor fields
    foreach ([
        'alkana_distributor_address' => 'string',
        'alkana_distributor_phone' => 'string',
        'alkana_distributor_email' => 'string',
        'alkana_distributor_map' => 'string',
    ] as $key => $type) {
        register_post_meta('distributor', $key, [
            'show_in_rest' => true,
            'single' => true,
            'type' => $type,
            'auth_callback' => function() { return current_user_can('edit_posts'); }
        ]);
    }
});

// Simple contact form shortcode: [alkana_contact_form]
add_shortcode('alkana_contact_form', function($atts) {
        $atts = shortcode_atts([
                'to' => get_option('admin_email'),
                'subject' => __('New contact message','alkana'),
        ], $atts, 'alkana_contact_form');

        $errors = [];
        $success = false;

        if ('POST' === $_SERVER['REQUEST_METHOD'] && isset($_POST['alkana_cf_nonce']) && wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['alkana_cf_nonce'])), 'alkana_cf')) {
                $name = isset($_POST['name']) ? sanitize_text_field(wp_unslash($_POST['name'])) : '';
                $email = isset($_POST['email']) ? sanitize_email(wp_unslash($_POST['email'])) : '';
                $message = isset($_POST['message']) ? wp_strip_all_tags(wp_unslash($_POST['message'])) : '';

                if ($name === '') $errors['name'] = __('Please enter your name','alkana');
                if (!is_email($email)) $errors['email'] = __('Please enter a valid email','alkana');
                if ($message === '') $errors['message'] = __('Please enter a message','alkana');

                if (empty($errors)) {
                        $headers = ['Reply-To: ' . $name . ' <' . $email . '>', 'Content-Type: text/plain; charset=UTF-8'];
                        $body = "Name: $name\nEmail: $email\n\n$message";
                        $sent = wp_mail($atts['to'], $atts['subject'], $body, $headers);
                        if ($sent) {
                                $success = true;
                        } else {
                                $errors['send'] = __('There was a problem sending your message. Please try again later.','alkana');
                        }
                }
        }

        ob_start();
        if ($success) {
                echo '<div class="notice success">'.esc_html__('Thank you. Your message has been sent.','alkana').'</div>';
        }
        if (!empty($errors)) {
                echo '<div class="notice error">'.esc_html__('Please fix the errors below.','alkana').'</div>';
        }
        ?>
        <form class="alkana-contact-form" method="post">
            <p>
                <label><?php echo esc_html__('Name','alkana'); ?>
                    <input type="text" name="name" value="<?php echo isset($name)?esc_attr($name):''; ?>" required />
                </label>
                <?php if (!empty($errors['name'])) echo '<span class="field-error">'.esc_html($errors['name']).'</span>'; ?>
            </p>
            <p>
                <label><?php echo esc_html__('Email','alkana'); ?>
                    <input type="email" name="email" value="<?php echo isset($email)?esc_attr($email):''; ?>" required />
                </label>
                <?php if (!empty($errors['email'])) echo '<span class="field-error">'.esc_html($errors['email']).'</span>'; ?>
            </p>
            <p>
                <label><?php echo esc_html__('Message','alkana'); ?>
                    <textarea name="message" rows="5" required><?php echo isset($message)?esc_textarea($message):''; ?></textarea>
                </label>
                <?php if (!empty($errors['message'])) echo '<span class="field-error">'.esc_html($errors['message']).'</span>'; ?>
            </p>
            <?php wp_nonce_field('alkana_cf','alkana_cf_nonce'); ?>
            <p><button type="submit" class="button"><?php echo esc_html__('Send','alkana'); ?></button></p>
        </form>
        <?php
        return ob_get_clean();
});

// Admin metaboxes
add_action('add_meta_boxes', function() {
    add_meta_box('alkana_project_details', __('Project Details','alkana'), 'alkana_render_project_metabox', 'project', 'normal', 'high');
    add_meta_box('alkana_distributor_details', __('Distributor Details','alkana'), 'alkana_render_distributor_metabox', 'distributor', 'normal', 'high');
});

function alkana_render_project_metabox($post) {
    wp_nonce_field('alkana_save_project_meta', 'alkana_project_nonce');
    $client = get_post_meta($post->ID, 'alkana_project_client', true);
    $location = get_post_meta($post->ID, 'alkana_project_location', true);
    $year = get_post_meta($post->ID, 'alkana_project_year', true);
    $gallery = get_post_meta($post->ID, 'alkana_project_gallery', true);
    echo '<p><label>'.esc_html__('Client','alkana').'<br/>';
    echo '<input type="text" name="alkana_project_client" class="widefat" value="'.esc_attr($client).'" /></label></p>';
    echo '<p><label>'.esc_html__('Location','alkana').'<br/>';
    echo '<input type="text" name="alkana_project_location" class="widefat" value="'.esc_attr($location).'" /></label></p>';
    echo '<p><label>'.esc_html__('Year','alkana').'<br/>';
    echo '<input type="text" name="alkana_project_year" class="widefat" value="'.esc_attr($year).'" placeholder="2024" /></label></p>';
    echo '<p><label>'.esc_html__('Gallery attachment IDs (comma separated)','alkana').'<br/>';
    echo '<input type="text" name="alkana_project_gallery" class="widefat" value="'.esc_attr($gallery).'" placeholder="12,34,56" /></label></p>';
}

function alkana_render_distributor_metabox($post) {
    wp_nonce_field('alkana_save_distributor_meta', 'alkana_distributor_nonce');
    $address = get_post_meta($post->ID, 'alkana_distributor_address', true);
    $phone = get_post_meta($post->ID, 'alkana_distributor_phone', true);
    $email = get_post_meta($post->ID, 'alkana_distributor_email', true);
    $map = get_post_meta($post->ID, 'alkana_distributor_map', true);
    echo '<p><label>'.esc_html__('Address','alkana').'<br/>';
    echo '<textarea name="alkana_distributor_address" class="widefat" rows="3">'.esc_textarea($address).'</textarea></label></p>';
    echo '<p><label>'.esc_html__('Phone','alkana').'<br/>';
    echo '<input type="text" name="alkana_distributor_phone" class="widefat" value="'.esc_attr($phone).'" /></label></p>';
    echo '<p><label>'.esc_html__('Email','alkana').'<br/>';
    echo '<input type="email" name="alkana_distributor_email" class="widefat" value="'.esc_attr($email).'" /></label></p>';
    echo '<p><label>'.esc_html__('Google Map URL','alkana').'<br/>';
    echo '<input type="url" name="alkana_distributor_map" class="widefat" value="'.esc_attr($map).'" placeholder="https://maps.google.com/..." /></label></p>';
}

add_action('save_post_project', function($post_id){
    if (!isset($_POST['alkana_project_nonce']) || !wp_verify_nonce($_POST['alkana_project_nonce'], 'alkana_save_project_meta')) return;
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!current_user_can('edit_post', $post_id)) return;
    foreach (['alkana_project_client','alkana_project_location','alkana_project_year','alkana_project_gallery'] as $f) {
        if (isset($_POST[$f])) update_post_meta($post_id, $f, sanitize_text_field(wp_unslash($_POST[$f])));
    }
});

add_action('save_post_distributor', function($post_id){
    if (!isset($_POST['alkana_distributor_nonce']) || !wp_verify_nonce($_POST['alkana_distributor_nonce'], 'alkana_save_distributor_meta')) return;
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!current_user_can('edit_post', $post_id)) return;
    $map = isset($_POST['alkana_distributor_map']) ? esc_url_raw(wp_unslash($_POST['alkana_distributor_map'])) : '';
    update_post_meta($post_id, 'alkana_distributor_map', $map);
    foreach (['alkana_distributor_address','alkana_distributor_phone','alkana_distributor_email'] as $f) {
        if (isset($_POST[$f])) update_post_meta($post_id, $f, sanitize_text_field(wp_unslash($_POST[$f])));
    }
});
