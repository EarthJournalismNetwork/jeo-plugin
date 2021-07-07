<?php

namespace Jeo;

class Maps {

	use Singleton;
	use Rest_Validate_Meta;

	public $post_type = 'map';

	protected function init() {
		add_action( 'init', [$this, 'register_post_type'] );
		add_action( 'init', [$this, 'register_shortcode'] );
		add_filter( 'single_template', [$this, 'override_template']);
		add_filter( 'the_content', [$this, 'the_content_filter'] );
		add_action('admin_init', [ $this, 'add_capabilities' ]);
		$this->register_rest_meta_validation();

	}

	public function register_post_type() {

		$labels = array(
			'name' => __('Maps', 'jeo'),
			'singular_name' => __('Map', 'jeo'),
			'add_new' => __('Add new map', 'jeo'),
			'add_new_item' => __('Add new map', 'jeo'),
			'edit_item' => __('Edit map', 'jeo'),
			'new_item' => __('New map', 'jeo'),
			'view_item' => __('View map', 'jeo'),
			'view_items' => __( 'View maps', 'jeo' ),
			'search_items' => __('Search maps', 'jeo'),
			'not_found' => __('No map found', 'jeo'),
			'not_found_in_trash' => __('No map found in the trash', 'jeo'),
			'menu_name' => __('Maps', 'jeo'),
			'item_published' => __('Map published.', 'jeo'),
			'item_published_privately' => __('Map published privately.', 'jeo'),
			'item_reverted_to_draft' => __('Map reverted to draft.', 'jeo'),
			'item_scheduled' => __('Map scheduled.', 'jeo'),
			'item_updated' => __('Map updated.', 'jeo'),
		);

		$args = array(
			'labels' => $labels,
			'hierarchical' => true,
			'description' => __('JEO Maps', 'jeo'),
			'supports' => array( 'title', 'editor', 'excerpt', 'thumbnail', 'page-attributes', 'custom-fields', 'newspack_blocks'),
			'rewrite' => array('slug' => 'maps'),
			'public' => true,
			'show_in_menu' => 'jeo-main-menu',
			'show_in_rest' => true,
			'menu_position' => 4,
			'menu_icon' => 'data:image/svg+xml;base64,' . base64_encode(file_get_contents(JEO_BASEPATH . '/js/src/icons/map.svg')),
			'has_archive' => true,
			'exclude_from_search' => true,
			'capabilities' => array(
				'edit_post' => 'edit_map',
				'edit_posts' => 'edit_maps',
				'edit_others_posts' => 'edit_others_maps',

				'publish_posts' => 'publish_maps',
				'read_post' => 'read_map',
				'read_private_posts' => 'read_private_maps',

				'delete_post' => 'delete_map',
			),
			// 'map_meta_cap' => true,
			// 'capability_type' => 'post',
		);

		register_post_type($this->post_type, $args);

		register_post_meta($this->post_type, 'initial_zoom', [
			'show_in_rest' => true,
			'single' => true,
			'auth_callback' => '__return_true',
			'sanitize_callback' => [$this, 'sanitize_meta_initial_zoom'],
			'type' => 'number',
			'description' => __('The map initial zoom level', 'jeo')
		]);

		register_post_meta($this->post_type, 'center_lat', [
			'show_in_rest' => true,
			'single' => true,
			'auth_callback' => '__return_true',
			'type' => 'number',
			'description' => __('The map initial latitude', 'jeo')
		]);

		register_post_meta($this->post_type, 'center_lon', [
			'show_in_rest' => true,
			'single' => true,
			'auth_callback' => '__return_true',
			'type' => 'number',
			'description' => __('The map initial longitude', 'jeo')
		]);

		register_post_meta($this->post_type, 'layers', [
			'show_in_rest'  => array(
				'schema' => array(
					'items' => [
						'type' => 'object',
						'properties' => [
							'id' => [
								'description' => __('The Layer ID', 'jeo'),
								'type' => 'integer'
							],
							'use' => [
								'description' => __('How this layer is used in this map. Can be fixed, switchable or swappable', 'jeo'),
								'type' => 'string'
							],
							'load_as_style' => [
								'description' => __('If the layer is loaded into the mapbox as a style (setStyle) or layer (addLayer)', 'jeo'),
								'type' => 'boolean'
							],
							'style_layers' => [
								'description' => __('Mapbox style layers', 'jeo'),
								'type' => 'array',
								'items' => array(
									'type' => 'object',
									'properties' => [
										'id' => [
											'description' => __('The Layer ID', 'jeo'),
											'type' => 'string'
										],
										'show' => [
											'description' => __('If the style should render the layer', 'jeo'),
											'type' => 'boolean'
										],
									]
								)
							],
							'default' => [
								'description' => __('Indicates whether this layer is visible by default', 'jeo'),
								'type' => 'boolean'
							],
							'show_legend' => [
								'description' => __('Indicates if the legend of this layer should be displayed or not', 'jeo'),
								'type' => 'boolean'
							]
						],
						'required' => [ 'id', 'use' ]
					],

				),
			),
			'single' => true,
			'auth_callback' => '__return_true',
			'type' => 'array',
			'description' => __('The map Layers', 'jeo')
		]);

		register_post_meta($this->post_type, 'pan_limits', [
			'show_in_rest'  => array(
				'schema' => array(
					'properties' => [
						'east' => [
							'description' => __('East pan limit', 'jeo'),
							'type' => 'number'
						],
						'north' => [
							'description' => __('North pan limit', 'jeo'),
							'type' => 'number'
						],
						'south' => [
							'description' => __('South pan limit', 'jeo'),
							'type' => 'number'
						],
						'west' => [
							'description' => __('West pan limit', 'jeo'),

							'type' => 'number'
						],
					]
				),
			),
			'single' => true,
			'auth_callback' => '__return_true',
			'type' => 'object',
			'description' => __('Map pan limits', 'jeo')
		]);

		register_post_meta($this->post_type, 'related_posts', [
			'show_in_rest' => [
				'schema' => [
					'properties' => [
						'categories' => [
							'description' => __('List of category IDs related posts must have', 'jeo'),
							'type' => 'array',
							'items' => [
								'type' => 'integer'
							]
						],
						'tags' => [
							'description' => __('List of tag IDs related posts must have', 'jeo'),
							'type' => 'array',
							'items' => [
								'type' => 'integer'
							]
						],
						'before' => [
							'description' => __('Maximum date for related posts', 'jeo'),
							'type' => 'string'
						],
						'after' => [
							'description' => __('Minimum date for related posts', 'jeo'),
							'type' => 'string'
						],
						'meta_query' => [
							'description' => __('List of meta values related posts must have', 'jeo'),
							'type' => 'array',
							'items' => [
								'type' => 'object',
								'properties' => [
									'key' => [
										'type' => 'string'
									],
									'compare' => [
										'type' => 'string'
									],
									'value' => [
										'type' => 'string'
									]
								]
							]
						]
					]
				]

			],
			'single' => true,
			'auth_callback' => '__return_true',
			'type' => 'object',
			'description' => __('The map criteria to get related posts', 'jeo')
		]);

		register_post_meta($this->post_type, 'disable_scroll_zoom', [
			'show_in_rest' => true,
			'single' => true,
			'auth_callback' => '__return_true',
			'type' => 'boolean',
			'description' => __('Disable scroll zoom', 'jeo')
		]);

		register_post_meta($this->post_type, 'disable_drag_pan', [
			'show_in_rest' => true,
			'single' => true,
			'auth_callback' => '__return_true',
			'type' => 'boolean',
			'description' => __('Disable drag pan', 'jeo')
		]);

		register_post_meta($this->post_type, 'disable_drag_rotate', [
			'show_in_rest' => true,
			'single' => true,
			'auth_callback' => '__return_true',
			'type' => 'boolean',
			'description' => __('Disable drag rotation', 'jeo')
		]);

		register_post_meta($this->post_type, 'enable_fullscreen', [
			'show_in_rest' => true,
			'single' => true,
			'auth_callback' => '__return_true',
			'type' => 'boolean',
			'description' => __('Enable fullscreen button', 'jeo')
		]);

		register_post_meta($this->post_type, 'relate_posts', [
			'show_in_rest' => true,
			'single' => true,
			'auth_callback' => '__return_true',
			'type' => 'boolean',
			'description' => __('Show all posts on map', 'jeo')
		]);

		register_post_meta($this->post_type, 'min_zoom', [
			'show_in_rest' => true,
			'single' => true,
			'auth_callback' => '__return_true',
			'type' => 'number',
			'description' => __('Minimum Zoom level', 'jeo')
		]);

		register_post_meta($this->post_type, 'max_zoom', [
			'show_in_rest' => true,
			'single' => true,
			'auth_callback' => '__return_true',
			'type' => 'number',
			'description' => __('Maximum zoom level', 'jeo')
		]);

		register_post_meta($this->post_type, 'hide_in_discovery', [
			'show_in_rest' => true,
			'single' => true,
			'auth_callback' => '__return_true',
			'type' => 'boolean',
			'description' => __('Hide in discovery', 'jeo')
		]);

		register_post_meta($this->post_type, 'disable_embed', [
			'show_in_rest' => true,
			'single' => true,
			'auth_callback' => '__return_true',
			'type' => 'boolean',
			'description' => __('Disable embed', 'jeo')
		]);

	}

