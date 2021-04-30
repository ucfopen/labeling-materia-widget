
const setAntialias = false;
const showWireframe = false;
const shapeShadows = false;
const sceneColor = 0xdddddd;
const sphereRadius = 10;
const sphereWidthSegments = 8;
const sphereHeightSegments = 8;
const sphereColor = 0xffffff;
const boxWidth = 1;
const boxHeight = 1;
const boxLength = 1;
const boxColor = 0x00fff0;

var numberOfLights = 2
const canvas = document.getElementById('board');
const mouse = new THREE.Vector2();
const onClickPosition = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

// const mtlFileStr = '_models3D/male02/male02.mtl';
const objFileStr = '_models3D/male02/male02.obj';
// const mtlFileStr = '_models3D/female02/female02.mtl';
// const objFileStr = '_models3D/female02/female02.obj';
// const mtlFileStr = '_models3D/vroom/Audi_R8_2017.mtl';
// const objFileStr = '_models3D/vroom/Audi_R8_2017.obj';
// const objFileStr = '_models3D/cerberus/Cerberus.obj';
// const objFileStr = '_models3D/tree.obj';

// var object;
let objScale = 1;
// const manager = new THREE.LoadingManager(getMTLandOBJRender);
const manager = new THREE.LoadingManager();
manager.onProgress = function (item, loaded, total) { console.log(item, loaded, total); };
const mtlLoader = new THREE.MTLLoader(manager);
const objLoader = new THREE.OBJLoader(manager);

function init() {
	var scene = new THREE.Scene();
	var gui = new dat.GUI();
	var camera = createCamera();
	var renderer = createRenderer();
	var controls = new THREE.OrbitControls(camera, renderer.domElement);
	var container = new THREE.Object3D();
	container.name = 'myContainer';
	var objDimensions = new THREE.Box3();
	var objCenter = new THREE.Vector3();


	// var lightList = createLightEnvironment(scene);
	// var guiItems = createGUI(lightList, gui);

	scene.background = new THREE.Color(sceneColor);

	getBox(scene);
	getOBJRender(scene, camera, controls, container, objDimensions, objCenter);
	// getMTLandOBJRender(scene);

	objCenter.setX((objDimensions['max']['x'] + objDimensions['min']['x']) / 2);
	objCenter.setY((objDimensions['max']['y'] + objDimensions['min']['y']) / 2);
	objCenter.setZ((objDimensions['max']['z'] + objDimensions['min']['z']) / 2);

	canvas.appendChild(renderer.domElement);
	// canvas.addEventListener('mousemove', onMouseMove);
	update(scene, camera, renderer, controls);
	return scene;
}

// Updates values that need to be constantly re-render.
function update(scene, camera, renderer, controls) {
	controls.update();
	renderer.render(scene, camera);

	requestAnimationFrame(function () {
		update(scene, camera, renderer, controls);
	});
}

function onMouseMove(e) {

	e.preventDefault();

	var array = getMousePosition(canvas, e.clientX, e.clientY);
	onClickPosition.fromArray(array);

	var objMaterialLocation = scene.children['3'].children['0'];
	var intersects = getIntersects(onClickPosition, raycaster.intersectObjects(objMaterialLocation.children));

	// if (intersects.length > 0 && intersects[0].uv) {
	// 	const uv = intersects[0].uv;
	// 	// intersects[0].object.material.map.transformUv(uv);
	// 	intersects[0].object.material.color.set(0xff0000);
	// }
}

function getMousePosition(dom, x, y) {

	var rect = dom.getBoundingClientRect();
	var xPosition = (x - rect.left) / rect.width;
	var yPosition = (y - rect.top) / rect.height;
	return [xPosition, yPosition];
}

function getIntersects(point, objects) {

	mouse.x = (point.x * 2) - 1;
	mouse.y = - (point.y * 2) + 1;
	raycaster.setFromCamera(mouse, camera);
	return raycaster.intersectObjects(objects);
}

// function detectPosition(scene, camera, renderer, raycaster) {
// 	raycaster.setFromCamera(mouse, camera);

