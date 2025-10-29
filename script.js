// --- THREE.JS IMPLEMENTATION (The "Sprinkles") ---
let scene, camera, renderer, particles, particleGeometry, positions, velocities;
let mouseX = 0, mouseY = 0;
const canvas = document.getElementById('three-canvas');

// Define colors from CSS variables for use in JS
// NOTE: This relies on the variables being set in the linked style.css
const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-blue').trim(); 
const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--bg-dark').trim();

// 1. Initialization
function initThreeScene() {
    // Scene Setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(bgColor); 

    // Camera Setup (75 degree field of view, aspect ratio, near/far clipping planes)
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Renderer Setup
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Particle System Setup
    const particleCount = 2000;
    particleGeometry = new THREE.BufferGeometry();
    positions = new Float32Array(particleCount * 3);
    velocities = [];

    // Populate particle data (position and velocity)
    for (let i = 0; i < particleCount; i++) {
        // Position particles randomly in a large cube
        positions[i * 3 + 0] = (Math.random() * 200 - 100) * 0.5; // x
        positions[i * 3 + 1] = (Math.random() * 200 - 100) * 0.5; // y
        positions[i * 3 + 2] = (Math.random() * 200 - 100) * 0.5; // z
        
        // Set initial random velocities (for subtle, perpetual movement)
        velocities.push(
            (Math.random() - 0.5) * 0.005,
            (Math.random() - 0.5) * 0.005,
            (Math.random() - 0.5) * 0.005
        );
    }

    // Attach positions to the geometry
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Material Setup (PointsMaterial creates particles)
    const particleMaterial = new THREE.PointsMaterial({
        color: new THREE.Color(accentColor),
        size: 0.02,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending, // Gives particles a glowing look
    });

    particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Event Listeners for interactivity
    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);
}

// 2. Resize Handler
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// 3. Mouse Interaction Handler
function onDocumentMouseMove(event) {
    // Convert mouse coordinates into a range from -1 to 1 for scene rotation
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = (event.clientY / window.innerHeight) * 2 - 1;
}

// 4. Animation Loop
function animate() {
    requestAnimationFrame(animate);

    // --- Particle Movement and Boundary Check ---
    const positionsArray = particleGeometry.attributes.position.array;
    
    for (let i = 0; i < positionsArray.length / 3; i++) {
        const i3 = i * 3;
        
        // Apply subtle velocity to make particles move
        positionsArray[i3 + 0] += velocities[i * 3 + 0];
        positionsArray[i3 + 1] += velocities[i * 3 + 1];
        positionsArray[i3 + 2] += velocities[i * 3 + 2];

        // If particle moves too far back, loop it to the front
        if (positionsArray[i3 + 2] > camera.position.z + 10) positionsArray[i3 + 2] -= 200 * 0.5;
        // If particle moves too far forward, loop it to the back
        if (positionsArray[i3 + 2] < camera.position.z - 10) positionsArray[i3 + 2] += 200 * 0.5;
    }
    
    // Tell Three.js that the positions have changed
    particleGeometry.attributes.position.needsUpdate = true;
    
    // --- Scene Rotation based on Mouse ---
    // Smoothly rotate the particle field toward the mouse position
    const targetX = mouseX * 0.2;
    const targetY = mouseY * 0.2;

    particles.rotation.y += (targetX - particles.rotation.y) * 0.01;
    particles.rotation.x += (targetY - particles.rotation.x) * 0.01;
    
    // Subtle constant rotation for the "swirl"
    particles.rotation.z += 0.0002;

    renderer.render(scene, camera);
}

// Start the scene when the window is fully loaded
window.onload = function () {
    try {
        initThreeScene();
        animate();
    } catch (e) {
        console.error("Three.js initialization failed:", e);
        // Fallback for environments where Three.js might fail
        canvas.style.display = 'none';
        document.getElementById('ui-overlay').style.backgroundColor = 'var(--bg-dark)';
        document.getElementById('ui-overlay').style.backdropFilter = 'none';
        
        // Optional: Show a message if 3D fails
        const errorDiv = document.createElement('div');
        errorDiv.className = "text-center p-4 bg-red-800 text-white rounded-lg mx-auto max-w-sm mt-8";
        errorDiv.innerHTML = "3D background failed to load. Displaying 2D UI only.";
        document.getElementById('ui-overlay').prepend(errorDiv);
    }
}
