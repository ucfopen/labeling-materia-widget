
function init() {
	const sceneTransparentColor = 0x000000
	const setAntialias = true;

	const cameraAxisX = 0;
	const cameraAxisY = 0;
	const cameraAxisZ = 5;

	const numberOfLights = 2
	const lights = [numberOfLights];
	const lightCastShadow = true;
	var lightColor = 0xffffff;

	const showWireframe = false;
	const shapeShadows = true;

	const coneRadius = .8;
	const coneHeight = 1.5;
	const coneRadialSegments = 4;
	const coneHeightSegments = 128;
	const coneColor = 0x00cccc;
	var coneAxisX = -2.5;
	var coneAxisY = 0;
	var coneAxisZ = 0;
	var coneRotateX = Math.PI / 2;
	var coneRotateY = 0;
	var coneRotateZ = Math.PI / 2;

	const rectangleWidth = .6;
	var rectangleHeight = 4;
	const rectangleLength = .6;
	const rectangleColor = 0x00cccc;
	var rectangleAxisX = 0;
	var rectangleAxisY = 0;
	var rectangleAxisZ = 0;
	var rectangleRotateX = Math.PI / 2;
	var rectangleRotateY = 0;
	var rectangleRotateZ = 0;

	const cylinderRadius = .3;
	var cylinderLength = 4;
	const cylinderRadialSegments = 16;
	const cylinderHeightSegments = 16;
	const cylinderColor = 0x00cc00;
	var cylinderAxisX = 0;
	var cylinderAxisY = -1;
	var cylinderAxisZ = 0;
	var cylinderRotateX = 0;
	var cylinderRotateY = 0;
	var cylinderRotateZ = 0;

	var scene = new THREE.Scene();

	// Call SHAPES to be generated

	// ----------------------------------

	var cameraDimensions = 10;
	const camera = new THREE.OrthographicCamera(
		-cameraDimensions,
		cameraDimensions,
		cameraDimensions,
		-cameraDimensions,
		-cameraDimensions * 4,
		cameraDimensions * 4
	);
	camera.position.set(0, 0, 5);
	// camera.lookAt(new THREE.Vector3(0, 0, 0));

	// const canvas =
	// 	document.getElementById('board').appendChild(renderer.domElement);
	// canvas.setAttribute('id', '3D');

	var renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.shadowMap.enabled = true;
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setClearColor(0xffffff);
	document.getElementById('webgl').appendChild(renderer.domElement);

	var controls = new THREE.OrbitControls(camera, renderer.domElement);

	animate(renderer, scene, camera, controls);
}

function getBox(rectangleWidth, rectangleHeight, rectangleLength) {
	var mesh = new THREE.Mesh(
		new THREE.BoxGeometry(w, h, d),
		new THREE.MeshPhongMaterial({ color: 0xbbbbbb, wireframe: false, }),
	);

	mesh.castShadow = true;
	return mesh;
}

// Create a grid of boxes of AREA = amount * amount
function getBoxGrid(amount, separationMultiplier) {
	var group = new THREE.Group();

	for (var index = 0; index < amount; index++) {
		var obj = getBox(1, 1, 1);
		obj.position.x = index * separationMultiplier;
		obj.position.y = obj.geometry.parameters.height / 2;
		group.add(obj);

		for (var cnt = 0; cnt < amount; cnt++) {
			var obj = getBox(1, 1, 1);
			obj.position.x = index * separationMultiplier;
			obj.position.y = obj.geometry.parameters.height / 2;
			obj.position.z = cnt * separationMultiplier;

			group.add(obj);
		}
	}

	group.position.x = -(separationMultiplier * (amount - 1)) / 2;
	group.position.y = 0;
	group.position.z = -(separationMultiplier * (amount - 1)) / 2;

	return group;
}

function getPlane(size) {
	var mesh = new THREE.Mesh(
		new THREE.PlaneGeometry(size, size),
		new THREE.MeshPhongMaterial({ color: 0xbbbbbb, wireframe: false, side: THREE.DoubleSide, }),
	);

	mesh.receiveShadow = true;
	return mesh;
}

function getSphere(radius) {
	var mesh = new THREE.Mesh(
		new THREE.SphereGeometry(radius, 24, 24),
		new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: false, }),
	);

	return mesh;
}

// Updates the browser to allow for animation.
function animate(renderer, scene, camera, controls) {
	renderer.render(
		scene,
		camera
	);

	controls.update();

	// var timeElapsed = clock.getElapsedTime();
	// var boxGrid = scene.getObjectByName('boxGrid');

	// boxGrid.children.forEach(function (child, index) {
	// 	var x = timeElapsed * 2 + index;
	// 	child.scale.y = (noise.simplex2(x, x) + 1) / 2 + 0.001;

	// 	// Get a random unique value between 0 and pi/2, to that number we add
	// 	//0.001 so it's not exactly flushed with the plane.
	// 	// child.scale.y = (Math.sin(timeElapsed * 2 + index) + 1) / 2 + 0.001;
	// 	child.position.y = child.scale.y / 2;
	// });

	requestAnimationFrame(function () {
		update(renderer, scene, camera, controls);
	});
}

var scene = init();