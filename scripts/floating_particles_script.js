// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Particle system
const particles = 1000;
const geometry = new THREE.BufferGeometry();
const positions = [];
const colors = [];
const color = new THREE.Color();

for (let i = 0; i < particles; i++) {
    // Positions
    const x = (Math.random() - 0.5) * 1000;
    const y = (Math.random() - 0.5) * 1000;
    const z = (Math.random() - 0.5) * 1000;
    positions.push(x, y, z);

    // Colors
    const vx = (x / 1000) + 0.5;
    const vy = (y / 1000) + 0.5;
    const vz = (z / 1000) + 0.5;
    color.setRGB(vx, vy, vz);
    colors.push(color.r, color.g, color.b);
}

geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
const material = new THREE.PointsMaterial({ size: 2, vertexColors: true });
const particleSystem = new THREE.Points(geometry, material);

scene.add(particleSystem);

camera.position.z = 500;

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Rotate the particle system
    particleSystem.rotation.x += 0.0005;
    particleSystem.rotation.y += 0.001;

    renderer.render(scene, camera);
}

animate();
