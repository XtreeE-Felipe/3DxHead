// Function to fetch and parse JSON file
export function loadJSONFile(url) {
    const response = fetch(url);
    const data = response.json();
    return data;
}

// Function to extract points from all layers in the JSON data
export function extractPointsFromLayers(data) {
    const allLayerPoints = [];
    
    for (const layerKey in data.Toolpath) {
        if (data.Toolpath.hasOwnProperty(layerKey)) {
            const layerPoints = data.Toolpath[layerKey].Positions.map(pos => {
                const [x, y, z] = pos.split(',').map(Number);
                return [x, y, z];
            });
            allLayerPoints.push(layerPoints);
        }
    }
    return allLayerPoints.flat();
}