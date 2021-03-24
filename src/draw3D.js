
const canvas = document.getElementById('board');

const sceneTransparentColor = 0x000000;
const setAntialias = false;
const showWireframe = true;
const shapeShadows = true;

const coneRadius = 1;
const coneHeight = 1;
const coneRadialSegments = 4;
const coneHeightSegments = 8
const coneColor = 0xffffff;

const rectangleWidth = 1;
const rectangleLength = 1;
const rectangleColor = 0x00cccc;

const cylinderRadius = .5;
const cylinderRadialSegments = 16;
const cylinderHeightSegments = 16;
const cylinderColor = 0xffffff;

const cameraAxisX = 0;
const cameraAxisY = 0;
const cameraAxisZ = 5;

function init() {

	var numberOfLights = 2
	var lights = [numberOfLights];
	var lightCastShadow = true;
	var lightColor = 0xffffff;

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

	var cylinderLength = 6;
	var cylinderAxisX = 0;
	var cylinderAxisY = -1;
	var cylinderAxisZ = 0;
	var cylinderRotateX = 0;
	var cylinderRotateY = 0;
	var cylinderRotateZ = 0;

	var scene = new THREE.Scene();

	// Add Light environment
	var light = getDirectionalLight(1);
	light.name = 'directionalLight';
	light.position.set(0, 0, 15);
	scene.add(light);

	// Call SHAPES to be generated
	var rectangle = getBox(rectangleWidth, rectangleHeight, rectangleLength, rectangleColor);
	var cylinder = getCylinder(cylinderRadius, cylinderLength, cylinderRadialSegments, cylinderHeightSegments, cylinderColor);
	var cone = getCone(coneRadius, coneHeight, coneRadialSegments, coneHeightSegments, coneColor);
	cylinder.name = 'arrow';
	cylinder.position.set(6, 0, 0);
	cone.rotation.y += .3;
	cone.position.x += 1;

	if (cylinder.position.y > 0 || cylinder.position.y == 0) {
		cone.position.y = cylinder.position.y / 2.3; // Positive Y
	}
	if (cylinder.position.y < 0) {
		cone.rotation.z += Math.PI;
		cone.position.y = cylinder.position.y / 2.3; // Positive Y
	}

	cylinder.add(cone);
	scene.add(cylinder);

	var arrow = scene.getObjectByName('arrow');
	// arrow.children[0].geometry.parameters.height = 5;
	// var child = arrow.children[0].geometry.parameters.height;

	printShotgun(arrow);
	// ----------------------------------

	var cameraDimensions = 15;
	var camera = new THREE.OrthographicCamera(
		-cameraDimensions,
		cameraDimensions,
		cameraDimensions,
		-cameraDimensions,
		1,
		1000
	);
	camera.position.set(0, 0, 2);

	var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
	renderer.setClearColor(0x000000, 0);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.shadowMap.enabled = true;
	renderer.setSize(canvas.offsetWidth - 1, canvas.offsetHeight - 1);
	canvas.appendChild(renderer.domElement);

	animate(renderer, scene, camera, arrow, light);
}

function getBox(rectangleWidth, rectangleHeight, rectangleLength, rectangleColor) {
	var mesh = new THREE.Mesh(
		new THREE.BoxGeometry(rectangleWidth, rectangleHeight, rectangleLength),
		new THREE.MeshPhongMaterial({ color: rectangleColor, wireframe: showWireframe, }),
	);

	mesh.castShadow = true;
	return mesh;
}

function getCylinder(cylinderRadius, cylinderLength, cylinderRadialSegments, cylinderHeightSegments, cylinderColor) {
	var mesh = new THREE.Mesh(
		new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, cylinderLength, cylinderRadialSegments, cylinderHeightSegments),
		new THREE.MeshPhongMaterial({ color: cylinderColor, wireframe: showWireframe, }),
	);

	mesh.castShadow = true;
	return mesh;
}

function getCone(coneRadius, coneHeight, coneRadialSegments, coneHeightSegments, coneColor) {
	var mesh = new THREE.Mesh(
		new THREE.ConeGeometry(coneRadius, coneHeight, coneRadialSegments, coneHeightSegments),
		new THREE.MeshPhongMaterial({ color: coneColor, wireframe: showWireframe, }),
	);

	mesh.castShadow = true;
	return mesh;
}

function getAmbientLight(intensity) {
	var light = new THREE.AmbientLight(0xffffff, intensity);

	return light;
}


function getDirectionalLight(intensity) {
	var light = new THREE.DirectionalLight(0xffffff, intensity);
	light.castShadow = true;

	return light;
}

function dynamicLights(light) {
	var time = Date.now() * 0.0005;
	light.position.x = Math.sin(time * 0.7) * 20;
	light.position.y = Math.cos(time * 0.5) * 25;
}

function stretchArrowBody(arrow) {
	return arrow.geometry.parameters.height += 0.1;
	arrow.geometry.verticesNeedUpdate = true;
}

function printShotgun(arrow) {
	console.log(arrow);
}

// Updates the browser to allow for animation.
function animate(renderer, scene, camera, arrow, light) {
	renderer.render(
		scene,
		camera
	);

	dynamicLights(light);

	stretchArrowBody(arrow);
	// printShotgun(arrow);

	requestAnimationFrame(function () {
		arrow.geometry.verticesNeedUpdate = true;
		animate(renderer, scene, camera, arrow, light);
	});
}

var scene = init();