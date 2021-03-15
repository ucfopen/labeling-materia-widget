

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

// Point light
const numberOfLights = 5
const lights = [numberOfLights];

for (index = 0; index <= numberOfLights; index++) {
	lights[index] = new THREE.PointLight(0xffffff, 1.2, 100);
	lights[index].castShadow = true;
}

for (index = 0; index <= numberOfLights; index++) {
	scene.add(lights[index]);
}

// Top 3 lights
lights[0].position.set(8, 8, 0);
lights[1].position.set(-5, 8, -8);
lights[2].position.set(-5, 8, 8);

// // Bottom 3 lights
// lights[3].position.set(8, -8, 0);
// lights[4].position.set(-5, -8, -8);
// lights[5].position.set(-5, -8, 8);

// dynamic moving lighting
function dynamicLighting() {
	var time = Date.now() * 0.0005;
	lights[0].position.x = Math.sin(time * 0.7) * 30;
	lights[0].position.y = Math.cos(time * 0.5) * 40;
	lights[0].position.z = Math.cos(time * 0.3) * 30;

	lights[1].position.x = Math.cos(time * 0.3) * 30;
	lights[1].position.y = Math.sin(time * 0.5) * 40;
	lights[1].position.z = Math.sin(time * 0.7) * 30;
}

let rectangleX = 0.5;
let rectangleY = 3;
let rectangleZ = 1;

// BoxGeometry(x, y, z)
// BoxGeometry(length, width, height)
const rectangle = new THREE.Mesh(
	new THREE.BoxGeometry(rectangleX, rectangleY, rectangleZ),
	new THREE.MeshLambertMaterial({ color: 0xffffff, wireframe: false }),
);
rectangle.castShadow = true;
rectangle.receiveShadow = true;
rectangle.position.set(0, 0, 0);
rectangle.rotation.x += 0;
rectangle.rotation.y += Math.cos(45);
// rectangle.rotation.z += Math.sin(45);
scene.add(rectangle);

// CylinderGeometry(radiusTop, radiusBottom, height, radialSegments, heightSegments)
const cylinder = new THREE.Mesh(
	new THREE.CylinderGeometry(.3, .3, 4, 16, 16),
	new THREE.MeshLambertMaterial({ color: 0x00cccc, wireframe: false })
);
cylinder.castShadow = true;
cylinder.receiveShadow = true;
cylinder.position.set(0, 4.5, 0);
cylinder.rotation.x += 0;

// ConeGeometry(radius, height, radialSegments, heightSegments)
const cone = new THREE.Mesh(
	new THREE.ConeGeometry(.8, 1.5, 4),
	new THREE.MeshLambertMaterial({ color: 0x00cccc, wireframe: false }),
);
cone.castShadow = true;
cone.receiveShadow = true;
cone.position.set(0, 7, 0);

const arrow = new THREE.Group();
arrow.add(cone);
arrow.add(cylinder);
scene.add(arrow);
// const object = new THREE.Mesh(geometryRectangle, new THREE.MeshBasicMaterial(0x000000));
// const box = new THREE.BoxHelper(object, 0x000000);
// scene.add(box);

const animate = function () {
	requestAnimationFrame(animate);
	// cone.rotation.x += 0.01;
	// cone.rotation.y += 0.01;
	// cylinder.rotation.x += 0.01;
	// cylinder.rotation.y += 0.01;
	// dynamicLighting();
	renderer.render(scene, camera);
}

animate();

console.log('Ending of draw3D.js');
