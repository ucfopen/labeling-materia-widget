// const mtlFileStr = '_models3D/male02/male02.mtl';
const objFileStr = '_models3D/male02/male02.obj';
// const mtlFileStr = '_models3D/female02/female02.mtl';
// const objFileStr = '_models3D/female02/female02.obj';
// const mtlFileStr = '_models3D/vroom/Audi_R8_2017.mtl';
// const objFileStr = '_models3D/vroom/Audi_R8_2017.obj';
// const objFileStr = '_models3D/cerberus/Cerberus.obj';
// const objFileStr = '_models3D/tree.obj';

const setAntialias = true;
const showWireframe = false;
const shapeShadows = false;
const sceneColor = 0xdddddd;

const canvas = document.getElementById('board');
const pickPosition = { x: 0, y: 0 };

// var object;
const objScale = 1;
// const manager = new THREE.LoadingManager(getMTLandOBJRender);
const manager = new THREE.LoadingManager();
manager.onProgress = function (item, loaded, total) { console.log(item, loaded, total); };
const mtlLoader = new THREE.MTLLoader(manager);
const objLoader = new THREE.OBJLoader(manager);

function main() {
	// canvas.offsetWidth = 605 & canvas.offsetHeight = 551
	// window.innerWidth = 800 & window.innerHeight = 601

	const scene = new THREE.Scene();
	scene.name = 'scene';
	scene.background = new THREE.Color(sceneColor);

	const renderer = new THREE.WebGLRenderer({ antialias: setAntialias, alpha: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	canvas.appendChild(renderer.domElement);


	// *************** ORTHOGRAPHIC CAMERA
	// const frustumSize = 1000;
	// const aspect = window.innerWidth / window.innerHeight;
	// var leftBorder = frustumSize * aspect / -2;
	// var rightBorder = frustumSize * aspect / 2;
	// var topBorder = frustumSize / 2;
	// var bottomBorder = frustumSize / -2;
	// var nearCamera = 1;
	// var farCamera = 1000;
	// const camera = new THREE.OrthographicCamera(leftBorder, rightBorder, topBorder, bottomBorder, nearCamera, farCamera);

	// *************  PERSPECTIVE CAMERA
	var fov = 45;
	var aspect = canvas.offsetWidth / canvas.offsetHeight;  // the canvas default
	var near = 1;
	var far = 1000;
	const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

	camera.name = 'camera';
	camera.position.set(0, 0, 1);
	camera.add(getDirectionalLight(1));

	const controls = new THREE.OrbitControls(camera, renderer.domElement);

	// Place the camera stand on a pole and move the pole around the scene.
	const cameraPole = new THREE.Object3D();
	cameraPole.name = 'cameraPole';
	cameraPole.add(camera);
	scene.add(cameraPole);

	const objDimensions = new THREE.Box3();
	const objCenter = new THREE.Vector3();

	var cube = getBox();
	scene.add(cube);

	getOBJRender(scene, camera, controls, objDimensions, objCenter);

	resizeRendererToDisplaySize(renderer);

	var pickHelper = new PickHelper(scene, camera);
	clearPickPosition();

	function render(time) {
		time *= 0.001;  // convert from minutes to seconds;

		if (resizeRendererToDisplaySize(renderer)) {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
		}

		cameraPole.rotation.y = time * .1;
		pickHelper.pick(pickPosition, scene, camera, time);
		controls.update(); // Movement of camera
		renderer.render(scene, camera);
		requestAnimationFrame(render);
	} // End of render()

	printShotgun('scene', scene);
	requestAnimationFrame(render);

	function getCanvasRelativePosition(event) {
		// (rect.left * 0.5) and (rect.top * 0.5) were added to align the website to the 3D world.
		var rect = canvas.getBoundingClientRect();
		return {
			x: (event.clientX - rect.left + (rect.left * 0.5)) * canvas.offsetWidth / rect.width,
			y: (event.clientY - rect.top + (rect.top * 0.5)) * canvas.offsetHeight / rect.height,
		};
	} // End of getCanvasRelativePosition()

	function setPickPosition(event) {
		var pos = getCanvasRelativePosition(event);
		pickPosition.x = (pos.x / window.innerWidth) * 2 - 1;
		pickPosition.y = (pos.y / window.innerHeight) * -2 + 1;  // note we flip Y
		// console.log(pickPosition.x)
	} // End of setPickPosition()

	// Enable detection & placement of mouse.
	window.addEventListener('mousemove', setPickPosition);

	// Clear the raycaster detection if mouse outside of clipping region.
	window.addEventListener('mouseout', clearPickPosition);
	window.addEventListener('mouseleave', clearPickPosition);

	// Enable touch to start
	window.addEventListener('touchstart', (event) => {
		// prevent the window from scrolling
		event.preventDefault();
		setPickPosition(event.touches[0]);
	}, { passive: false });

	// Enable touch to move
	window.addEventListener('touchmove', (event) => {
		setPickPosition(event.touches[0]);
	});

	window.addEventListener('touchend', clearPickPosition);
}// END OF MAIN()

// Raycaster
function clearPickPosition() {
	// Stop picking if the user doesn't move the mouse
	pickPosition.x = -100000;
	pickPosition.y = -100000;
} // End of clearPickPosition()

function resizeRendererToDisplaySize(renderer) {
	// canvas.offsetWidth = 605 & canvas.offsetHeight = 551
	// window.innerWidth = 800 & window.innerHeight = 601

	// DIVIDING window.innerWidth / 1.32 & window.innerHeight / 1.09 will center the scene.
	var width = window.innerWidth / 1.32;
	var height = window.innerHeight / 1.09;
	var needResize = canvas.offsetWidth !== width || canvas.offsetHeight !== height;

	if (needResize)
		renderer.setSize(width, height, false);

	return needResize;
} // End of resizeRendererToDisplaySize()

class PickHelper {
	constructor(scene, camera) {
		this.raycaster = new THREE.Raycaster();
		this.pickedObject = null;
		this.pickedObjectSavedColor = 0;
		this.scene = scene;
		this.camera = camera;
	}
	pick(normalizedPosition, scene, camera, time) {
		// restore the color if there is a picked object
		if (this.pickedObject) {
			this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
			this.pickedObject = undefined;
		}

		// cast a ray through the frustum
		this.raycaster.setFromCamera(normalizedPosition, camera);
		// get the list of objects the ray intersected
		var intersectedObjects = this.raycaster.intersectObjects(scene.children);
		if (intersectedObjects.length) {
			// pick the first object. It's the closest one
			this.pickedObject = intersectedObjects[0].object;
			// save its color
			this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex();
			// set its emissive color to flashing red/yellow
			this.pickedObject.material.emissive.setHex((time * 1.5) % 2 > 1 ? 0xFFFF00 : 0xFF0000);
		}
	}
} // End of CLASS PickHelper

function getDirectionalLight(intensity) {
	var light = new THREE.DirectionalLight(0xffffff, intensity);
	light.name = 'directionalLight';
	light.castShadow = true;
	light.position.set(-1, 2, 4);
	return light;
} // End of getDirectionalLight()

function getBox() {
	var boxDimension = 1;
	var boxColor = 0x00fff0;
	var mesh = new THREE.Mesh(
		new THREE.BoxGeometry(boxDimension, boxDimension, boxDimension),
		new THREE.MeshPhongMaterial({ color: boxColor, wireframe: showWireframe, }),
	);

	mesh.scale += 5;
	mesh.name = 'TESTBox';
	mesh.castShadow = true;
	mesh.position.set(0, 0, 0);
	return mesh;
} // End of getBox()

// Returns a console log of the model % loaded
function onProgress(xhr) {
	console.log('Model downloaded: ' + Math.round((xhr.loaded / xhr.total * 100), 2) + '% loaded');
} // End of onProgress

// Returns a console log ERROR when model doesn't load
function onError(error) {
	console.log('ERROR: ' + error);
} // End of onError()

function printShotgun(str, data) {
	console.log(str);
	console.log(data);
} // End of printShotgun()

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

function getOBJRender(scene, camera, controls, objDimensions, objCenter) {
	// Textures shade can change based on the color level
	var materialComposition = getMaterialComposition('physical', 0x0000ff);
	objLoader.load(
		objFileStr,
		function (obj) {
			obj.scale.x = objScale;
			obj.scale.y = objScale;
			obj.scale.z = objScale;
			obj.name = 'myRender';

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

			// Produces ERROR object is not a instance of Object3D.
			// container.add(objDimensions);
			scene.add(obj);
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

main();