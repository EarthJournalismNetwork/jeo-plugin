import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import MapEditor from './map-editor';
import MapDisplay from './map-display';

registerBlockType( 'jeo/map', {
	title: __( 'Map' ),
	description: __( 'Display maps with layers and data' ),
	category: 'common', // @TODO: add jeo maps category
	attributes: {
		layers: {
			type: 'array',
			default: [],
			items: {
				type: 'object',
				properties: {
					id: { type: 'number' },
					use: { type: 'string' /* enum */ },
					default: { type: 'boolean' },
				},
			},
		},
		center_lat: {
			type: 'number',
		},
		center_lon: {
			type: 'number',
		},
		initial_zoom: {
			type: 'number',
		},
	},
	edit: ( props ) => <MapEditor { ...props } />,
	save: ( props ) => <MapDisplay { ...props } />,
} );