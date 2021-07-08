
import * as THREE from '../node_modules/three/build/three.module.js';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { MTLLoader } from '../node_modules/three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from '../node_modules/three/examples/jsm/loaders/OBJLoader.js';
import Stats from '../node_modules/three/examples/jsm/libs/stats.module.js';

let mtlFileStr = 'models3D/male02/male02.mtl';
let objFileStr = 'models3D/male02/male02.obj';
// let mtlFileStr = 'models3D/female02/female02.mtl';
// let objFileStr = 'models3D/female02/female02.obj';
// let mtlFileStr = 'models3D/vroom/Audi_R8_2017.mtl';
// let objFileStr = 'models3D/vroom/Audi_R8_2017.obj';
// let mtlFileStr;
// let objFileStr = 'models3D/cerberus/Cerberus.obj';
// let objFileStr = 'models3D/tree.obj';

// Variables that can
let sceneColor = 0xdddddd; // control the background color of a scene,
let setAntialias = true; // increase or decrease performance,
let showWireframe = true; // remove the texture to see the line connections between vertices.

// Variables that control the appearance of the sphere that displays the last position where
// the user clicked on.
let sphereColor = 0xffb84d;
let sphereRadius = 6; // size of all spheres even in the CLASS Vertex.
let myPointerSize = sphereRadius + 0.5; // size of last clicked sphere.
let widthAndHeightSegments = 16;
const myPointer = getSphere();

// Variable used to create and keep track of vertices ["data generated"] from user ones
// they click to create a label.
let vertex;
let listOfVertexLocal = [];
let knownNumVertex = 0;
let renderedSpheresGroup = new THREE.Group;
renderedSpheresGroup.name = 'renderedSpheresGroup';

// Get the HTML element where the scene will be appended to and render.
const canvas = document.getElementById('board');
const canvasWidth = canvas.offsetWidth; // data value = 605
const canvasHeight = canvas.offsetHeight; // data value = 551

// ThreeJs variables that control and help the scene, camera position, rendering, and
// display of model and its texture loaders.
let mtlLoader = new MTLLoader();
let objLoader = new OBJLoader();
let objBoxCenter;
let objBoxSize;
let cameraInitialPosition = new THREE.Vector3();
let cameraLooksAt = new THREE.Vector3();
const objBoxDimensions = new THREE.Box3();
const mousePosition = new THREE.Vector2();
const onClickPosition = new THREE.Vector2();
// raycaster is used for interpolating the mouse's xy-position on click
// versus 3D world xyz-position. Look at function onMouseClick() and inside that
// function getIntersects().
const raycaster = new THREE.Raycaster();

let fov = 45;
let aspect = canvasWidth / canvasHeight;
let near = 0.1;
let far = 1000;

const stats = Stats();
let canvasRect = canvas.getBoundingClientRect();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
const renderer = new THREE.WebGLRenderer({ antialias: setAntialias });
const controls = new OrbitControls(camera, renderer.domElement);
// controls.enablePan = false;

// Loads in all the base requirements for properly displaying the 3D environment.
main();

// Recursive function that render and controls the 3D environment every
// time a frame is renderer.
render();

function main() {

	scene.name = 'myScene';
	scene.background = new THREE.Color(sceneColor);

	camera.name = 'myCamera';
	camera.position.set(0, 0, 1);
	camera.add(getDirectionalLight(1));

	renderer.name = 'myRenderer';
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(canvasWidth, canvasHeight);
	canvas.appendChild(renderer.domElement);

	stats.dom.id = 'statsBlock';
	stats.dom.style.left = canvasRect.right - 80 + 'px';
	stats.dom.style.top = canvasRect.bottom - 48 + 'px';
	canvas.appendChild(stats.dom);

	// controls.enableKeys = true;

	// WASD for movement
	// controls.keys = {
	// 	LEFT: 68, //left arrow
	// 	UP: 87, // up arrow
	// 	RIGHT: 65, // right arrow
	// 	BOTTOM: 83 // down arrow
	// }


	scene.add(renderedSpheresGroup);
	scene.add(myPointer);
	scene.add(camera);

	// use if obj provided  // use if mtl and obj provided
	mtlFileStr == null ? getOBJRender(controls) : getMTLandOBJRender(controls);

	window.addEventListener('resize', onWindowResize);
	canvas.addEventListener('click', onMouseClick);

	renderer.domElement.id = 'myCanvas';
}// END OF MAIN()

function render() {
	stats.update();

	controls.update();
	requestAnimationFrame(render);
	renderer.render(scene, camera);
}

function getSphere() {
	let mesh = new THREE.Mesh(
		new THREE.SphereGeometry(myPointerSize, widthAndHeightSegments, widthAndHeightSegments),
		new THREE.MeshBasicMaterial({ color: sphereColor, wireframe: false, }),
	);

	mesh.name = 'myPointer';
	mesh.castShadow = true;
	mesh.position.set(0, 0, 0);
	return mesh;
}

function getBox() {
	let boxDimension = 10;
	let boxColor = 0x00fff0;
	let mesh = new THREE.Mesh(
		new THREE.BoxGeometry(boxDimension, boxDimension, boxDimension),
		new THREE.MeshPhongMaterial({ color: boxColor, wireframe: showWireframe, }),
	);

	mesh.name = 'TESTBox';
	mesh.castShadow = true;
	mesh.position.set(0, 0, 0);
	return mesh;
}

function getDirectionalLight(intensity) {
	let light = new THREE.DirectionalLight(0xffffff, intensity);
	light.name = 'directionalLight';
	light.castShadow = true;
	light.position.set(-1, 2, 4);
	return light;
}

function onProgress(xhr) {
	// Returns a console log of the model % loaded
	console.log('Model downloaded: ' + Math.round((xhr.loaded / xhr.total * 100), 2) + '% loaded');
}

