//import { __ } from "@wordpress/i18n";

/**
 * to test this, add the following div in the singular.php template of the twentytwenty theme
 * <div class="jeomap" data_center_lat="0" data_center_lon="0" data_initial_zoom="1" data_layers="[2,3,4]" style="width:600px; height: 600px;"></div>
 *
 * then visit any page in your site
 */

var mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');
mapboxgl.accessToken = jeo_settings.mapbox_key;

class JeoMapbox {

	constructor(element) {

		this.element = element;
		this.args = element.attributes;

		let map = new mapboxgl.Map({
			container: element
		});

		this.map = map;

		map.setZoom( this.getArg('data_initial_zoom') );

		map.setCenter( [this.getArg('data_center_lon'), this.getArg('data_center_lat')] );

		this.getLayers().then( layers => {

			const baseLayer = layers[0];
			baseLayer.addStyle(map);

			map.on('load', () => {
				layers.forEach( (layer, i) => {
					if ( i === 0 ) {
						return;
					} else {
						layer.addLayer(map);
					}
				});
			});

			this.addLayersControl();

		} );

	}

	getArg(argName) {
		if ( typeof(this.args[argName]) == 'object' ) {
			return this.args[argName].value;
		}
	}

	getLayers() {
		const layerIds = this.getArg('data_layers');

		return new Promise( (resolve, reject) => {

			// TODO: get layers using API...
			const layers = [
				new MapboxLayer('layer-1', 'Layer 1', 'infoamazonia/cjvwvumyx5i851coa874sx97e'),
				new TileLayer('layer-2', 'Switchable', 'https://stamen-tiles.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg'),
				new TileLayer('layer-4', 'Swapable 1', 'https://wri-tiles.s3.amazonaws.com/glad_prod/tiles/{z}/{x}/{y}.png'),
				new MapboxLayer('layer-3', 'Swapable 2', 'infoamazonia/ck33yfty30o0s1dqpien3edi4')
			];
			this.layers = layers;
			resolve(layers);

		});

	}

	/**
	 * return an array with the index of the layers in the
	 * this.layers list that are marked as toggable.
	 *
	 * If there are no toggable layers, returns an empty array
	 *
	 * @return array
	 */
	getTogglableLayers() {
		return [1];
	}

	/**
	 * return an array with the index of the layers in the
	 * this.layers list that are marked as switchable.
	 *
	 * If there are no switchable layers, returns an empty array
	 *
	 * @return array
	 */
	getSwitchableLayers() {
		return [2,3];
	}

	/**
	 * return the index of the switchable layer marked as default
	 */
	getDefaultSwitchableLayer() {
		return 2;
	}

	addLayersControl() {
		let navElement = document.createElement('nav');

		this.getTogglableLayers().forEach(index => {
			let link = document.createElement('a');
			link.href = '#';
			link.className = 'active';
			link.textContent = this.layers[index].layer_name;
			link.setAttribute('data-layer_id', this.layers[index].layer_id);

			link.onclick = e => {
				let clicked = e.currentTarget;
				const clickedLayer = clicked.dataset.layer_id;
				e.preventDefault();
				e.stopPropagation();

				var visibility = this.map.getLayoutProperty(clickedLayer, 'visibility');

				if (typeof(visibility) == 'undefined' || visibility === 'visible') {
					this.map.setLayoutProperty(clickedLayer, 'visibility', 'none');
					clicked.className = '';
				} else {
					clicked.className = 'active';
					this.map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
				}
			};

			navElement.appendChild(link);

		});

		this.getSwitchableLayers().forEach(index => {
			let link = document.createElement('a');
			link.href = '#';
			link.classList.add('switchable');

			if ( this.getDefaultSwitchableLayer() == index ) {
				link.classList.add('active');
			}
			link.textContent = this.layers[index].layer_name;
			link.setAttribute('data-layer_id', this.layers[index].layer_id);

			link.onclick = e => {
				if ( jQuery(e.currentTarget).hasClass('active') ) {
					return;
				}
				e.preventDefault();
				e.stopPropagation();

				// hide all
				this.getSwitchableLayers().forEach(i => {
					this.map.setLayoutProperty(this.layers[i].layer_id, 'visibility', 'none');
				});
				jQuery(navElement).children('.switchable').removeClass('active');

				// display current
				let clicked = e.currentTarget;
				const clickedLayer = clicked.dataset.layer_id;
				this.map.setLayoutProperty(clickedLayer, 'visibility', 'visible');

				var visibility = this.map.getLayoutProperty(clickedLayer, 'visibility');
				clicked.classList.add('active');

			};

			navElement.appendChild(link);

		});

		this.element.appendChild(navElement);
	}

}

/**
 * The idea here is that each layer type will have its own class implementing
 * addStyle and addLayer methods.
 *
 * In mapboxGL, a map must have a style, which is a sort of base layer, and they are handled differently,
 * that's why we need two methods
 */

class MapboxLayer {
	constructor (layer_id, layer_name, style_id, access_token) {
		this.layer_id = layer_id;
		this.style_id = style_id;
		this.layer_name = layer_name;
		this.access_token = access_token ? access_token : mapboxgl.accessToken;
	}

	addStyle(map) {
		return map.setStyle( 'mapbox://styles/' + this.style_id );
	}

	addLayer(map) {
		return map.addLayer({
			id: this.layer_id,
			source: {
			  type: 'raster',
			  tiles: ['https://api.mapbox.com/styles/v1/'  + this.style_id + '/tiles/256/{z}/{x}/{y}@2x?access_token=' + this.access_token]
			},
			type: 'raster'
		  });
	}
}

class TileLayer {
	constructor(layer_id, layer_name, url) {
		this.url = url;
		this.layer_id = layer_id;
		this.layer_name = layer_name;
	}

	addStyle(map) {
		return map.setStyle({
			'version': 8,
			'sources': {
				'raster-tiles': {
					'type': 'raster',
					tiles: [this.url],
					'tileSize': 256
				}
			},
			'layers': [{
				id: this.layer_id,
				type: 'raster',
				source: 'raster-tiles'
			}]
		})
	}

	addLayer(map) {
		return map.addLayer({
			id: this.layer_id,
			source: {
			  type: 'raster',
			  tiles: [this.url],
			  "tileSize": 256
			},
			type: 'raster'
		  });
	}
}

(function($) {
	$(function(){
		$('.jeomap').each(function(i) {
			new JeoMapbox(this);
		});
	});
})(jQuery);










