
const canvas = document.getElementById('board');

const setAntialias = false;
const showWireframe = false;
const shapeShadows = false;
const sceneColor = 0xdddddd;

const cameraPositionX = 0;
const cameraPositionY = 0;
const cameraPositionZ = 10;
const cameraLookAtX = 0;
const cameraLookAtY = 0;
const cameraLookAtZ = 0;

let numberOfLights = 2
const sphereRadius = .1;
const sphereWidthSegments = 8;
const sphereHeightSegments = 8;
const sphereColor = 0xffffff;

const boxWidth = 1;
const boxHeight = 1;
const boxLength = 1;
const boxColor = 0x00fff0;

const mtlFileStr = 'assets/obj/male02/male02.mtl';
const objFileStr = '_models3D/cerberus/Cerberus.obj';

const loader = new THREE.TextureLoader();
const mtlLoader = new THREE.MTLLoader();
const objLoader = new THREE.OBJLoader();

const gui = new dat.GUI();
const scene = new THREE.Scene();
scene.background = new THREE.Color(sceneColor);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(cameraPositionX, cameraPositionY, cameraPositionZ);
camera.lookAt(cameraLookAtX, cameraLookAtY, cameraLookAtZ);

const renderer = new THREE.WebGLRenderer({ antialias: setAntialias, alpha: true });
renderer.setSize(window.innerWidth / 1.05, window.innerHeight / 1.05);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.target = new THREE.Vector3(cameraLookAtX, cameraLookAtY, cameraLookAtZ);
controls.update();

var box = getBox(boxWidth, boxHeight, boxLength, boxColor);
scene.add(box);

createLightEnvironment();

getOBJRender();
// getMTLandOBJRender();
canvas.appendChild(renderer.domElement);

const animate = function () {
	requestAnimationFrame(animate);
	controls.update();
	renderer.render(scene, camera);
};

function printShotgun(obj) {
	console.log(obj);
};

function getBox(boxWidth, boxHeight, boxLength, boxColor) {
	var mesh = new THREE.Mesh(
		new THREE.BoxGeometry(boxWidth, boxHeight, boxLength),
		new THREE.MeshLambertMaterial({ color: boxColor, wireframe: showWireframe, }),
	);

	mesh.castShadow = true;
	return mesh;
};

function getSphere(sphereRadius, sphereWidthSegments, sphereHeightSegments, sphereColor) {
	var mesh = new THREE.Mesh(
		new THREE.SphereGeometry(sphereRadius, sphereWidthSegments, sphereHeightSegments),
		new THREE.MeshBasicMaterial({ color: sphereColor, wireframe: showWireframe, }),
	);

	mesh.castShadow = true;
	return mesh;
};

function getAmbientLight(intensity) {
	var light = new THREE.AmbientLight(0xffffff, intensity);

	return light;
};

function getDirectionalLight(intensity) {
	var light = new THREE.DirectionalLight(0xffffff, intensity);
	light.castShadow = true;

	return light;
};

function createLightEnvironment() {
	var lightList = [];

	for (var index = 0; index < numberOfLights; index++) {
		lightList[index] = getDirectionalLight(1);
		var sphere = getSphere(sphereRadius, sphereWidthSegments, sphereHeightSegments, sphereColor);
		lightList[index].add(sphere);

		(index % 2) === 0 ? lightList[index].position.set(-25, 15, 15) : lightList[index].position.set(25, 15, -15);

		gui.add(lightList[index], 'intensity', 0, 10);
		gui.add(lightList[index].position, 'x', -50, 50);
		gui.add(lightList[index].position, 'y', -50, 50);
		gui.add(lightList[index].position, 'z', -50, 50);

		scene.add(lightList[index]);
	}
};

function getOBJRender() {
	objLoader.load(objFileStr, (root) => {
		root.scale.x = 5;
		root.scale.y = 5;
		root.scale.z = 5;
		scene.add(root);
	},
		onProgress,
		onError
	);
}

function getMTLandOBJRender() {
	mtlLoader.load(mtlFileStr, (mtl) => {
		mtl.preload();
		objLoader.setMaterials(mtl);
		objLoader.load(objFileStr, (root) => {
			scene.add(root);
		},
			onProgress,
			onError);
	});
};

function onProgress(xhr) {
	console.log('Model downloaded: ' + Math.round((xhr.loaded / xhr.total * 100), 2) + '% loaded');
};

function onError(error) {
	console.log('ERROR: Rendering Model');
};

animate();