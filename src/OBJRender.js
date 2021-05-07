// const mtlFileStr = '_models3D/male02/male02.mtl';
const objFileStr = '_models3D/male02/male02.obj';
// const mtlFileStr = '_models3D/female02/female02.mtl';
// const objFileStr = '_models3D/female02/female02.obj';
// const mtlFileStr = '_models3D/vroom/Audi_R8_2017.mtl';
// const objFileStr = '_models3D/vroom/Audi_R8_2017.obj';
// const objFileStr = '_models3D/cerberus/Cerberus.obj';
// const objFileStr = '_models3D/tree.obj';

const setAntialias = false;
const showWireframe = true;
const shapeShadows = false;
const sceneColor = 0xdddddd;

const canvas = document.getElementById('board');

let fov = 45;
let aspect = canvas.offsetWidth / canvas.offsetHeight;  // the canvas default
let near = 1;
let far = 1000;

const mousePosition = { x: 0, y: 0 };
const sphereList = [];
const clock = new THREE.Clock();

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
	scene.name = 'myScene';
	scene.background = new THREE.Color(sceneColor);

	const renderer = new THREE.WebGLRenderer({ antialias: setAntialias, alpha: true });
	renderer.name = 'myRenderer';
	renderer.setPixelRatio(window.devicePixelRatio);
	canvas.appendChild(renderer.domElement);

	const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	camera.name = 'myCamera';
	camera.position.set(0, 0, 1);
	camera.add(getDirectionalLight(1));

	const controls = new THREE.OrbitControls(camera, renderer.domElement);

	const cameraPole = new THREE.Object3D();
	cameraPole.name = 'cameraPole';
	cameraPole.add(camera);
	scene.add(cameraPole);

	const objDimensions = new THREE.Box3();
	const objCenter = new THREE.Vector3();

	var cube = getBox();
	scene.add(cube);

	getSphereList(scene);
	getOBJRender(scene, camera, controls, objDimensions, objCenter);
	onWindowResize(renderer);

	var pickHelper = new PickHelper(scene, camera);
	clearMousePosition();

	function render(time) {
		time *= 0.001;  // convert from minutes to seconds;

		if (onWindowResize(renderer)) {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
		}

		pickHelper.pick(mousePosition, scene, camera, time);

		controls.update(); // Movement of camera
		renderer.render(scene, camera);
		requestAnimationFrame(render);
	} // End of render()

	setTimeout(() => { requestAnimationFrame(render); }, 2000);

	// Enable detection & placement of mouse.
	window.addEventListener('mousemove', onMouseMove);
	window.addEventListener('mouseout', clearMousePosition);
	window.addEventListener('mouseleave', clearMousePosition);

	// Enable touch to start & and to move
	window.addEventListener('touchstart', (event) => {
		// prevent the window from scrolling
		event.preventDefault();
		onMouseMove(event.touches[0]);
	}, { passive: false });

	window.addEventListener('touchmove', (event) => {
		onMouseMove(event.touches[0]);
	});

	window.addEventListener('touchend', clearMousePosition);
	printShotgun('scene', scene);
}// END OF MAIN()

function clearMousePosition() {
	// Stop picking if the user doesn't move the mouse
	mousePosition.x = -100000;
	mousePosition.y = -100000;
} // End of clearMousePosition()

function getMousePosition(event) {

	var rect = canvas.getBoundingClientRect();
	return {
		x: (event.clientX - rect.left + (rect.left * 0.5)) * canvas.offsetWidth / rect.width,
		y: (event.clientY - rect.top + (rect.top * 0.5)) * canvas.offsetHeight / rect.height,
	};
} // End of getMousePosition()

function onMouseMove(event) {

	var pos = getMousePosition(event);
	mousePosition.x = (pos.x / window.innerWidth) * 2 - 1;
	mousePosition.y = (pos.y / window.innerHeight) * -2 + 1;  // note we flip Y
} // End of onMouseMove()

function onWindowResize(renderer) {

	var width = window.innerWidth / 1.32;
	var height = window.innerHeight / 1.09;
	var needResize = canvas.offsetWidth !== width || canvas.offsetHeight !== height;

	if (needResize)
		renderer.setSize(width, height, false);

	return needResize;
} // End of onWindowResize()

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

		var position = scene.children.length;
		var intersectedObjects = this.raycaster.intersectObjects(scene.children[position - 1].children, true);

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
	var boxDimension = 10;
	var boxColor = 0x00fff0;
	var mesh = new THREE.Mesh(
		new THREE.BoxGeometry(boxDimension, boxDimension, boxDimension),
		new THREE.MeshPhongMaterial({ color: boxColor, wireframe: showWireframe, }),
	);

	mesh.name = 'TESTBox';
	mesh.castShadow = true;
	mesh.position.set(0, 0, 0);
	return mesh;
} // End of getBox()

function getSphereList(scene) {

	for (let i = 0; i < 10; i++) {
		var sphere = new THREE.Mesh(
			new THREE.SphereGeometry(0.1, 32, 32),
			new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: showWireframe }),
		)
		sphere.name = 'mySphere[' + i + ']';
		scene.add(sphere);
		sphereList.push(sphere);
	}
} // End of getSphereList()

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
} // End of getMaterialComposition()

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

			obj.children['0']['material']['wireframe'] = showWireframe;

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
} // End of getOBJRender()

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
} // End of getMTLandOBJRender()

main();