	public function sanitize_meta_center($meta_value, $meta_key, $object_type, $object_subtype) {
		return intval($meta_value);
	}

	public function sanitize_meta_initial_zoom($meta_value, $meta_key, $object_type, $object_subtype) {
		return intval($meta_value);
	}

	/**
	 * Validates the zoom metadata value
	 * @param  mixed $value The value to be validated
	 * @return void|\WP_Error Returns a \WP_Error object in case the value is invalid
	 */
	public function validate_meta_initial_zoom($value) {
		// WordPress is already validating if it is a number

		$val = intval($value);
		if ( $val < 1 || $val > 14 ) {
			return new \WP_Error( 'rest_invalid_field', __( 'Map zoom must be between 1 and 14', 'jeo' ), array( 'status' => 400 ) );
		}

	}

	public function register_shortcode() {
		\add_shortcode( 'jeo-map', array( $this, 'map_shortcode' ) );
	}

	public function map_shortcode( $atts ) {

		$atts = \shortcode_atts( [
			'map_id' => 0,
			'width' => '',
			'height' => ''
		], $atts );

		$map_id = (int) $atts['map_id'];

		if ( $atts['map_id'] < 1 ) {
			return '';
		}

		$div = '<div class="jeomap map_id_"' . $map_id . '" ';

		$w = $atts['width'];
		$h = $atts['height'];
		$style = '';

		if ( ! empty($w) ) {
			$style .= 'style="width: ' . $atts['width'] . '; ';
		}

		if ( ! empty($h) ) {
			$style .= 'height: ' . $atts['height'] . ';"';
		}

		if ( ! empty( $tyle ) ) {
			$div .= 'style="' . $style . '"';
		}


		$div .= '></div>';

		return $div;

	}

