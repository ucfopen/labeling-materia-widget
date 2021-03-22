
const canvas = document.getElementById('board');

const sceneTransparentColor = 0x000000;
const setAntialias = true;
const showWireframe = false;
const shapeShadows = true;

const coneRadius = .8;
const coneHeight = 1.5;
const coneRadialSegments = 4;
const coneHeightSegments = 128;

const rectangleWidth = .6;
const rectangleLength = .6;
const rectangleColor = 0x00cccc;

const cylinderRadius = .3;
const cylinderRadialSegments = 16;
const cylinderHeightSegments = 16;
const cylinderColor = 0x00cc00;

const cameraAxisX = 0;
const cameraAxisY = 0;
const cameraAxisZ = 5;

function init() {

	var numberOfLights = 2
	var lights = [numberOfLights];
	var lightCastShadow = true;
	var lightColor = 0xffffff;

	var coneColor = 0x00cccc;
	var coneAxisX = -2.5;
	var coneAxisY = 0;
	var coneAxisZ = 0;
	var coneRotateX = Math.PI / 2;
	var coneRotateY = 0;
	var coneRotateZ = Math.PI / 2;

	var rectangleHeight = 4;
	var rectangleAxisX = 0;
	var rectangleAxisY = 0;
	var rectangleAxisZ = 0;
	var rectangleRotateX = Math.PI / 2;
	var rectangleRotateY = 0;
	var rectangleRotateZ = 0;

	var cylinderLength = 4;
	var cylinderAxisX = 0;
	var cylinderAxisY = -1;
	var cylinderAxisZ = 0;
	var cylinderRotateX = 0;
	var cylinderRotateY = 0;
	var cylinderRotateZ = 0;

	var scene = new THREE.Scene();

	// Add Light enviroment
	var light = getAmbientLight(1);
	scene.add(light);

	// Call SHAPES to be generated
	var rectangle = getBox(rectangleWidth, rectangleHeight, rectangleLength, rectangleColor);
	rectangle.position.set(0, 0, 0);
	var cone = getCone(coneRadius, coneHeight, coneRadialSegments, coneHeightSegments, coneColor);
	rectangle.add(cone);
	scene.add(rectangle);
	// ----------------------------------

	var cameraDimensions = 10;
	var camera = new THREE.OrthographicCamera(
		-cameraDimensions,
		cameraDimensions,
		cameraDimensions,
		-cameraDimensions,
		1,
		1000
	);
	camera.position.set(0, 0, 0);
	// camera.lookAt(new THREE.Vector3(0, 0, 0));

	var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
	renderer.setClearColor(0x000000, 0);
	renderer.setPixelRatio(window.devicePixelRatio);
	// renderer.shadowMap.enabled = true;
	renderer.setSize(canvas.offsetWidth - 1, canvas.offsetHeight - 1);

	canvas.appendChild(renderer.domElement);

	animate(renderer, scene, camera);
}

function getBox(rectangleWidth, rectangleHeight, rectangleLength, rectangleColor) {
	var mesh = new THREE.Mesh(
		new THREE.BoxGeometry(rectangleWidth, rectangleHeight, rectangleLength),
		new THREE.MeshBasicMaterial({ color: rectangleColor, wireframe: false, }),
	);

	mesh.castShadow = true;
	return mesh;
}

function getCone(coneRadius, coneHeight, coneRadialSegments, coneHeightSegments, coneColor) {
	var mesh = new THREE.Mesh(
		new THREE.ConeGeometry(coneRadius, coneHeight, coneRadialSegments, coneHeightSegments),
		new THREE.MeshPhongMaterial({ color: coneColor, wireframe: false, }),
	);

	mesh.castShadow = true;
	return mesh;
}

function getAmbientLight(intensity) {
	var light = new THREE.AmbientLight(0xffffff, intensity);

	return light;
}

// Updates the browser to allow for animation.
function animate(renderer, scene, camera) {
	renderer.render(
		scene,
		camera
	);

	requestAnimationFrame(function () {
		animate(renderer, scene, camera);
	});
}

var scene = init();