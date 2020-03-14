import { InspectorControls } from '@wordpress/block-editor';
import { Button, PanelBody, Spinner } from '@wordpress/components';
import { withSelect } from '@wordpress/data';
import { compose, withInstanceId } from '@wordpress/compose';
import { Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import Map from './map';
import { renderLayer } from './map-preview-layer';
import JeoAutosuggest from './jeo-autosuggest';
import SizePanel from './size-panel';
import './map-editor.css';

const { map_defaults: mapDefaults } = window.jeo_settings;

const MapEditor = ( {
	attributes,
	setAttributes,
	instanceId,
	loadedLayers,
	loadingLayers,
	loadedMap,
	loadingMap,
} ) => {
	return (
		<Fragment>
			{ attributes.map_id && loadingMap && <Spinner /> }
			{ attributes.map_id && ! loadingMap && (
				<Fragment>
					<div className="jeo-preview-area">
						<Map
							style="mapbox://styles/mapbox/streets-v11"
							zoom={ [ loadedMap.meta.initial_zoom || mapDefaults.zoom ] }
							center={ [
								loadedMap.meta.center_lon || mapDefaults.lng,
								loadedMap.meta.center_lat || mapDefaults.lat,
							] }
							containerStyle={ { height: '20vh' } }
						>
							{ loadedLayers && loadedMap.meta.layers.map( ( layer ) => {
								const layerOptions = loadedLayers.find( ( { id } ) => id === layer.id ).meta;
								return renderLayer( layerOptions, layer );
							} ) }
						</Map>
					</div>

					<div className="jeo-preview-controls">
						<Button
							isLink
							isLarge
							onClick={ () =>
								setAttributes( { ...attributes, map_id: undefined } )
							}
						>
							{ __( 'Select another map' ) }
						</Button>
					</div>
				</Fragment>
			) }
			{ ! attributes.map_id && (
				<Fragment>
					<label htmlFor={ `jeo-map-autosuggest-${ instanceId }` }>
						{ __( 'Insert a map from the library' ) + ':' }
					</label>
					<JeoAutosuggest
						inputProps={ {
							placeholder: __( 'Type a map name', 'jeo' ),
							id: `jeo-map-autosuggest-${ instanceId }`,
						} }
						postType="map"
						onSuggestionSelected={ ( e, { suggestion } ) =>
							setAttributes( { ...attributes, map_id: suggestion.id } )
						}
					/>
				</Fragment>
			) }
			<InspectorControls key={ 'inspector' }>
				<SizePanel
					attributes={ attributes }
					setAttributes={ setAttributes }
					panel={ PanelBody }
				/>
			</InspectorControls>
		</Fragment>
	);
};

const applyWithSelect = withSelect( ( select, { attributes } ) => ( {
	loadedMap:
		attributes.map_id &&
		select( 'core' ).getEntityRecord( 'postType', 'map', attributes.map_id ),
	loadingMap:
		attributes.map_id &&
		select( 'core/data' ).isResolving( 'core', 'getEntityRecord', [
			'postType',
			'map',
			attributes.map_id,
		] ),
	loadedLayers: select( 'core' ).getEntityRecords( 'postType', 'map-layer' ),
	loadingLayers: select( 'core/data' ).isResolving( 'core', 'getEntityRecords', [
		'postType',
		'map-layer',
	] ),
} ) );

export default compose( withInstanceId, applyWithSelect )( MapEditor );
