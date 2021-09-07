// Great guide for starting and finding understanding.
// https://threejsfundamentals.org/

// import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r124/three.module.min.js';
// import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.124.0/examples/jsm/controls/OrbitControls.js';
// import { MTLLoader } from 'https://cdn.jsdelivr.net/npm/three@0.124.0/examples/jsm/loaders/MTLLoader.js';
// import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.124.0/examples/jsm/loaders/OBJLoader.js';
// import Stats from 'https://unpkg.com/three@0.124.0/examples/jsm/libs/stats.module.js';

// let mtlFileStr = 'models3D/male02/male02.mtl';
// let objFileStr = 'models3D/male02/male02.obj';
// let mtlFileStr = 'models3D/female02/female02.mtl';
// let objFileStr = 'models3D/female02/female02.obj';
// let mtlFileStr = 'models3D/vroom/Audi_R8_2017.mtl';
// let objFileStr = 'models3D/vroom/Audi_R8_2017.obj';
let mtlFileStr;
// let objFileStr = 'models3D/cerberus/Cerberus.obj';
// let objFileStr = 'models3D/tree.obj';
let objFileStr = 'models3D/mesh_bed.obj';
// let objFileStr = 'models3D/untitled.obj';

let THREE = window.THREE;
let OrbitControls = window.OrbitControls;
let MTLLoader = window.MTLLoader;
let OBJLoader = window.OBJLoader;
let Stats = window.Stats;

// Variables that can
let sceneColor = 0xdddddd; // control the background color of a scene,
let setAntialias = true; // increase or decrease performance,
let showWireframe = true; // remove the texture to see the line connections between vertices.

// Variables that control the appearance of the sphere that displays the last position where
// the user clicked on.
let sphereColor = 0xffb84d;
let sphereRadius = 4; // size of all spheres even in the CLASS Vertex.
let myPointerSize = sphereRadius + 0.5; // size of last clicked sphere.
let widthAndHeightSegments = 16;
let myPointer = getSphere();

// Variable used to create and keep track of vertices ["data generated"] from user ones
// they click to create a label.
let vertex;
let renderedSpheresGroup = new THREE.Group;
renderedSpheresGroup.name = 'renderedSpheresGroup';
let vector = new THREE.Vector3();

// Get the HTML element where the scene will be appended to and render.
const canvas = document.getElementById('board');
const canvasWidth = canvas.offsetWidth; // data value = 605
const canvasHeight = canvas.offsetHeight; // data value = 551

// ThreeJs variables that control and help the scene, camera position, rendering, and
// display of model and its texture loaders.
let mtlLoader = new MTLLoader();
let objLoader = new OBJLoader();
let cameraInitialPosition = new THREE.Vector3();
const objBoxDimensions = new THREE.Box3();
let objBoxCenter;
let objBoxSize;
const mousePosition = new THREE.Vector2();
const onClickPosition = new THREE.Vector2();
// raycaster is used for interpolating the mouse's xy-position on click
// versus 3D world xyz-position. Look at function onMouseClick() and inside that
// function getIntersects().
const raycaster = new THREE.Raycaster();
let intersects;

let fov = 45;
const aspect = canvasWidth / canvasHeight;
let near = 0.1;
let far = 1000;

const stats = Stats();
let canvasRect = canvas.getBoundingClientRect();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
const renderer = new THREE.WebGLRenderer({ antialias: setAntialias });
const controls = new OrbitControls(camera, renderer.domElement);
// controls.enablePan = false;

// let url;

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

	scene.add(renderedSpheresGroup);
	scene.add(myPointer);
	scene.add(camera);

	urlStr = objFileStr;
	// use if obj provided  // use if mtl and obj provided
	mtlFileStr == null ? getOBJRender(urlStr) : getMTLandOBJRender(mtlFileStr, urlStr);

	window.addEventListener('resize', onWindowResize);
	canvas.addEventListener('click', onMouseClick);

	renderer.domElement.id = 'my3DCanvas';
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

function getOBJRender(objFileStr) {
	objLoader.load(objFileStr, (obj) => {
		obj.name = 'myRender';
		scene.add(obj);

		// If the smallest total length of an axis is less than 32 units of spacing, loop
		// until the scale grows enough that it is equal to 32 and pointerRadius equal or greater than 4
		getObjDimensions(obj);
		let dimensionsTotal = resizePointer();
		let smallestAxis = dimensionsTotal.x > dimensionsTotal.y ? dimensionsTotal.y : dimensionsTotal.x;
		let pointerRadius = dimensionsTotal.x > dimensionsTotal.y ? dimensionsTotal.x * 0.1 : dimensionsTotal.y * 0.1;
		let properSize = (smallestAxis >= 60 && pointerRadius >= 4) ? false : true;

		for (let index = 1; properSize; index++) {
			scaleUpObj(obj);
			getObjDimensions(obj);

			dimensionsTotal = resizePointer();
			smallestAxis = dimensionsTotal.x > dimensionsTotal.y ? dimensionsTotal.y : dimensionsTotal.x;
			pointerRadius = dimensionsTotal.x > dimensionsTotal.y ? dimensionsTotal.x * 0.1 : dimensionsTotal.y * 0.1;
			properSize = (smallestAxis >= 60 && pointerRadius >= 4) ? false : true;
		}

		getObjDimensions(obj);
		frameArea(objBoxSize * 1.2, objBoxSize, objBoxCenter);
		controls.maxDistance = objBoxSize * 10;
		controls.target.copy(objBoxCenter);
		controls.update();
	},
		onProgress,
		onError
	);
} // End of getOBJRender()

