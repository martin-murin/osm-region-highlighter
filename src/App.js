import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Sidebar from './components/Sidebar';
import MapComponent from './components/MapComponent';
import './App.css'

function App() {
    const [layers, setLayers] = useState([]);

    useEffect(() => {
        const loadLayers = async () => {
            try {
                const response = await fetch(`${process.env.PUBLIC_URL}/layers_default.json`);
                const data = await response.json();
                setLayers(data);
            } catch (error) {
                console.error('Error loading layers:', error);
            }
        };
        loadLayers();
    }, []);


    const addEntityToLayer = (layerId, newEntity) => {
        setLayers(layers.map(layer => {
            if (layer.id === layerId) {
                return {
                    ...layer,
                    entities: [
                        ...layer.entities,
                        { id: newEntity.id, name: newEntity.name}
                    ]
                };
            }
            return layer;
        }));
    };

    const removeEntityFromLayer = (layerId, entityId) => {
        setLayers(layers.map(layer => {
            if (layer.id === layerId) {
                return {
                    ...layer,
                    entities: layer.entities.filter(entity => entity.id !== entityId)
                };
            }
            return layer;
        }));
    };

    const togglePolygonVisibility = (layerId) => {
        setLayers(layers.map(layer =>
            layer.id === layerId
                ? { ...layer, polygonsVisible: !layer.polygonsVisible }
                : layer
        ));
    };
    const toggleMarkerVisibility = (layerId) => {
        setLayers(layers.map(layer =>
            layer.id === layerId
                ? { ...layer, markersVisible: !layer.markersVisible }
                : layer
        ));
    };

    const addNewLayer = (name) => {
        const newLayer = {
            id: Date.now(),
            name,
            entities: [],
            polygonsVisible: true,
            markersVisible: true,
            fillColor: {rgb: { r: 0, g: 0, b: 0, a: 0.2,}, hex: "#000000"} ,
            borderColor: {rgb: { r: 0, g: 0, b: 0, a: 0.8,}, hex: "#000000"} ,
        };
        setLayers([...layers, newLayer]);
    };

    const handleRemoveLayer = (layerId) => {
        setLayers(prevLayers => prevLayers.filter(layer => layer.id !== layerId));
    };

    const handleEntityError = (layerId, entityId) => {
        // Prevent adding the entity to the list if there's an error
        setLayers(prevLayers => {
            return prevLayers.map(layer => {
                if (layer.id === layerId) {
                    return {
                        ...layer,
                        entities: layer.entities.filter(e => e.id !== entityId),
                    };
                }
                return layer;
            });
        });
    };

    const handleForceRender = (layerId) => {
        setLayers(prevLayers => {
            const layer = prevLayers.find(l => l.id === layerId);
            const otherLayers = prevLayers.filter(l => l.id !== layerId);

            return [
                ...otherLayers,
                {
                    ...layer,
                    entities: [],
                },
            ];
        });

        const layer = layers.find(l => l.id === layerId);
        layer.entities.forEach((entity, index) => {
            setTimeout(() => {
                setLayers(prevLayers =>
                    prevLayers.map(l =>
                        l.id === layerId ? { ...l, entities: [...l.entities, entity] } : l
                    )
                );
            }, 5000);
        });
    };

    const handleFillColorChange = (layerId, fillColor) => {
        setLayers(prevLayers =>
            prevLayers.map(layer =>
                layer.id === layerId ? { ...layer, fillColor } : layer
            )
        );
    };

    const handleBorderColorChange = (layerId, borderColor) => {
        setLayers(prevLayers =>
            prevLayers.map(layer =>
                layer.id === layerId ? { ...layer, borderColor } : layer
            )
        );
    };

    const handleUpdateEntityName = (layerId, entityId, newName) => {
        setLayers(prevLayers => prevLayers.map(layer => {
            if (layer.id === layerId) {
                return {
                    ...layer,
                    entities: layer.entities.map(entity =>
                        entity.id === entityId ? { ...entity, name: newName } : entity
                    )
                };
            }
            return layer;
        }));
    };

    const handleExport = () => {
        const dataToExport = JSON.stringify(layers);
        const blob = new Blob([dataToExport], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'layers_export.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImport = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const importedLayers = JSON.parse(e.target.result);
            setLayers(importedLayers);
        };
        reader.readAsText(file);
    };

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-3 col-sm-12 mt-4 text-center">
                    <h2>Map Highlighter</h2>
                    <div className="row">
                        <div className="col-md-6 col-sm-12 mt-2 mb-2">
                            <button className="btn btn-primary mx-2" onClick={handleExport}>Export Layers</button>
                        </div>
                        <div className="col-md-6 col-sm-12 mt-2 mb-2">
                            <label className="btn btn-primary mx-2" htmlFor="import-file">Import Layers</label>
                            <input
                                id="import-file"
                                className="form-control d-none"
                                type="file"
                                onChange={handleImport}
                                accept=".json"
                            />
                        </div>
                    </div>
                    <div className="mt-2 scrollable">
                    <Sidebar
                        layers={layers}
                        onAddEntity={addEntityToLayer}
                        onRemoveEntity={removeEntityFromLayer}
                        onTogglePolygonVisibility={togglePolygonVisibility}
                        onToggleMarkerVisibility={toggleMarkerVisibility}
                        onAddLayer={addNewLayer}
                        onRemoveLayer={handleRemoveLayer}
                        onForceRender={handleForceRender}
                        onFillColorChange={handleFillColorChange}
                        onBorderColorChange={handleBorderColorChange}
                    />
                    </div>
                </div>
                <div className="col-md-9 col-sm-12" style={{ height: "100vh" }}>
                    <MapComponent layers={layers} handleEntityError={handleEntityError} handleUpdateEntityName={handleUpdateEntityName} />
                </div>
            </div>
        </div>
    );
}

export default App;

