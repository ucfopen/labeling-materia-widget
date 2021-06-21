
import * as THREE from '../node_modules/three/build/three.module.js';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { MTLLoader } from '../node_modules/three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from '../node_modules/three/examples/jsm/loaders/OBJLoader.js';


// let mtlFileStr;
let mtlFileStr = 'models3D/male02/male02.mtl';
let objFileStr = 'models3D/male02/male02.obj';
// let mtlFileStr = 'models3D/female02/female02.mtl';
// let objFileStr = 'models3D/female02/female02.obj';
// let mtlFileStr = 'models3D/vroom/Audi_R8_2017.mtl';
// let objFileStr = 'models3D/vroom/Audi_R8_2017.obj';
// let objFileStr = 'models3D/cerberus/Cerberus.obj';
// let objFileStr = 'models3D/tree.obj';

const setAntialias = true;
const showWireframe = true;
const sceneColor = 0xdddddd;

const canvas = document.getElementById('board');
const canvasWidth = canvas.offsetWidth; // data value = 605
const canvasHeight = canvas.offsetHeight; // data value = 551

let fov = 45;
let aspect = canvasWidth / canvasHeight;  // the canvas default
let near = 0.1;
let far = 1000;

const scene = new THREE.Scene();
// const stats = new Stats();
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
const renderer = new THREE.WebGLRenderer({ antialias: setAntialias });

let mtlLoader = new MTLLoader();
let objLoader = new OBJLoader();
const controls = new OrbitControls(camera, renderer.domElement);
const objDimensions = new THREE.Box3();
const objCenter = new THREE.Vector3();
const raycaster = new THREE.Raycaster();
const mousePosition = new THREE.Vector2();
const onClickPosition = new THREE.Vector2();

let sphereColor = 0xffb84d;
const radius = 10;
const myPointer = getSphere();
let vertex;
const listOfVertex = [];
let vertexCnt = 0;

main();
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

	// stats.dom.id = 'statsBlock';
	// canvas.appendChild(stats.dom);

	let canvasRect = canvas.getBoundingClientRect();
	// stats.dom.style.left = canvasRect.right - 80 + 'px';
	// stats.dom.style.top = canvasRect.bottom - 48 + 'px';

	scene.add(myPointer);
	scene.add(camera);

	// controls.enableKeys = true;

	// WASD for movement
	// controls.keys = {
	// 	LEFT: 68, //left arrow
	// 	UP: 87, // up arrow
	// 	RIGHT: 65, // right arrow
	// 	BOTTOM: 83 // down arrow
	// }

	// use if obj provided  // use if mtl and obj provided
	mtlFileStr == null ? getOBJRender(controls) : getMTLandOBJRender(controls);

	window.addEventListener('resize', onWindowResize);
	canvas.addEventListener('click', onMouseClick);

	renderer.domElement.id = 'myCanvas';
}// END OF MAIN()

function render() {
	// stats.update();

	// checkListOfVertex();

	controls.update();
	requestAnimationFrame(render);
	renderer.render(scene, camera);
}

function checkListOfVertex() {

	let currentNumVertex = listOfVertex.length;

	if (vertexCnt === currentNumVertex) {
		return true;
	}
	else if (vertexCnt > currentNumVertex) {
		addVertexSphere();
	}
	else {
		removeVertexSphere();
	}
}

function addVertexSphere() {
	return console.log('Adding Vertex Sphere');
}

function removeVertexSphere() {
	return console.log('Removing Vertex Sphere');
}

function getSphere() {

	let widthAndHeightSegments = 16;

	let mesh = new THREE.Mesh(
		new THREE.SphereGeometry(radius, widthAndHeightSegments, widthAndHeightSegments),
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

		// Create invisible box with dimensions of obj.
		objDimensions.setFromObject(obj);

		// Get the center of the box
		objDimensions.getCenter(objCenter);

		// Gets the obj HEIGHT
		let totalHeight = objDimensions.getSize().y;

		// Matches the HEIGHT of the camera with the center of the box
		camera.position.y = objCenter.y;

		// Moves the camera in the positive
		camera.position.z = totalHeight + (totalHeight * 0.5);
		controls.target = objCenter;

		scene.add(obj);
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

			// Create invisible box with dimensions of obj.
			objDimensions.setFromObject(obj);

			// Get the center of the box
			objDimensions.getCenter(objCenter);

			// Gets the obj HEIGHT
			let totalHeight = objDimensions.getSize().y;

			// Matches the HEIGHT of the camera with the center of the box
			camera.position.y = objCenter.y;

			// Moves the camera in the positive
			camera.position.z = totalHeight + (totalHeight * 0.5);
			controls.target = objCenter;

			scene.add(obj);
		},
			onProgress,
			onError
		);
	});
} // End of getMTLandOBJRender()

function printShotgun(str, data) {
	console.log(str);
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

		let tempVertex = getVertex(intersects[0]);
		myPointer.position.x = tempVertex.point['x'];
		myPointer.position.y = tempVertex.point['y'];
		myPointer.position.z = tempVertex.point['z'];
		// verticesList.length == 0 ? verticesList.push(tempVertex) : vertexIDCheck(tempVertex);

		vertex = new Vertex('term_' + ++vertexCnt, 'dot_term_' + vertexCnt, intersects[0].faceIndex, intersects[0].point, intersects[0].uv);
		listOfVertex.push(vertex);

		// checkListOfVertex();
		//	IT'S CAUSING THE INTERSECT TO STOP DETECTING THE MODEL.
		//	Adding sphere to the scene breaks it.
		//	scene.add(vertex.sphere());
	}

} // End of onMouseClick()

function getVertex(intersects) {
	return {
		dataTermID: 'null',
		dotID: 'null',
		faceIndex: intersects.faceIndex,
		point: intersects.point,
		uv: intersects.uv,
	}
}

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
			let widthAndHeightSegments = 16;
			let sphereColor = 0x00fff0

			let mesh = new THREE.Mesh(
				new THREE.SphereGeometry(15, widthAndHeightSegments, widthAndHeightSegments),
				new THREE.MeshBasicMaterial({ color: sphereColor, wireframe: true, }),
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


export { vertex };