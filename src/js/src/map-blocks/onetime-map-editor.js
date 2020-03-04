import { withSelect } from '@wordpress/data';
import { Fragment, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Button, PanelBody } from '@wordpress/components';
import { InspectorControls } from '@wordpress/block-editor';

import Map from './map';
import MapEditorModal from './map-editor-modal';
import MapPanel from './map-panel';
import LayersPanel from './layers-panel';
import { layerLoader } from './utils';
import './onetime-map-editor.css';

const OnetimeMapEditor = ( {
	attributes,
	setAttributes,
	loadedLayers,
	loadingLayers,
} ) => {
	const [ modal, setModal ] = useState( false );
	const loadLayer = layerLoader( loadedLayers );

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
					panel={ PanelBody } />
				<LayersPanel
					attributes={ attributes }
					setModal={ setModal }
					loadLayer={ loadLayer }
					loadingLayers={ loadingLayers }
					panel={ PanelBody }
				/>
			</InspectorControls>

			<div className="jeo-preview-area">
				<Map
					style="mapbox://styles/mapbox/streets-v11"
					zoom={ [ attributes.initial_zoom || jeo_settings.map_defaults.zoom ] }
					center={ [
						attributes.center_lon || jeo_settings.map_defaults.lng,
						attributes.center_lat || jeo_settings.map_defaults.lat
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