// 	var temp;
// 	// setTimeout(() => (temp = raycaster.intersectObjects(scene.children['3'].children['0'].children)), 2000);
// 	temp = raycaster.intersectObjects(scene.children['3'].children['0'].children);
// 	for (var i = 0; i < temp.length; i++) {
// 		temp['i'].object.material.color.set(0xff0000);
// 	}
// }

// used for troubleshooting
function printShotgun(str, data) {
	console.log(str);
	console.log(data);
}

// creates a perspective camera
function createCamera() {

	var fov = 45;
	var aspectRatio = window.innerWidth / window.innerHeight;
	var near = 1;
	var far = 1000;
	var camera = new THREE.PerspectiveCamera(fov, aspectRatio, near, far);
	camera.position.set(0, 0, 3);
	camera.lookAt(0, 0, 0);
	var flashLight = getDirectionalLight(1000);
	camera.add(flashLight);
	return camera;
}

// Create renderer using the window width and height
function createRenderer() {
	var renderer = new THREE.WebGLRenderer({ antialias: setAntialias, alpha: true });
	renderer.setSize(window.innerWidth / 1.05, window.innerHeight / 1.05);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.shadowMap.enabled = true;

	return renderer;
}

// Basic shapes used for troubleshooting.
function getBox(scene) {
	var mesh = new THREE.Mesh(
		new THREE.BoxGeometry(boxWidth, boxHeight, boxLength),
		new THREE.MeshLambertMaterial({ color: boxColor, wireframe: showWireframe, }),
	);
	mesh.name = 'TESTBox';
	mesh.castShadow = true;
	mesh.position.set(0, 0, 0);
	scene.add(mesh);
	return mesh;
}

