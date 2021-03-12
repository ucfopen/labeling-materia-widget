

// I HAVE TO FIGURE OUT HOW TO MAKE THIS FILE WAIT UNTIL PLAYER.JS FINISHES LOADING.
// window.onload = init;
console.log('Beginning of draw3D.js');

const scene = new THREE.Scene();
// scene.background = new THREE.Color(0xcccccc);
let cameraDimensions = 10;
const camera = new THREE.OrthographicCamera(
	-cameraDimensions,
	cameraDimensions,
	cameraDimensions,
	-cameraDimensions,
	-cameraDimensions * 4,
	cameraDimensions * 4
);
camera.position.set(0, 0, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setClearColor(0x000000, 0);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const canvas =
	document.getElementById('board').appendChild(renderer.domElement);
canvas.setAttribute('id', '3D');

// BoxGeometry(x, y, z)
// BoxGeometry(length, width, height)
const geometryRectangle = new THREE.BoxGeometry(0.5, 0.5, 4);
const materialBox = new THREE.MeshBasicMaterial({ color: 0x000ccc, wireframe: false });
const cube = new THREE.Mesh(geometryRectangle, materialBox);
cube.castShadow = true;
cube.receiveShadow = false;
cube.position.set(0, 0, 0);
cube.rotation.x += 0;
cube.rotation.y += 0;
cube.rotation.z += 5;
// scene.add(cube);

// CylinderGeometry(radiusTop, radiusBottom, height, radialSegments, heightSegments)
const geometryCylinder = new THREE.CylinderGeometry(.3, .3, 4, 16, 16);
const materialCylinder = new THREE.MeshBasicMaterial({ color: 0x00cccc, wireframe: false });
const cylinder = new THREE.Mesh(geometryCylinder, materialCylinder);
cylinder.castShadow = true;
cylinder.receiveShadow = false;
cylinder.position.set(0, 4.5, 0);
cylinder.rotation.x += 0;

scene.add(cylinder);

// ConeGeometry(radius, height, radialSegments, heightSegments)
const geometryCone = new THREE.ConeGeometry(.8, 1.5, 16);
const materialCone = new THREE.MeshBasicMaterial({ color: 0x00cccc, wireframe: false });
const cone = new THREE.Mesh(geometryCone, materialCone);
cone.castShadow = true;
cone.receiveShadow = false;
cone.position.set(0, 7, 0);
scene.add(cone);

const animate = function () {
	requestAnimationFrame(animate);
	// cone.rotation.x += 0.01;
	// cone.rotation.y += 0.01;
	// cylinder.rotation.x += 0.01;
	// cylinder.rotation.y += 0.01;

	renderer.render(scene, camera);
}

animate();

console.log('Ending of draw3D.js');
