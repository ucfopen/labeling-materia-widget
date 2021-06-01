
// let mtlFileStr;
let mtlFileStr = '_models3D/male02/male02.mtl';
let objFileStr = '_models3D/male02/male02.obj';
// let mtlFileStr = '_models3D/female02/female02.mtl';
// let objFileStr = '_models3D/female02/female02.obj';
// let mtlFileStr = '_models3D/vroom/Audi_R8_2017.mtl';
// let objFileStr = '_models3D/vroom/Audi_R8_2017.obj';
// let objFileStr = '_models3D/cerberus/Cerberus.obj';
// let objFileStr = '_models3D/tree.obj';

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
const stats = new Stats();
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
const renderer = new THREE.WebGLRenderer({ antialias: setAntialias });

const controls = new THREE.OrbitControls(camera, renderer.domElement);
const objDimensions = new THREE.Box3();
const objCenter = new THREE.Vector3();
const raycaster = new THREE.Raycaster();
const mousePosition = new THREE.Vector2();
const onClickPosition = new THREE.Vector2();

let sphereColor = 0xffb84d;
const radius = 10;
const myPointer = getSphere();
const verticesCheckList = [];

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

	scene.add(myPointer);
	scene.add(camera);

	controls.enableKeys = true;

	// WASD for movement
	controls.keys = {
		LEFT: 68, //left arrow
		UP: 87, // up arrow
		RIGHT: 65, // right arrow
		BOTTOM: 83 // down arrow
	}

	// controls.mouseButtons = {
	// 	LEFT: THREE.MOUSE.ROTATE,
	// 	MIDDLE: THREE.MOUSE.DOLLY,
	// 	RIGHT: THREE.MOUSE.PAN
	// }

	// use if obj provided  // use if mtl and obj provided
	mtlFileStr == null ? getOBJRender(controls) : getMTLandOBJRender(controls);

	window.addEventListener('resize', onWindowResize);
	canvas.addEventListener('click', onMouseClick);

	// stats.dom.classList.add('statsBlock');
	stats.dom.id = 'statsBlock';
	canvas.appendChild(stats.dom);

	let canvasRect = canvas.getBoundingClientRect();
	stats.dom.style.left = canvasRect.right - 80 + 'px';
	stats.dom.style.top = canvasRect.bottom - 48 + 'px';

	printShotgun('scene', scene.children);
}// END OF MAIN()

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

	let objLoader = new THREE.OBJLoader();
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

	let mtlLoader = new THREE.MTLLoader();
	mtlLoader.load(mtlFileStr, (mtl) => {
		mtl.preload();

		let objLoader = new THREE.OBJLoader();
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

function render() {
	stats.update();
	requestAnimationFrame(render);
	renderer.render(scene, camera);
}

function onWindowResize() {
	camera.aspect = canvas.innerWidth / canvas.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(canvas.innerWidth, canvas.innerHeight);
}

function onMouseClick(event) {

	event.preventDefault();

	let listLength = scene.children.length;
	let intersectedObjects = scene.children[listLength - 1];

	const array = getMousePosition(event.clientX, event.clientY); // array[x, y]
	onClickPosition.fromArray(array); // object {x, y, isVector2: true}

	const intersects = getIntersects(onClickPosition, intersectedObjects.children);

	if (intersects.length > 0) {
		let vertexToCheck = {
			faceIndex: intersects[0].faceIndex,
			point: intersects[0].point,
			uv: intersects[0].uv,
		};

		myPointer.position.x = vertexToCheck.point['x'];
		myPointer.position.y = vertexToCheck.point['y'];
		myPointer.position.z = vertexToCheck.point['z'];

		verticesCheckList.length == 0 ? verticesCheckList.push(vertexToCheck) : vertexIDCheck(vertexToCheck);
	}
} // End of onMouseClick()

function vertexIDCheck(vertex) {

	verticesCheckList.forEach(element => {

		JSON.stringify(vertex) === JSON.stringify(element)
			? myPointer.material.color.set(0xff0000)
			: myPointer.material.color.set(0x0000ff);
	})

	// REMEMBER TO ADD A APPROXIMATION TO THE CHECKING OF THE VERTEX.FACEINDEX
	// IT'S DIFFICULT TO CLICK ON THE SAME SPECIFIC VERTEX.
	// console.log(vertex.faceIndex < 100 && vertex.faceIndex > 50);

	// printShotgun('----verticesCheckList', verticesCheckList);
} // End of vertexIDCheck

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