	public function the_content_filter( $content ) {

		if ( get_post_type() != 'map' ) {
			return $content;
		}

		// Only when visiting the Map single page
		if ( is_single( get_the_id() ) ) {
			$map_id = get_the_ID();
			$div = "<div class='jeomap map_id_'{$map_id}'";
			$content = $div . $content;
		}

		$layers_def = get_post_meta( get_the_ID(), 'layers', true);

		if ( is_array( $layers_def ) ) {

			$layers_ids = array_map( function($e) { return $e['id']; }, $layers_def );

			if ( ! sizeof($layers_ids) ) {
				return $content;
			}

			$layers = new \WP_Query([
				'post_type' => 'map-layer',
				'post__in' => $layers_ids,
				'orderby' => 'post__in',
				'nopaging' => true,
				'suppress_filters' => true,
			]);

			$template = \jeo_get_template( 'map-content-layers-list.php' );

			$return = '<div class="map-content-layers-list">';

			ob_start();

			while ( $layers->have_posts() ) {

				$layers->the_post();

				$source_url = get_post_meta( get_the_ID(), 'source_url', true );
				$attribution = get_post_meta( get_the_ID(), 'attribution', true );
				$attribution_name = get_post_meta( get_the_ID(), 'attribution_name', true );

				if ($source_url || $attribution || $attribution_name){
					include( $template );
				}

			}

			$return .= \ob_get_clean();

			\wp_reset_postdata();

			$return .= '</div>';

			$content .= $return;

		}

		return $content;

	}

	public function add_capabilities() {
		$roles = ['author', 'editor', 'administrator'];
		foreach ($roles as $role) {
			// var_dump($role);
			$role_obj = get_role($role);

			$role_obj->add_cap( 'edit_map' );
			$role_obj->add_cap( 'edit_maps' );
			$role_obj->add_cap( 'edit_others_maps' );
			$role_obj->add_cap( 'publish_maps' );
			$role_obj->add_cap( 'read_map' );
			$role_obj->add_cap( 'read_private_maps' );
			$role_obj->add_cap( 'delete_map' );
			$role_obj->add_cap( 'edit_published_blocks' );
		}
	}

	public function override_template($template) {
		global $post;

		if (is_singular('map')) {
			return JEO_BASEPATH . '/templates/single-map.php';
		}

		return $template;
	}
}