function getSphere(sphereRadius, sphereWidthSegments, sphereHeightSegments, sphereColor) {
	var mesh = new THREE.Mesh(
		new THREE.SphereGeometry(sphereRadius, sphereWidthSegments, sphereHeightSegments),
		new THREE.MeshBasicMaterial({ color: sphereColor, wireframe: showWireframe, }),
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

// Returns a list of directional lights pointing at specific locations
function createLightEnvironment(scene) {
	var lightList = [];

	for (var index = 0; index < numberOfLights; index++) {
		lightList[index] = getDirectionalLight(1);
		var sphere = getSphere(sphereRadius, sphereWidthSegments, sphereHeightSegments, sphereColor);
		lightList[index].add(sphere);

		(index % 2) === 0 ? lightList[index].position.set(-25, 15, 15) : lightList[index].position.set(25, 15, -15);
		lightList[index].name = 'light ' + index;
		scene.add(lightList[index]);
	}

	return lightList;
}

// Returns a gui for controlling each directional light
function createGUI(lightList, gui) {
	for (var index = 0; index < numberOfLights; index++) {
		gui.add(lightList[index], 'intensity', 0, 10);
		gui.add(lightList[index].position, 'x', -50, 50);
		gui.add(lightList[index].position, 'y', -50, 50);
		gui.add(lightList[index].position, 'z', -50, 50);
	}
}

// Returns a material data type based on the parse values
function getMaterialComposition(type, color) {
	var selectedMaterial;
	var materialOptions = {
		color: color === undefined ? 0xffffff : color,
	};

	switch (type) {
		// Lower on the list equals more GPU demanding!
		// Keep in mind if ever doing mobiles.
		case 'basic':
			selectedMaterial = new THREE.MeshBasicMaterial(materialOptions);
			break;
		case 'lambert':
			// computes lighting only at vertices
			selectedMaterial = new THREE.MeshLambertMaterial(materialOptions);
			break;
		case 'phong':
			// computes lighting at every pixel
			// texture focus on shininess
			selectedMaterial = new THREE.MeshPhongMaterial(materialOptions);
			break;
		case 'standard':
			// textures focus on metalness & roughness
			selectedMaterial = new THREE.MeshStandardMaterial(materialOptions);
			break;
		case 'physical':
			// textures focus on clearcoat & clearCoatRoughness
			selectedMaterial = new THREE.MeshPhysicalMaterial(materialOptions);
			break;
		default:
			selectedMaterial = new THREE.MeshBasicMaterial(materialOptions);
			break;
	}

	return selectedMaterial;
}

// NEED TO BE ABLE TO EXPLAIN BETTER
// function loadModel() {
// 	// Textures shade can change based on the color level
// 	var materialComposition = getMaterialComposition('physical', 0xcccccc);

// 	object.traverse(function (child) {
// 		child.material = materialComposition;
// 		materialComposition.castShadow = true;
// 		materialComposition.side = THREE.FrontSide; // Render outer layer only
// 		materialComposition.wrapS = THREE.RepeatWrapping;
// 		materialComposition.wrapT = THREE.RepeatWrapping;
// 		materialComposition.magFilter = THREE.NearestFilter
// 		materialComposition.bumpScale = 0;
// 		// materialComposition.metalness = 0.1; // ONLY on STANDARD! 0 to 1.0 == PURE METAL item
// 		// materialComposition.roughness = 0.4; // ONLY on STANDARD! Smooth Mirror reflection == 0 to 1
// 		// materialComposition.shininess = 100; // Only on Phong! This is the opposite of shininess.
// 		materialComposition.wireframe = showWireframe;
// 		// materialComposition.map = new THREE.TextureLoader().load('_models3D/cerberus/Cerberus_A.jpg');
// 		// .depthTest
// 		// .depthWrite when when drawing a 2D overlays
// 	});

// 	return object;
// }


// RENDER file extension .obj, and centralizes it to the window.
// VARIABLES scene, camera, and control allow for the rendering and seeing of obj
// VARIABLES container, objDimensions, and objCenter contain and provide dimensions of
// obj. A invisible box contains the obj that provides depth, width, and heigh.
function getOBJRender(scene, camera, controls, container, objDimensions, objCenter) {
	// Textures shade can change based on the color level
	var materialComposition = getMaterialComposition('physical', 0x0000ff);
	objLoader.load(
		objFileStr,
		function (obj) {
			obj.scale.x = objScale;
			obj.scale.y = objScale;
			obj.scale.z = objScale;
			obj.name = 'myRenderObject';
			// obj.setMaterials(materialComposition);
			// Obtains the center point of obj
			objCenter = new THREE.Vector3();
			// Create invisible box with dimensions of obj.
			objDimensions.setFromObject(obj);
			// Get the center of the box
			objDimensions.getCenter(objCenter);

			// Gets the obj HEIGHT
			var totalHeight = objDimensions.getSize().y;

			// Matches the HEIGHT of the camera with the center of the box
			camera.position.y = objCenter.y;
			// Moves the camera in the positive
			camera.position.z = totalHeight + (totalHeight * 0.5);
			controls.target = objCenter;

			// Makes the render object a child of the container
			container.add(obj);

			// Produces ERROR object is not a instance of Object3D.
			// container.add(objDimensions);
			scene.add(container);
		},
		onProgress,
		onError
	);
}

// Render OBJ files with there MLT files.
function getMTLandOBJRender(scene, camera, controls, container, objDimensions, objCenter) {
	mtlLoader.load(
		mtlFileStr, function (mtl) {
			mtl.preload();
			objLoader.load(
				objFileStr,
				function (obj) {
					obj.scale.x = objScale;
					obj.scale.y = objScale;
					obj.scale.z = objScale;

					// Obtains the center point of obj
					objCenter = new THREE.Vector3();
					// Create invisible box with dimensions of obj.
					objDimensions.setFromObject(obj);
					// Get the center of the box
					objDimensions.getCenter(objCenter);

					// Gets the obj height
					var totalHeight = objDimensions.getSize().y;

					// Matches the HEIGHT of the camera with the center of the box
					camera.position.y = objCenter.y;
					// Moves the camera in the positive
					camera.position.z = totalHeight + (totalHeight * 0.5);
					controls.target = objCenter;

					// Makes the render object a child of the container
					container.add(obj);

					// Produces ERROR object is not a instance of Object3D.
					// container.add(objDimensions);
					scene.add(container);
				},
				onProgress,
				onError
			);
			objLoader.setMaterials(mtl);
		}
	);
}

// Returns a console log of the model % loaded
function onProgress(xhr) {
	console.log('Model downloaded: ' + Math.round((xhr.loaded / xhr.total * 100), 2) + '% loaded');
};

// Returns a console log ERROR when model doesn't load
function onError(error) {
	console.log('ERROR: ' + error);
};

var scene = init();
