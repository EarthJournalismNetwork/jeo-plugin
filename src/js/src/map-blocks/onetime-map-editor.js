import { withSelect } from '@wordpress/data';
import { Fragment, useCallback, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Button, PanelBody } from '@wordpress/components';
import { InspectorControls } from '@wordpress/block-editor';

import Map from './map';
import MapEditorModal from './map-editor-modal';
import MapPanel from './map-panel';
import LayersPanel from './layers-panel';
import PostsSelector from '../posts-selector';
import { layerLoader } from './utils';
import './onetime-map-editor.css';

const { map_defaults: mapDefaults } = window.jeo_settings;

const OnetimeMapEditor = ( {
	attributes,
	setAttributes,
	loadedLayers,
	loadingLayers,
} ) => {
	const [ modal, setModal ] = useState( false );
	const loadLayer = layerLoader( loadedLayers );

	const setRelatedPosts = useCallback( ( related_posts ) => {
		setAttributes( { ...attributes, related_posts } );
	}, [ setAttributes ] );

	return (
		<Fragment>
			{ modal && (
				<MapEditorModal
					modal={ modal }
					setModal={ setModal }
					attributes={ attributes }
					setAttributes={ setAttributes }
					loadedLayers={ loadedLayers }
					loadingLayers={ loadingLayers }
				/>
			) }

			<InspectorControls>
				<MapPanel
					attributes={ attributes }
					setModal={ setModal }
					panel={ PanelBody }
				/>

				<LayersPanel
					attributes={ attributes }
					setModal={ setModal }
					loadLayer={ loadLayer }
					loadingLayers={ loadingLayers }
					panel={ PanelBody }
				/>

				<PanelBody title={ __( 'Related posts', 'jeo' ) }>
					<PostsSelector
						relatedPosts={ attributes.related_posts }
						setRelatedPosts={ setRelatedPosts }
						panel={ PanelBody }
					/>
				</PanelBody>
			</InspectorControls>

			<div className="jeo-preview-area">
				<Map
					style="mapbox://styles/mapbox/streets-v11"
					zoom={ [ attributes.initial_zoom || mapDefaults.zoom ] }
					center={ [
						attributes.center_lon || mapDefaults.lng,
						attributes.center_lat || mapDefaults.lat,
					] }
					containerStyle={ { height: '20vh' } }
				/>
			</div>

			<div className="jeo-preview-controls">
				<Button isPrimary isLarge onClick={ () => setModal( 'map' ) }>
					{ __( 'Edit map settings' ) }
				</Button>

				<Button isPrimary isLarge onClick={ () => setModal( 'layers' ) }>
					{ __( 'Edit layers settings' ) }
				</Button>
			</div>
		</Fragment>
	);
};

export default withSelect( ( select, { attributes } ) => {
	const query = { include: attributes.layers.map( ( layer ) => layer.id ) };
	return {
		loadedLayers: select( 'core' ).getEntityRecords(
			'postType',
			'map-layer',
			query
		),
		loadingLayers: select( 'core/data' ).isResolving( 'core', 'getEntityRecords', [
			'postType',
			'map-layer',
			query,
		] ),
	};
} )( OnetimeMapEditor );
