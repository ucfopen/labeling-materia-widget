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

const objScale = 1;
const manager = new THREE.LoadingManager();
manager.onProgress = function (item, loaded, total) { console.log(item, loaded, total); };
const mtlLoader = new THREE.MTLLoader(manager);
const objLoader = new THREE.OBJLoader(manager);

const canvas = document.getElementById('board');

const windowWidth = window.innerWidth; // data value = 800
const windowHeight = window.innerHeight; // data value = 601
const canvasWidth = canvas.offsetWidth; // data value = 605
const canvasHeight = canvas.offsetHeight; // data value = 551

let fov = 45;
let aspect = canvasWidth / canvasHeight;  // the canvas default
let near = 0.1;
let far = 1000;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
const renderer = new THREE.WebGLRenderer({ antialias: setAntialias });

const controls = new THREE.OrbitControls(camera, renderer.domElement);
const objDimensions = new THREE.Box3();
const objCenter = new THREE.Vector3();
const raycaster = new THREE.Raycaster();
const mousePosition = new THREE.Vector2();
const onClickPosition = new THREE.Vector2();

const radius = 10;
let sphereColor = 0xffb84d;
const myPointer = getSphere();

const verticesCheckList = [];

main();
render();

function main() {

	// HAVE TO INVERT THE left and right arrows.

	scene.name = 'myScene';
	scene.background = new THREE.Color(sceneColor);
	scene.add(getBox());

	camera.name = 'myCamera';
	camera.position.set(0, 0, 1);
	camera.add(getDirectionalLight(1));

	renderer.name = 'myRenderer';
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(canvasWidth, canvasHeight);
	canvas.appendChild(renderer.domElement);

	scene.add(myPointer);
	scene.add(camera);

	getOBJRender(controls, objCenter);

	window.addEventListener('resize', onWindowResize);
	canvas.addEventListener('click', onMouseMove);
	printShotgun('scene', scene.children);
	console.log(myPointer)
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

function getMaterialComposition(type, color) {
	let selectedMaterial;
	let materialOptions = {
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

function getOBJRender(controls) {
	// Textures shade can change based on the color level
	let materialComposition = getMaterialComposition('physical', 0x0000ff);
	objLoader.load(
		objFileStr,
		function (obj) {
			// obj.children['0']['material']['wireframe'] = showWireframe;
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

function getMTLandOBJRender(controls, container, objDimensions, objCenter) {
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
					let totalHeight = objDimensions.getSize().y;

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

function printShotgun(str, data) {
	console.log(str);
	console.log(data);
}

function render() {
	requestAnimationFrame(render);
	renderer.render(scene, camera);
}

function onWindowResize() {
	camera.aspect = windowWidth / windowHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(windowWidth, windowHeight);
}

function onMouseMove(event) {

	event.preventDefault();

	let listLength = scene.children.length;
	let intersectedObjects = scene.children[listLength - 1];

	const array = getMousePosition(event.clientX, event.clientY); // array[x, y]
	onClickPosition.fromArray(array); // object {x, y, isVector2: true}

	const intersects = getIntersects(onClickPosition, intersectedObjects.children);

	if (intersects.length > 0) {
		// console.log(objDimensions);
		// console.log(objCenter);
		// printShotgun('intersects[0]', intersects[0]);

		let vertexToCheck = {
			faceIndex: intersects[0].faceIndex,
			point: intersects[0].point,
			uuid: intersects[0].object.geometry.uuid,
			uv: intersects[0].uv,
		};
		// console.log(vertexToCheck);

		myPointer.position.set(vertexToCheck.point['x'], vertexToCheck.point['y'], vertexToCheck.point['Z']);


		if (verticesCheckList.length === 0) {
			verticesCheckList.push(vertexToCheck);
		}
		else {
			vertexIDCheck(vertexToCheck);
		}

	}
} // End of onMouseMove

function vertexIDCheck(vertex) {

	let checkListLength = verticesCheckList.length;

	verticesCheckList.forEach((element, index) => {
		console.log(verticesCheckList)
		// console.log(element);
		// console.log('index ' + checkListLength);

		if (element.uuid == verticesCheckList[index].uuid) {
			console.log('im in');
			console.log(myPointer.material.color);
			myPointer.material.color.r = 1;
			myPointer.material.color.g = 0;
			myPointer.material.color.b = 0;
		}
		else {
			myPointer.material.color.r = 0;
			myPointer.material.color.g = 0.7215686274509804;
			myPointer.material.color.b = 0.30196078431372547;
		}

	})

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
