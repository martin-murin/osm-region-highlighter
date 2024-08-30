import React, { useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import MapLayer from './MapLayer'; // Import the new MapLayer component

const MapComponent = ({ layers, handleEntityError }) => {
    return (
        <MapContainer
            center={[20, 0]}
            zoom={2}
            style={{ height: "100%", width: "100%" }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
            />
            {layers.map((layer, index) => (
                    <MapLayer
                        key={index}
                        type={layer.type}
                        entities={layer.entities}
                        visible={layer.visible}
                        onEntityError={(entity) => handleEntityError(layer.id, entity)}
                    />
                ))}
        </MapContainer>
    );
};

export default MapComponent;

