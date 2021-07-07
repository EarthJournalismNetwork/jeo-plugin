import classNames from 'classnames';

export default ( { attributes, className } ) => {
	let hasRelatedPosts;
	if ( ! attributes.related_posts ) {
		hasRelatedPosts = false;
	} else {
		hasRelatedPosts = [
			'categories',
			'tags',
			'before',
			'after',
			'meta_query',
		].some( ( key ) => attributes.related_posts[ key ] );
	}

	const style = {};
	// if ( className.includes( 'alignfull' ) ) {
	// 	style.width = '100vw';
	// }

	return (
		<div
			className={ classNames( [ 'jeomap', className ] ) }
			data-center_lat={ attributes.center_lat }
			data-center_lon={ attributes.center_lon }
			data-initial_zoom={ attributes.initial_zoom }
			data-min_zoom={ attributes.min_zoom }
			data-max_zoom={ attributes.max_zoom }
			data-disable_scroll_zoom={ attributes.disable_scroll_zoom }
			data-disable_drag_pan={ attributes.disable_drag_pan }
			data-disable_drag_rotate={ attributes.disable_drag_rotate }
			data-enable_fullscreen={ attributes.enable_fullscreen }
			data-layers={ JSON.stringify( attributes.layers ) }
			data-pan_limits={ JSON.stringify( attributes.pan_limits ) }
			data-related_posts={
				hasRelatedPosts ? JSON.stringify( attributes.related_posts ) : undefined
			}
			style={ style }
		/>
	);
};
