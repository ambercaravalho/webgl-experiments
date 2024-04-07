// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Handling window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Cube geometry and material
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Edges for the cube
const edges = new THREE.EdgesGeometry(geometry);
const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000 }));
cube.add(line); // Adding the line as a child of the cube ensures it rotates together

camera.position.z = 5;

// Variables for drag control
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

// Add mouse event listeners
document.addEventListener('mousedown', startDrag);
document.addEventListener('mousemove', drag);
document.addEventListener('mouseup', endDrag);
document.addEventListener('wheel', onDocumentMouseWheel, false); // Zoom listener

// Start dragging
function startDrag(e) {
    isDragging = true;
}

// During drag
function drag(e) {
    if (isDragging) {
        const deltaMove = {
            x: e.offsetX - previousMousePosition.x,
            y: e.offsetY - previousMousePosition.y,
        };

        const rotateAngleX = (deltaMove.x * Math.PI) / 180;
        const rotateAngleY = (deltaMove.y * Math.PI) / 180;

        cube.rotation.y += rotateAngleX;
        cube.rotation.x += rotateAngleY;
    }

    previousMousePosition = { x: e.offsetX, y: e.offsetY };
}

// End dragging
function endDrag(e) {
    isDragging = false;
}

// Zoom with mouse wheel
function onDocumentMouseWheel(event) {
    camera.position.z += event.deltaY * 0.01;
    // Clamp zoom level to avoid inverting the scene or getting too close
    camera.position.z = Math.min(Math.max(camera.position.z, 1), 10);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Slow initial rotation
    if (!isDragging) {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
    }

    renderer.render(scene, camera);
}

// Change the cube's color randomly every second
setInterval(() => {
    cube.material.color.setHex(Math.random() * 0xffffff);
}, 1000);

animate();
