
// Namespace('Labeling').Draw3D = ((() => ({
// 	drawLine3D(x1, y1, x2, y2, width, color) {

const canvas = document.getElementById('board');

const sceneTransparentColor = 0x000000;
const setAntialias = false;
const showWireframe = false;
const shapeShadows = true;

const coneRadius = 1;
const coneHeight = 2;
const coneRadialSegments = 4;
const coneHeightSegments = 8
const coneColor = 0xffffff;

const cylinderRadius = .5;
const cylinderRadialSegments = 8;
const cylinderHeightSegments = 8;
const cylinderColor = 0xffffff;

const cameraAxisX = 0;
const cameraAxisY = 0;
const cameraAxisZ = 5;

const numberOfArrows = 4

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
	var cylinder = getCylinder(cylinderRadius, cylinderLength, cylinderRadialSegments, cylinderHeightSegments, cylinderColor);
	var cone = getCone(coneRadius, coneHeight, coneRadialSegments, coneHeightSegments, coneColor);
	cylinder.add(cone);
	cylinder.name = 'arrow';
	cylinder.position.set(15, 0, 0);
	cone.rotation.y += .3;

	// SHAPE POINTING DIRECTION /////////////////////////////////////////////
	if (cylinder.position.y >= 0) {
		cone.position.y = cylinder.geometry.parameters.height / 1.7;
	} else if (cylinder.position.y < 0) {
		cone.rotation.z += Math.PI;
		cone.position.y = -cylinder.geometry.parameters.height / 1.7; // Positive Y
	} else {
		cone.position.y = cylinder.geometry.parameters.height / 1.7; // Positive Y
	}


	////////////////////////////////////////////////////////////////////////////////////////////////

	var arrow = scene.getObjectByName('arrow');

	var arrowList = generateArrows(numberOfArrows, cylinderLength);
	console.log(arrowList);

	for (var index = 0; index < numberOfArrows; index++) {
		scene.add(arrowList[index]);
	}

	scene.add(cylinder);

	// var child = arrow.children[0].geometry.parameters.height;
	// printShotgun(child);
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

	animate(renderer, scene, camera, light);
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


function generateArrows(numberOfArrows, cylinderLength) {

	var index;
	var time = Date.now() * 0.0005;
	var arrowList = [numberOfArrows];

	for (index = 0; index < numberOfArrows; index++) {
		arrowList[index] = getCylinder(cylinderRadius, cylinderLength, cylinderRadialSegments, cylinderHeightSegments, cylinderColor);
		var cone2 = getCone(coneRadius, coneHeight, coneRadialSegments, coneHeightSegments, coneColor);

		if (index % 2 == 0) {
			arrowList[index].position.x = Math.floor(Math.random() * 10);
			arrowList[index].position.y = Math.floor(Math.random() * 10);
		} else {
			arrowList[index].position.x = -Math.floor(Math.random() * 10);
			arrowList[index].position.y = -Math.floor(Math.random() * 10);
		}

		// if (arrowList[index].y >= 0) {
		// 	cone.position.y = arrowList[index].geometry.parameters.height / 1.7;
		// }
		// else if (arrowList[index].y < 0) {
		// 	cone.rotation.z += Math.PI;
		// 	cone.position.y = -arrowList[index].geometry.parameters.height / 1.7; // Positive Y
		// }
		// else {
		// 	cone.position.y = arrowList[index].geometry.parameters.height / 1.7; // Positive Y
		// }

		cone2.rotation.y += .3;
		arrowList[index].add(cone2);
	}

	return arrowList;
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
	// arrow.geometry.verticesNeedUpdate = true;
}

function printShotgun(arrow) {
	console.log(arrow);
}

// Updates the browser to allow for animation.
function animate(renderer, scene, camera, light) {
	renderer.render(
		scene,
		camera
	);

	dynamicLights(light);

	// stretchArrowBody(arrow);
	// printShotgun(arrow);

	requestAnimationFrame(function () {
		// arrow.geometry.verticesNeedUpdate = true;
		animate(renderer, scene, camera, light);
	});
}

var scene = init();

		// })))();

// 	}

// })))();