function getMTLandOBJRender(mtlFileStr, objFileStr) {

	mtlLoader.load(mtlFileStr, (mtl) => {
		mtl.preload();
		objLoader.setMaterials(mtl);

		getOBJRender(controls);

	});

} // End of getMTLandOBJRender()

function getObjDimensions(obj) {
	// Create invisible box with dimensions of obj.
	objBoxDimensions.setFromObject(obj);
	objBoxSize = objBoxDimensions.getSize(new THREE.Vector3()).length();
	objBoxCenter = objBoxDimensions.getCenter(new THREE.Vector3());
}

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
}

// A sphere radius min is 1, so if model yTotal or xTotal is 2 then the pointer
// will end up covering half of the model.
function resizePointer() {
	let xTotal
	let yTotal
	// Max will always be closer to the positive axis
	let xMax = objBoxDimensions.max.x;
	let yMax = objBoxDimensions.max.y;

	// Min will always be closer to the negative axis
	let xMin = objBoxDimensions.min.x;
	let yMin = objBoxDimensions.min.y;

	xTotal = xMax > 0 ? (xMax - xMin) : (xMin - xMax);
	yTotal = yMax > 0 ? (yMax - yMin) : (yMin - yMax);

	xTotal = xTotal > 0 ? xTotal : (-1 * xTotal);
	yTotal = yTotal > 0 ? yTotal : (-1 * yTotal);

	return { x: xTotal, y: yTotal };
}

function scaleUpObj(obj) {
	let scaler = obj.scale.x;
	obj.scale.set(scaler + 1, scaler + 1, scaler + 1);
}

function centeringCameraEvent() {
	camera.position.copy(cameraInitialPosition);
	camera.lookAt(objBoxCenter.x, objBoxCenter.y, objBoxCenter.z);
	controls.maxDistance = objBoxSize * 10;
	controls.target.copy(objBoxCenter);
	controls.update();
}

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
	stats.dom.style.left = canvasRect.right - 80 + 'px';
	stats.dom.style.top = canvasRect.bottom - 48 + 'px';
}

// Func that processes all the raycaster to determine where the user click.
// Its achieve by using the mouse xy-position and calculating where that its with
// reference to the camera seeing dimensions.
function onMouseClick(event) {

	event.preventDefault();

	let listLength = scene.children.length;
	let intersectedModel = scene.children[listLength - 1];

	const array = getMousePosition(event.clientX, event.clientY); // array[x, y]
	onClickPosition.fromArray(array); // object {x, y, isVector2: true}

	intersects = getIntersects(onClickPosition, intersectedModel.children, true);

	if (intersects.length > 0) {
		vertex = new Vertex(
			'term_',
			'dot_term_',
			intersects[0].faceIndex,
			intersects[0].point,
			intersects[0].uv
		);

		myPointer.position.x = vertex.point['x'];
		myPointer.position.y = vertex.point['y'];
		myPointer.position.z = vertex.point['z'];
	}

} // End of onMouseClick()

function getMousePosition(x, y) {
	let canvasRect = canvas.getBoundingClientRect();
	let xPosition = (x - canvasRect.left) / canvasRect.width;
	let yPosition = (y - canvasRect.top) / canvasRect.height;

	return [xPosition, yPosition];
}

function getIntersects(point, objects) {
	mousePosition.set((point.x * 2) - 1, - (point.y * 2) + 1);
	raycaster.setFromCamera(mousePosition, camera);

	return raycaster.intersectObjects(objects);
}

// Converts a point: Vector3 (x,y,z) to a 2D (x,y) position on the screen.
// The return 2D position is similar to a mouse click event position.
function uvMapToMousePoint(vertexPoint) {

	vector.copy(vertexPoint);
	vector.project(camera);
	vector.x = Math.round((0.5 + vector.x / 2) * (renderer.domElement.width / window.devicePixelRatio));
	vector.y = Math.round((0.5 - vector.y / 2) * (renderer.domElement.height / window.devicePixelRatio));
	return vector;
}

function createVertex(dataTermID, dotID, faceIndex, point, uv) {
	return new Vertex(dataTermID, dotID, faceIndex, point, uv);
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

// module.exports =

export default { vertex, intersects, renderedSpheresGroup, uvMapToMousePoint, centeringCameraEvent, createVertex };

// module.exports = {
// 	vertex: vertex,
// 	intersects: intersects,
// 	renderedSpheresGroup: renderedSpheresGroup,
// 	uvMapToMousePoint: uvMapToMousePoint,
// 	centeringCameraEvent: centeringCameraEvent,
// 	createVertex: createVertex
// }
