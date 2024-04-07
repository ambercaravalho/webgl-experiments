// wait for Ammo to initialize
Ammo().then(function(Ammo) {

    // scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 10, 20);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // lighting
    const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 0);
    scene.add(directionalLight);

    // physics world setup
    const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
    const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
    const overlappingPairCache = new Ammo.btDbvtBroadphase();
    const solver = new Ammo.btSequentialImpulseConstraintSolver();
    const physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
    physicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));

    // ground setup
    const groundShape = new Ammo.btBoxShape(new Ammo.btVector3(50, 1, 50)); // create a large, flat box
    const groundTransform = new Ammo.btTransform();
    groundTransform.setIdentity();
    groundTransform.setOrigin(new Ammo.btVector3(0, -1, 0)); // position it slightly below our objects
    const groundMass = 0; // mass of 0 means it's static
    const groundLocalInertia = new Ammo.btVector3(0, 0, 0);
    const groundMotionState = new Ammo.btDefaultMotionState(groundTransform);
    const groundRigidBodyInfo = new Ammo.btRigidBodyConstructionInfo(groundMass, groundMotionState, groundShape, groundLocalInertia);
    const groundRigidBody = new Ammo.btRigidBody(groundRigidBodyInfo);
    physicsWorld.addRigidBody(groundRigidBody);

    // visual representation of the ground
    const groundGeometry = new THREE.BoxGeometry(100, 2, 100);
    const groundMaterial = new THREE.MeshPhongMaterial({color: 0x8FBC8F});
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.position.y = -1;
    scene.add(groundMesh);

    // stores references to physics and visual objects
    const objects = [];

    // function to create a physics shape
    function createPhysicsShape(geometryType, position, mass) {
        let shape;
        const size = 1;
        switch (geometryType) {
            case 'box':
                shape = new Ammo.btBoxShape(new Ammo.btVector3(size, size, size));
                break;
            case 'sphere':
                shape = new Ammo.btSphereShape(size);
                break;
            default:
                console.warn('Unsupported geometryType:', geometryType);
                return;
        }

        const transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(...position));
        const localInertia = new Ammo.btVector3(0, 0, 0);
        shape.calculateLocalInertia(mass, localInertia);

        const motionState = new Ammo.btDefaultMotionState(transform);
        const rigidBodyInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
        const rigidBody = new Ammo.btRigidBody(rigidBodyInfo);

        physicsWorld.addRigidBody(rigidBody);

        return { rigidBody, shape }; // return both for further use
    }

    // creates a visual representation
    function createVisualObject(geometryType, position) {
        let geometry, material = new THREE.MeshPhongMaterial({color: Math.random() * 0xffffff});
        switch (geometryType) {
            case 'box':
                geometry = new THREE.BoxGeometry(2, 2, 2);
                break;
            case 'sphere':
                geometry = new THREE.SphereGeometry(1, 32, 32);
                break;
            default:
                console.warn('Unsupported geometryType:', geometryType);
                return;
        }

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(...position);
        scene.add(mesh);

        return mesh;
    }

    // converts screen coordinates to 3D world coordinates
    function getMousePositionInWorld(event) {
        const mouse = new THREE.Vector2(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        );

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);

        const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        const target = new THREE.Vector3();
        raycaster.ray.intersectPlane(planeZ, target);

        return target; // this is a THREE.Vector3
    }

    // function to add an object
    function addObject(geometryType, event, mass) {
        const position = getMousePositionInWorld(event).toArray();
        const physicsObject = createPhysicsShape(geometryType, position, mass);
        const visualObject = createVisualObject(geometryType, position);
        objects.push({ physicsObject, visualObject });
    }

    // update the event listener for adding objects
    window.addEventListener('click', (event) => {
        addObject('sphere', event, 1); // drop a sphere on click
    });

    // animation loop
    function animate() {
        requestAnimationFrame(animate);

        // update physics world
        physicsWorld.stepSimulation(1 / 60, 10);

        // sync visual objects with physics objects
        objects.forEach(obj => {
            const transform = new Ammo.btTransform();
            obj.physicsObject.rigidBody.getMotionState().getWorldTransform(transform);
            const position = transform.getOrigin();
            const quaternion = transform.getRotation();
            obj.visualObject.position.set(position.x(), position.y(), position.z());
            obj.visualObject.quaternion.set(quaternion.x(), quaternion.y(), quaternion.z(), quaternion.w());
        });

        renderer.render(scene, camera);
    }

    animate();
});
