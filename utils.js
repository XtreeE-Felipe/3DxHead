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

//  EXAMPLE LOADING A JSON XOBJECT TOOLPATH AS GEOMETRY ///
// Load the JSON file
//const jsonData = utils.loadJSONFile('ScreenBase_v0_044902894.json');
    
// Extract points from all layers in the JSON data
//const allLayerPoints = utils.extractPointsFromLayers(jsonData);

// Create a geometry from the points
// const myPoints = new THREE.BufferGeometry().setFromPoints(
//     allLayerPoints.map(point => new THREE.Vector3((point[0]/1000), point[2]/1000-1, point[1]/1000-0.5))
// );
// const mymaterial = new THREE.LineBasicMaterial({ color: 0x0085eb });
// const myline = new THREE.Line(myPoints, mymaterial);
// scene.add(myline);

//fnm env --use-on-cd | Out-String | Invoke-Expression /// Need sometime to use npx vite