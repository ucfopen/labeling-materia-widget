const canvas = document.getElementById('board');

const setAntialias = false;
const showWireframe = false;
const shapeShadows = false;
const sceneColor = 0xdddddd;

let numberOfLights = 2
const sphereRadius = .1;
const sphereWidthSegments = 8;
const sphereHeightSegments = 8;
const sphereColor = 0xffffff;

const boxWidth = 0.3;
const boxHeight = 0.3;
const boxLength = 0.3;
const boxColor = 0x00fff0;

let object;
const objScale = 1;
const manager = new THREE.LoadingManager(loadModel);
// const manager = new THREE.LoadingManager(getMTLandOBJRender);
manager.onProgress = function (item, loaded, total) { console.log(item, loaded, total); };

const mtlFileStr = '_models3D/male02/male02.mtl';
const objFileStr = '_models3D/male02/male02.obj';

const mtlLoader = new THREE.MTLLoader(manager);
const objLoader = new THREE.OBJLoader(manager);
let objDimensions = new THREE.Box3();
let objCenter = new THREE.Vector3();

let cameraPositionX = 0;
let cameraPositionY = 0;
let cameraPositionZ = 1;
// yTotal = yMax - Ymin;
// let cameraPositionZ = yTotal + (yTotal * 0.5);

let cameraLookAtX = objCenter.getComponent(0);
let cameraLookAtY = objCenter.getComponent(1);
let cameraLookAtZ = objCenter.getComponent(2);

function init() {
	var scene = new THREE.Scene();
	scene.background = new THREE.Color(sceneColor);

	var gui = new dat.GUI();

	var lightList = createLightEnvironment(scene);
	// var guiItems = createGUI(lightList, gui);

	var box = getBox(boxWidth, boxHeight, boxLength, boxColor);
	scene.add(box);

	getOBJRender(scene);
	// getMTLandOBJRender(scene);

	var camera = createCamera();
	var renderer = createRenderer();
	var controls = new THREE.OrbitControls(camera, renderer.domElement);
	// controls.target = new THREE.Vector3(cameraLookAtX, cameraLookAtY, cameraLookAtZ);
	canvas.appendChild(renderer.domElement);
	update(renderer, scene, camera, controls);
	return scene;
}

function update(renderer, scene, camera, controls) {
	controls.update();
	renderer.render(scene, camera);

	requestAnimationFrame(function () {
		update(renderer, scene, camera, controls);
	});

}

function printShotgun(str, obj) {
	console.log(str);
	console.log(obj);
}

function createCamera() {
	printShotgun('Ymax', objDimensions['max']['y']);
	// field of view || aspect ratio || near clipping plane || far clipping plane
	var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.set(cameraPositionX, cameraPositionY, cameraPositionZ);
	camera.lookAt(cameraLookAtX, cameraLookAtY, cameraLookAtZ);

	return camera;
}

function createRenderer() {
	renderer = new THREE.WebGLRenderer({ antialias: setAntialias, alpha: true });
	renderer.setSize(window.innerWidth / 1.05, window.innerHeight / 1.05);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.shadowMap.enabled = true;

	return renderer;
}

function getBox(boxWidth, boxHeight, boxLength, boxColor) {
	var mesh = new THREE.Mesh(
		new THREE.BoxGeometry(boxWidth, boxHeight, boxLength),
		new THREE.MeshLambertMaterial({ color: boxColor, wireframe: showWireframe, }),
	);

	mesh.castShadow = true;
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

function createLightEnvironment(scene) {
	var lightList = [];

	for (var index = 0; index < numberOfLights; index++) {
		lightList[index] = getDirectionalLight(1);
		var sphere = getSphere(sphereRadius, sphereWidthSegments, sphereHeightSegments, sphereColor);
		lightList[index].add(sphere);

		(index % 2) === 0 ? lightList[index].position.set(-25, 15, 15) : lightList[index].position.set(25, 15, -15);

		scene.add(lightList[index]);
	}

	return lightList;
}

function createGUI(lightList, gui) {
	for (var index = 0; index < numberOfLights; index++) {
		gui.add(lightList[index], 'intensity', 0, 10);
		gui.add(lightList[index].position, 'x', -50, 50);
		gui.add(lightList[index].position, 'y', -50, 50);
		gui.add(lightList[index].position, 'z', -50, 50);
	}
}

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

function loadModel() {
	// Textures shade can change based on the color level
	var materialComposition = getMaterialComposition('physical', 0xcccccc);

	object.traverse(function (child) {
		child.material = materialComposition;
		materialComposition.castShadow = true;
		materialComposition.side = THREE.FrontSide; // Render outer layer only
		materialComposition.wrapS = THREE.RepeatWrapping;
		materialComposition.wrapT = THREE.RepeatWrapping;
		materialComposition.magFilter = THREE.NearestFilter
		materialComposition.bumpScale = 0;
		// materialComposition.metalness = 0.1; // ONLY on STANDARD! 0 to 1.0 == PURE METAL item
		// materialComposition.roughness = 0.4; // ONLY on STANDARD! Smooth Mirror reflection == 0 to 1
		// materialComposition.shininess = 100; // Only on Phong! This is the opposite of shininess.
		materialComposition.wireframe = showWireframe;
		// materialComposition.map = new THREE.TextureLoader().load('_models3D/cerberus/Cerberus_A.jpg');
		// .depthTest
		// .depthWrite when when drawing a 2D overlays
	});

	return object;
}

// Render OBJ files.
function getOBJRender(scene) {
	// Create a invisible box that provides the dimensions of the obj.
	objLoader.load(
		objFileStr,
		function (obj) {
			object = obj;
			objDimensions.setFromObject(object);
			objDimensions.getCenter(objCenter);

			obj.position.sub(objCenter);
			obj.scale.x = objScale;
			obj.scale.y = objScale;
			obj.scale.z = objScale;
			scene.add(obj);

			printShotgun('objDimensions:', objDimensions);
			printShotgun('Ymax', objDimensions['max']['y']);
			printShotgun('objCenter:', objCenter);
		},
		onProgress,
		onError
	);
}

// Render OBJ files with there MLT files.
function getMTLandOBJRender(scene) {
	mtlLoader.load(
		mtlFileStr, function (mtl) {
			mtl.preload();
			objLoader.load(
				objFileStr, function (obj) {
					var box = new THREE.Box3().setFromObject(obj);
					var center = new THREE.Vector3();
					box.getCenter(center);
					obj.position.sub(center);
					object = obj;
					object.scale.x = objScale;
					object.scale.y = objScale;
					object.scale.z = objScale;
					scene.add(obj);
					printShotgun('object:', object);
				},
				onProgress,
				onError
			);
			objLoader.setMaterials(mtl);
		}
	);
}

function onProgress(xhr) {
	console.log('Model downloaded: ' + Math.round((xhr.loaded / xhr.total * 100), 2) + '% loaded');
};

function onError(error) {
	console.log('ERROR: ' + error);
};

var scene = init();
