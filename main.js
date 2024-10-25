import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { gsap } from 'gsap';

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color('#021129');

// Renderer setup with improved settings
const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    powerPreference: "high-performance"
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows
renderer.physicallyCorrectLights = true; // Enable physically correct lighting
renderer.outputEncoding = THREE.sRGBEncoding; // Correct color space
renderer.toneMapping = THREE.ACESFilmicToneMapping; // Better color reproduction
renderer.toneMappingExposure = 1.0;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// CSS2D Renderer for labels
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
document.body.appendChild(labelRenderer.domElement);

// Improved Lighting Setup
// Ambient light for general illumination
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Main key light
const keyLight = new THREE.DirectionalLight(0xffffff, 1);
keyLight.position.set(5, 5, 5);
keyLight.castShadow = true;
// Improve shadow quality
keyLight.shadow.mapSize.width = 2048;
keyLight.shadow.mapSize.height = 2048;
keyLight.shadow.camera.near = 0.1;
keyLight.shadow.camera.far = 20;
keyLight.shadow.camera.left = -5;
keyLight.shadow.camera.right = 5;
keyLight.shadow.camera.top = 5;
keyLight.shadow.camera.bottom = -5;
keyLight.shadow.bias = -0.0001;
scene.add(keyLight);

// Fill light
const fillLight = new THREE.DirectionalLight(0x8fb0ff, 0.7); // Slightly blue tint
fillLight.position.set(-5, 3, -5);
scene.add(fillLight);

// Rim light for edge highlighting
const rimLight = new THREE.DirectionalLight(0xffffff, 0.6);
rimLight.position.set(0, 3, -5);
scene.add(rimLight);

//Camera
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(3,3,3);

// Modified controls setup
const controls = new OrbitControls(camera, labelRenderer.domElement);  // Change to labelRenderer
controls.enablePan = false;
controls.enableZoom = true;
controls.target.set(0, 0.8, 0);
controls.update();

// Axis
//const axesHelper = new THREE.AxesHelper( 0.1 );
//scene.add( axesHelper );

// Ground
const mesh = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100 ), new THREE.MeshPhongMaterial( { color: 0xcbcbcb, depthWrite: false } ) );
mesh.rotation.x = - Math.PI / 2;
mesh.receiveShadow = true;
//scene.add( mesh );

// Create label function 
function createLabel(mesh, text) {
    const div = document.createElement('div');
    div.className = 'label';
    div.textContent = text;
    div.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
    div.style.color = 'white';
    div.style.padding = '2px 6px';
    div.style.borderRadius = '3px';
    div.style.fontSize = '16px';
    div.style.fontFamily = 'Segoe UI';
    div.style.pointerEvents = 'none';
    div.style.whiteSpace = 'nowrap';

    const label = new CSS2DObject(div);
    
    // Calculate center of bounding box
    const boundingBox = new THREE.Box3().setFromObject(mesh);
    const center = new THREE.Vector3();
    boundingBox.getCenter(center);
    
    // Convert center to local coordinates relative to the mesh
    mesh.worldToLocal(center);
    
    // Position label at center and slightly above
    label.position.copy(center);
    // Add a small Y offset to place it above the center
    label.position.y += boundingBox.max.y - center.y + 0.1; // 0.1 units above the top
    
    mesh.add(label);
    mesh.userData.label = label;
    
    return label;
}

// Load Meshes Function
const loader = new GLTFLoader();

let meshes = {};

function loadMesh(fileName, key, labelText, isVisible = true) {
    loader.load(fileName, function (gltf) {
        meshes[key] = gltf.scene;
        meshes[key].castShadow = true;
        meshes[key].visible = isVisible; 
        scene.add(meshes[key]);
        
        if(labelText != ''){
            createLabel(meshes[key], labelText);
            meshes[key].userData.label.visible = isVisible;     
        }

    }, undefined, function (error) {
        console.error('Error loading', fileName, error);
    });
}

// Load each mesh using the function
loadMesh('Meshes/1SM.glb', 'Plus', '+', false); //Plus
loadMesh('Meshes/4SM.glb', '1K', '1K'); // 1K
loadMesh('Meshes/2SM.glb', '2K', '2K', false); // 2K
loadMesh('Meshes/3SM.glb', '3K', '3K', false); //3K
loadMesh('Meshes/Carter02.glb', 'Carter02', '');
loadMesh('Meshes/Carter01.glb', 'Carter01', '');
loadMesh('Meshes/Robot.glb', 'Robot', '');

