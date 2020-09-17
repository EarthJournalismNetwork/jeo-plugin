import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import MapDisplay from './map-display';
import MapEditor from './map-editor';
import OnetimeMapDisplay from './onetime-map-display';
import OnetimeMapEditor from './onetime-map-editor';
import StorymapEditor from './storymap-editor'
import MapIcon from '../icons/ion/map';

registerBlockType( 'jeo/map', {
	title: __( 'JEO Map' ),
	description: __( 'Display maps with layers and data' ),
	category: 'jeo',
	icon: MapIcon,
	supports: {
		align: true,
	},
	attributes: {
		map_id: {
			type: 'number',
		},
	},
	edit: ( props ) => <MapEditor { ...props } />,
	save: ( props ) => <MapDisplay { ...props } />,
} );

registerBlockType( 'jeo/onetime-map', {
	title: __( 'JEO One-time Map' ),
	description: __( 'Display maps with layers and data' ),
	category: 'jeo',
	icon: MapIcon,
	supports: {
		align: true,
	},
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
					show_legend: { type: 'boolean' },
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
		min_zoom: {
			type: 'number',
		},
		max_zoom: {
			type: 'number',
		},
		disable_scroll_zoom: {
			type: 'boolean',
		},
		disable_drag_pan: {
			type: 'booelan',
		},
		disable_drag_rotate: {
			type: 'boolean',
		},
		enable_fullscreen: {
			type: 'boolean',
		},
		related_posts: {
			type: 'object',
			default: {
				categories: [],
				tags: [],
				meta_query: [],
			},
			properties: {
				categories: {
					type: 'array',
					items: { type: 'integer' },
				},
				tags: {
					type: 'array',
					items: { type: 'integer' },
				},
				before: { type: 'string' },
				after: { type: 'string' },
				meta_query: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							key: { type: 'string' },
							compare: { type: 'string' },
							value: { type: 'string' },
						},
					},
				},
			},
		},
	},
	edit: ( props ) => <OnetimeMapEditor { ...props } />,
	save: ( props ) => <OnetimeMapDisplay { ...props } />,
} );

registerBlockType( 'jeo/storymap', {
	title: __( 'Story Map' ),
	description: __( 'Display maps with storytelling' ),
	category: 'jeo',
	icon: MapIcon,
	attributes: {
		map_id: {
			type: 'number',
		},
		title: {
			type: 'string',
		},
		description: {
			type: 'string',
		},
		slides: {
			type: 'array'
		},
		navigateButton: {
			type: 'boolean',
		},
		hasIntroduction: {
			type: 'boolean',
		},
	},
	edit: ( props ) => <StorymapEditor { ...props } />,
	save: ( props ) => {
		// console.log(JSON.stringify(props.attributes));
		const attributesStructure = {
			map_id: null,
			title: null,
			description: null,
			slides: null,
			navigateButton: null,
			hasIntroduction: null,
		};

		for (const key in attributesStructure) {
			if(props.attributes[key]) {
				attributesStructure[key] = props.attributes[key];
			}
		}

		// console.log(attributesStructure);

		return <div id="story-map" data-properties={ JSON.stringify(attributesStructure) } />
	},
} );