function onError(error) {
	// Returns a console log ERROR when model doesn't load
	console.log('ERROR: ' + error);
}

function getOBJRender(controls) {

	objLoader.load(objFileStr, (obj) => {
		obj.name = 'myRender';
		scene.add(obj);

		// Create invisible box with dimensions of obj.
		objBoxDimensions.setFromObject(obj);
		objBoxSize = objBoxDimensions.getSize(new THREE.Vector3()).length();
		objBoxCenter = objBoxDimensions.getCenter(new THREE.Vector3());

		frameArea(objBoxSize * 1.2, objBoxSize, objBoxCenter);

		controls.maxDistance = objBoxSize * 10;
		controls.target.copy(objBoxCenter);
		controls.update();
	},
		onProgress,
		onError
	);
} // End of getOBJRender()

function getMTLandOBJRender(controls) {

	mtlLoader.load(mtlFileStr, (mtl) => {
		mtl.preload();

		objLoader.setMaterials(mtl);
		objLoader.load(objFileStr, (obj) => {
			obj.name = 'myRender';
			scene.add(obj);

			// Create invisible box with dimensions of obj.
			objBoxDimensions.setFromObject(obj);
			objBoxSize = objBoxDimensions.getSize(new THREE.Vector3()).length();
			objBoxCenter = objBoxDimensions.getCenter(new THREE.Vector3());

			frameArea(objBoxSize * 1.2, objBoxSize, objBoxCenter);

			controls.maxDistance = objBoxSize * 10;
			controls.target.copy(objBoxCenter);
			controls.update();
		},
			onProgress,
			onError
		);
	});

} // End of getMTLandOBJRender()

function frameArea(sizeToFitOnScreen, objBoxSize, objBoxCenter) {
	const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
	const halfFovY = THREE.MathUtils.degToRad(camera.fov * .5);
	const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);

	const direction = (new THREE.Vector3())
		.subVectors(camera.position, objBoxCenter)
		.multiply(new THREE.Vector3(1, 0, 1))
		.normalize();

	camera.position.copy(direction.multiplyScalar(distance).add(objBoxCenter));
	camera.far = objBoxSize * 100;
	camera.near = objBoxSize / 100;
	camera.updateProjectionMatrix();
	camera.lookAt(objBoxCenter.x, objBoxCenter.y, objBoxCenter.z);

	cameraInitialPosition.copy(camera.position);
	cameraLooksAt.copy(objBoxCenter);
}

let centeringCameraEvent = function () {
	camera.position.copy(cameraInitialPosition);
	camera.lookAt(objBoxCenter.x, objBoxCenter.y, objBoxCenter.z);
	controls.maxDistance = objBoxSize * 10;
	controls.target.copy(objBoxCenter);
	controls.update();
}

document.getElementById('centerCamera').addEventListener('click', centeringCameraEvent);

// Function for testing purposes
function printShotgun(str, data) {
	console.log('%c ' + str, 'color:orange; font-weight:bold;');
	console.log(data);
}

function onWindowResize() {
	camera.aspect = canvas.offsetWidth / canvas.offsetHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);

	let canvasRect = canvas.getBoundingClientRect();
	// stats.dom.style.left = canvasRect.right - 80 + 'px';
	// stats.dom.style.top = canvasRect.bottom - 48 + 'px';
}

// Func that processes all the raycaster to determine where the user click.
// Its achieve by using the mouse xy-position and calculating where that its with
// reference to the camera seeing dimensions.
function onMouseClick(event) {

	event.preventDefault();

	let listLength = scene.children.length;
	let intersectedObjects = scene.children[listLength - 1];

	const array = getMousePosition(event.clientX, event.clientY); // array[x, y]
	onClickPosition.fromArray(array); // object {x, y, isVector2: true}

	const intersects = getIntersects(onClickPosition, intersectedObjects.children, true);

	if (intersects.length > 0) {
		vertex = new Vertex('term_', 'dot_term_', intersects[0].faceIndex, intersects[0].point, intersects[0].uv);

		myPointer.position.x = vertex.point['x'];
		myPointer.position.y = vertex.point['y'];
		myPointer.position.z = vertex.point['z'];
	}

} // End of onMouseClick()

function getMousePosition(x, y) {

	const rect = canvas.getBoundingClientRect();
	let xPosition = (x - rect.left) / rect.width;
	let yPosition = (y - rect.top) / rect.height;

	return [xPosition, yPosition];
}

function getIntersects(point, objects) {

	mousePosition.set((point.x * 2) - 1, - (point.y * 2) + 1);
	raycaster.setFromCamera(mousePosition, camera);

	return raycaster.intersectObjects(objects);
}

// Class that contains all the vertex, labeling, and sphere data.
// The sphere data auto updates the moment dotID & point update.
class Vertex {

	constructor(_dataTermID, _dotID, _faceIndex, _point, _uv) {
		this.dataTermID = _dataTermID;
		this.dotID = _dotID;
		this.faceIndex = _faceIndex;
		this.point = _point;
		this.uv = _uv;
		this.sphere = function () {
			let sphereColor = 0xfdedce;

			let mesh = new THREE.Mesh(
				new THREE.SphereGeometry(sphereRadius, widthAndHeightSegments, widthAndHeightSegments),
				new THREE.MeshBasicMaterial({ color: sphereColor, wireframe: false, }),
			);

			mesh.name = this.dotID;
			mesh.position.set(this.point['x'], this.point['y'], this.point['z']);
			return mesh;
		};
	} // End of constructor

	// STATIC
	static isVariableNull(value) {
		return value === null;
	}
} // End of class Vertex

export { vertex, renderedSpheresGroup }