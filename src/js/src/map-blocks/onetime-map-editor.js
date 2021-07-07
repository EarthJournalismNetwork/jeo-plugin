import { InspectorControls } from '@wordpress/block-editor';
import { Button, PanelBody } from '@wordpress/components';
import { withSelect } from '@wordpress/data';
import { Fragment, useCallback, useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import Map from './map';
import LayersSettingsModal from './layers-settings-modal';
import { renderLayer } from './map-preview-layer';
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
	const [ key, setKey ] = useState( 0 );
	const loadLayer = layerLoader( loadedLayers );

	useEffect( () => {
		setKey( key + 1 );
	}, [ attributes.align, window.screen.width ] );

	const setRelatedPosts = useCallback(
		( relatedPosts ) => {
			setAttributes( { ...attributes, related_posts: relatedPosts } );
		},
		[ setAttributes ]
	);

	const closeModal = useCallback( () => setModal( false ), [ setModal ] );
	const openModal = useCallback( () => setModal( true ), [ setModal ] );

	const animationOptions = {
		animate: false,
	};

	const [ zoomState, setZoomState ] = useState( 'initial_zoom' );
	const currentZoom = attributes[ zoomState ];


	const [ map, setMap ] = useState(false);

	const setPanLimitsFromMap = () => {
		if(map) {
			const boundries = map.getBounds();
			setAttributes(
				{	...attributes,
					'pan_limits': {
						east: boundries._ne.lat,
						north: boundries._ne.lng,
						south: boundries._sw.lng,
						west: boundries._sw.lat,
					}
				} )
		}
	}

	return (
		<Fragment>
			{ modal && (
				<LayersSettingsModal
					closeModal={ closeModal }
					attributes={ attributes }
					setAttributes={ setAttributes }
					loadedLayers={ loadedLayers }
					loadingLayers={ loadingLayers }
				/>
			) }

			<InspectorControls>
				<MapPanel
					attributes={ attributes }
					setAttributes={ setAttributes }
					renderPanel={ PanelBody }
					setZoomState={ setZoomState }
					setPanLimitsFromMap={ setPanLimitsFromMap }
				/>
				<LayersPanel
					attributes={ attributes }
					openModal={ openModal }
					loadLayer={ loadLayer }
					loadingLayers={ loadingLayers }
					renderPanel={ PanelBody }
				/>
				<PostsSelector
					relatedPosts={ attributes.related_posts }
					setRelatedPosts={ setRelatedPosts }
					renderPanel={ PanelBody }
				/>
			</InspectorControls>

			<div className="jeo-preview-area">
				<Map
					onStyleLoad={ ( map ) => {
						map.addControl(
							new mapboxgl.NavigationControl( { showCompass: false } ),
							'top-left'
						);
						map.addControl( new mapboxgl.FullscreenControl(), 'top-left' );
						setMap(map);
					} }
					key={ currentZoom }
					style="mapbox://styles/mapbox/streets-v11"
					zoom={ [ currentZoom || mapDefaults.zoom ] }
					center={ [
						attributes.center_lon || mapDefaults.lng,
						attributes.center_lat || mapDefaults.lat,
					] }
					containerStyle={ { height: '50vh' } }
					animationOptions={ animationOptions }
					onMoveEnd={ ( map ) => {
						const center = map.getCenter();
						const zoom = Math.round( map.getZoom() * 10 ) / 10;

						setAttributes( {
							center_lat: center.lat,
							center_lon: center.lng,
							[ zoomState ]: zoom,
						} );
					} }
				>
					{ loadedLayers &&
						attributes.layers.map( ( layer ) => {
							const layerOptions = loadedLayers.find(
								( { id } ) => id === layer.id
							).meta;
							return renderLayer( { layer: layerOptions, instance: layer } );
						} ) }
				</Map>
			</div>

			<div className="jeo-preview-controls">
				<Button isPrimary isLarge onClick={ openModal }>
					{ __( 'Edit layers settings', 'jeo' ) }
				</Button>
			</div>
		</Fragment>
	);
};

export default withSelect( ( select, { attributes } ) => {
	const query = {
		include: attributes.layers.map( ( layer ) => layer.id ),
		per_page: 100, order: 'asc', orderby: 'menu_order'
	};
	return {
		loadedLayers: select( 'core' ).getEntityRecords(
			'postType',
			'map-layer',
			query
		),
		loadingLayers: select( 'core/data' ).isResolving(
			'core',
			'getEntityRecords',
			[ 'postType', 'map-layer', query ]
		),
	};
} )( OnetimeMapEditor );
