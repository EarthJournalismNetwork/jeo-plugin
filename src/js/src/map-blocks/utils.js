import { __ } from '@wordpress/i18n';
import { useState, useEffect } from '@wordpress/element';

export const layerLoader = ( layers ) => {
	const layersMap = Object.fromEntries(
		( layers || [] ).map( ( l ) => [ l.id, l ] )
	);
	return ( settings ) => ( { ...settings, layer: layersMap[ settings.id ] } );
};

export const layerUseLabels = {
	fixed: __( 'Fixed' ),
	swappable: __( 'Swappable' ),
	switchable: __( 'Switchable' ),
};