// Raycaster to detect mouse clicks on the mesh
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Rotation settings
let rotating = false;
let rotationSpeed = 0.08;
let rotatingDirection = 1; // 1 or -1
let maxRotation = 2;  //Angle in radians

// Animate and render the scene
function animate() {
    requestAnimationFrame(animate);

    if (rotating) {
        // Calculate progress (normalized between 0 and 1)
        const progress = Math.abs(meshes["Carter01"].rotation.y / maxRotation);
        
        // Apply easing to the rotation speed
        const easedSpeed = rotationSpeed * Math.sqrt(((Math.sin(Math.PI * ((progress*2)-0.5))+1)/2)+rotationSpeed);

        // Update rotation based on the current direction
        meshes["Carter01"].rotation.y += easedSpeed * rotatingDirection;

        // Clamp rotation and reverse direction when limits are reached
        if (meshes["Carter01"].rotation.y >= maxRotation) {
            meshes["Carter01"].rotation.y = maxRotation;
            rotating = !rotating;  // Stop or change direction
            rotatingDirection *= -1;  // Reverse the direction
        }
        if (meshes["Carter01"].rotation.y <= 0) {
            meshes["Carter01"].rotation.y = 0;
            rotating = !rotating;
            rotatingDirection *= -1;
        }
    }

    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
}

animate();

// Detect click events
window.addEventListener('click', (event) => {
    // Calculate mouse position in normalized device coordinates (-1 to +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update raycaster with camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Detect intersected objects
    const intersects = raycaster.intersectObject(meshes["Carter01"]);

    if (intersects.length > 0) {
        rotating = !rotating; // Toggle rotation on click
        
        const targetPosition = {
            x: 2,
            y: 2.30,
            z: 1
        };
        
        gsap.to(camera.position, {
            duration: 1,
            x: targetPosition.x,
            y: targetPosition.y,
            z: targetPosition.z,
            ease: "power2.inOut",
            onUpdate: () => {
                // Ensure camera looks at the object during animation
                camera.lookAt(meshes["Carter01"].position.x, meshes["Carter01"].position.y + 0.8, meshes["Carter01"].position.z );
            }
        });
    }
});

// MouseOver Handlers
function _1K(){
    meshes['Plus'].visible = false;
    meshes['2K'].visible = false;
    meshes['3K'].visible = false;
    updateLabelsVisibility()
}

function _1Kplus(){
    meshes['Plus'].visible = true;
    meshes['2K'].visible = false;
    meshes['3K'].visible = false;
    updateLabelsVisibility()
}

function _2K(){
    meshes['Plus'].visible = false;
    meshes['2K'].visible = true;
    meshes['3K'].visible = false;
    updateLabelsVisibility()
}

function _2Kplus(){
    meshes['Plus'].visible = true;
    meshes['2K'].visible = true;
    meshes['3K'].visible = false;
    updateLabelsVisibility()
}

function _3K(){
    meshes['Plus'].visible = false;
    meshes['2K'].visible = true;
    meshes['3K'].visible = true;
    updateLabelsVisibility()
}

function _3Kplus(){
    meshes['Plus'].visible = true;
    meshes['2K'].visible = true;
    meshes['3K'].visible = true;
    updateLabelsVisibility()
}

// MouseOver Events
document.getElementById("1K").addEventListener("mouseenter", ()=> _1K())
document.getElementById("1K+").addEventListener("mouseenter", ()=> _1Kplus())
document.getElementById("2K").addEventListener("mouseenter", ()=> _2K())
document.getElementById("2K+").addEventListener("mouseenter", ()=> _2Kplus())
document.getElementById("3K").addEventListener("mouseenter", ()=> _3K())
document.getElementById("3K+").addEventListener("mouseenter", ()=> _3Kplus())

function updateLabelsVisibility() {
    Object.keys(meshes).forEach(key => {
        if (meshes[key].userData.label) {
            meshes[key].userData.label.visible = meshes[key].visible;
        }
    });
}
