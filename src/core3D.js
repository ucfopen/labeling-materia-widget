// Great guides for starting and understanding.
// ThreeJs => https://threejsfundamentals.org/
// WebGL2 => https://webgl2fundamentals.org/
// [for a deeper understanding of what the library does in the background]

// For the future, to add event listeners for three js use threex
// https://github.com/jeromeetienne/threex.domevents

import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r124/three.module.min.js'
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.124.0/examples/jsm/controls/OrbitControls.js'
import { MTLLoader } from 'https://cdn.jsdelivr.net/npm/three@0.124.0/examples/jsm/loaders/MTLLoader.js'
import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.124.0/examples/jsm/loaders/OBJLoader.js'

// variables that define a spheres dimensions.
let sphereRadius = 1  // size of all spheres even in the CLASS Vertex.
let myPointerPosition = { x: 0, y: 0, z: 0 }
let labelSphereColor = 0x1ec74a; // green

// Variable used to create and keep track of vertices ["data generated"] from
// user click that generate labels
let vertex
let vector = new THREE.Vector3()

let renderedSpheresGroup = new THREE.Group
renderedSpheresGroup.name = 'renderedSpheresGroup'

let highlightSpheresGroup = new THREE.Group
highlightSpheresGroup.name = 'highlightSpheresGroup'

// Variables that control and set scene, camera position, rendering, and
// display of model and its texture loaders.
let sceneColor = 0xdddddd  // control the background color of a scene, // remove the texture to see the line connections between vertices.
const scene = new THREE.Scene()
let setAntialias = true  // increase visual at the cost of performance

const fov = 45
const canvas = document.getElementById('board')
const aspect = canvas.offsetWidth / canvas.offsetHeight
const near = 0.1
const far = 1000
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
let cameraInitialPosition = new THREE.Vector3()

const renderer = new THREE.WebGLRenderer({ antialias: setAntialias })
const controls = new OrbitControls(camera, renderer.domElement)

let objBoxSize = null
let objBoxCenter = null
const objBoxDimensions = new THREE.Box3()

let mtlLoader = new MTLLoader() // NOT USE AT THE MOMENT
let objLoader = new OBJLoader()

// raycaster is used for covert the mouse's xy-position on click to xyz-position.
const raycaster = new THREE.Raycaster()
const mousePosition = new THREE.Vector2()
const onClickPosition = new THREE.Vector2()
let intersects = null

main()
render()

// Function that sets up the camera, scene and models.
function main() {
	scene.name = 'myScene'
	scene.background = new THREE.Color(sceneColor)

	camera.name = 'myCamera'
	camera.position.set(0, 0, 1)
	camera.add(getDirectionalLight(1))

	controls.enablePan = true
	controls.rotateSpeed = 0.5
	controls.enableDamping = true
	controls.dampingFactor = 0.5

	renderer.name = 'myRenderer'
	renderer.setPixelRatio(window.devicePixelRatio)
	renderer.setSize(canvas.offsetWidth, canvas.offsetHeight)
	renderer.domElement.id = 'my3DCanvas'
	canvas.appendChild(renderer.domElement)

	scene.add(renderedSpheresGroup)
	scene.add(highlightSpheresGroup)
	scene.add(camera)

	window.addEventListener('resize', onWindowResize)
	canvas.addEventListener('click', onMouseClick)
}// END OF MAIN()

// Function that re-renders the models ideally every fps
function render() {
	controls.update()
	requestAnimationFrame(render)
	renderer.render(scene, camera)
} // END OF render()

function horizontalCameraRotation(rotationAngle) {
	let cameraPointX = camera.position.x
	let cameraPointZ = camera.position.z
	camera.position.x = cameraPointX * Math.cos(rotationAngle) + cameraPointZ * Math.sin(rotationAngle)
	camera.position.z = cameraPointZ * Math.cos(rotationAngle) - cameraPointX * Math.sin(rotationAngle)
}

function verticalCameraRotation(rotationAngle) {
	let cameraPointY = camera.position.y
	let cameraPointZ = camera.position.z
	camera.position.y = cameraPointY * Math.cos(rotationAngle) + cameraPointZ * Math.sin(rotationAngle)
	camera.position.z = cameraPointZ * Math.cos(rotationAngle) - cameraPointY * Math.sin(rotationAngle)
}

function getSphere(name, radius, position, color) {
	let mesh = new THREE.Mesh(
		new THREE.SphereGeometry(radius, 16, 16), // 16 = spheres width and height Segments
		new THREE.MeshBasicMaterial({ color: color, wireframe: false, }),
	)

	mesh.name = name
	mesh.position.set(position['x'], position['y'], position['z'])
	mesh.castShadow = true
	return mesh
}

function getBox() { // NOT USED AT THE MOMENT
	let boxDimension = 10
	let boxColor = 0x00fff0
	let mesh = new THREE.Mesh(
		new THREE.BoxGeometry(boxDimension, boxDimension, boxDimension),
		new THREE.MeshPhongMaterial({ color: boxColor, wireframe: true, }),
	)

	mesh.name = 'TESTBox'
	mesh.castShadow = true
	mesh.position.set(0, 0, 0)
	return mesh
}

function getDirectionalLight(intensity) {
	let light = new THREE.DirectionalLight(0xffffff, intensity)
	light.name = 'directionalLight'
	light.castShadow = true
	light.position.set(-1, 2, 4)
	return light
}

function onProgress(xhr) {
	// Returns a console log of the model loaded percentage
	console.log('Model downloaded: ' + Math.round((xhr.loaded / xhr.total * 100), 2) + '% loaded')
}

function onError(error) {
	// Returns a console log ERROR when model doesn't load
	console.log('ERROR: ' + error)
}

function getOBJRender(objFileStr) {
	objLoader.crossOrigin = ''
	objLoader.load(objFileStr, (obj) => {
		obj.name = 'myModel'
		scene.add(obj)

		// If the smallest total length of an axis is less than 32 units of spacing, loop
		// until the scale grows enough that it is equal to 32 and pointerRadius equal or greater than 4
		getObjDimensions(obj)
		let dimensionsTotal = resizePointer()

		let smallestAxis = dimensionsTotal.x > dimensionsTotal.y
			? dimensionsTotal.y
			: dimensionsTotal.x

		let properSize = smallestAxis >= 20
			? false
			: true

		for (let index = 1; properSize; index++) {
			scaleUpObj(obj)
			getObjDimensions(obj)
			dimensionsTotal = resizePointer()

			smallestAxis = dimensionsTotal.x > dimensionsTotal.y
				? dimensionsTotal.y
				: dimensionsTotal.x

			properSize = smallestAxis >= 20
				? false
				: true
		}


		let totalSumAxes = dimensionsTotal.x + dimensionsTotal.y + dimensionsTotal.z
		let ratioTotalSumAxes = totalSumAxes / 3
		let sphereScaleValue = ratioTotalSumAxes / 20

		if (sphereScaleValue > 1) { sphereRadius = sphereScaleValue }
		let highlightSphere = getSphere('myHighlightSphere', (sphereRadius + 0.05), myPointerPosition, 0x27c0ff)
		highlightSphere.visible = false
		highlightSpheresGroup.add(highlightSphere)
		// Centralize the camera on the model
		getObjDimensions(obj)
		frameArea(objBoxSize * 1.2, objBoxSize, objBoxCenter)

		controls.minDistance = objBoxSize / 5
		controls.maxDistance = objBoxSize * 5
		controls.target.copy(objBoxCenter)
	},
		onProgress,
		onError
	)
} // END OF getOBJRender()

function addHighlightSphere() {
	scene.add(highlightSphere)
}

function getMTLandOBJRender(mtlFileStr, objFileStr) { // NOT USED AT THE MOMENT

	mtlLoader.load(mtlFileStr, (mtl) => {
		mtl.preload()
		objLoader.setMaterials(mtl)
		getOBJRender(objFileStr)
	})
}

function getObjDimensions(obj) {
	// ["IMAGINARY"] Create invisible box with model dimension of width, height, and length.
	objBoxDimensions.setFromObject(obj)
	objBoxSize = objBoxDimensions.getSize(new THREE.Vector3()).length()
	objBoxCenter = objBoxDimensions.getCenter(new THREE.Vector3())
}

function frameArea(sizeToFitOnScreen, objBoxSize, objBoxCenter) {
	const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5
	const halfFovY = THREE.MathUtils.degToRad(camera.fov * .5)
	const distance = halfSizeToFitOnScreen / Math.tan(halfFovY)

	const direction = (new THREE.Vector3())
		.subVectors(camera.position, objBoxCenter)
		.multiply(new THREE.Vector3(1, 0, 1))
		.normalize()

	camera.position.copy(direction.multiplyScalar(distance).add(objBoxCenter))
	camera.far = objBoxSize * 100
	camera.near = objBoxSize / 100
	camera.updateProjectionMatrix()
	camera.lookAt(objBoxCenter.x, objBoxCenter.y, objBoxCenter.z)

	cameraInitialPosition.copy(camera.position)
}


// A sphere radius min is 1, so if model yTotal or xTotal is 2 then the pointer
// will end up covering half of the model.
function resizePointer() {

	// Max will always be closer to the positive axis
	let xMax = objBoxDimensions.max.x
	let yMax = objBoxDimensions.max.y
	let zMax = objBoxDimensions.max.z

	// Min will always be closer to the negative axis
	let xMin = objBoxDimensions.min['x']
	let yMin = objBoxDimensions.min.y
	let zMin = objBoxDimensions.min.z

	let xTotal = xMax > 0 ? (xMax - xMin) : (xMin - xMax)
	let yTotal = yMax > 0 ? (yMax - yMin) : (yMin - yMax)
	let zTotal = zMax > 0 ? (zMax - zMin) : (zMin - zMax)

	xTotal = xTotal > 0 ? xTotal : (-1 * xTotal)
	yTotal = yTotal > 0 ? yTotal : (-1 * yTotal)
	zTotal = zTotal > 0 ? zTotal : (-1 * zTotal)

	let axisTotals = { x: xTotal, y: yTotal, z: zTotal }
	return axisTotals
}

function scaleUpObj(obj) {
	let scaler = obj.scale.x
	obj.scale.set(scaler + 1, scaler + 1, scaler + 1)
}

// Func use as a event onClick for btn
function centeringCameraEvent() {
	camera.position.copy(cameraInitialPosition)
	camera.lookAt(objBoxCenter.x, objBoxCenter.y, objBoxCenter.z)
	controls.target.copy(objBoxCenter)
	controls.update()
}

function onWindowResize() {
	camera.aspect = canvas.offsetWidth / canvas.offsetHeight
	camera.updateProjectionMatrix()
	renderer.setSize(canvas.offsetWidth, canvas.offsetHeight)
}

// Func that processes all the raycasting to determine where the user click.
// Its achieve by using the mouse xy-position and calculating where that its with
// reference to the camera seeing (visual) dimensions.
function onMouseClick(event) {
	event.preventDefault()

	let listLength = scene.children.length
	let intersectedModel = scene.children[listLength - 1]
	const array = getMousePosition(event.clientX, event.clientY)  // array[x, y]
	onClickPosition.fromArray(array)  // object {x, y, isVector2: true}

	intersects = getIntersects(onClickPosition, intersectedModel.children, true)
	if (intersects.length > 0) {
		vertex = new Vertex(
			'term_',
			'dot_term_',
			intersects[0].faceIndex,
			intersects[0].point,
			intersects[0].uv
		)
	}
	console.log(intersects[0])
}

function getMousePosition(x, y) {
	let canvasRect = canvas.getBoundingClientRect()
	let xPosition = (x - canvasRect.left) / canvasRect.width
	let yPosition = (y - canvasRect.top) / canvasRect.height
	return [xPosition, yPosition]
}

// Func that obtains the obj intersected by the ray
function getIntersects(point, objects) {
	mousePosition.set((point.x * 2) - 1, - (point.y * 2) + 1)
	raycaster.setFromCamera(mousePosition, camera)
	return raycaster.intersectObjects(objects)
}

// Converts a point: vec3.xyz to a point position on the screen.
// Return 2D position is similar to a mouse click event position.
function uvMapToMousePoint(vertexPoint) {
	vector.copy(vertexPoint)
	vector.project(camera)
	vector.x = Math.round((0.5 + vector.x / 2) * (renderer.domElement.width / window.devicePixelRatio))
	vector.y = Math.round((0.5 - vector.y / 2) * (renderer.domElement.height / window.devicePixelRatio))
	return vector
}

// Func use as event onClick for removing model
function removeModel() {
	let tempModel = scene.getObjectByName('myModel')
	scene.remove(tempModel)
}

// Func used to generate vertex ("spheres") on click.
function createVertex(dataTermID, dotID, faceIndex, point, uv) {
	return new Vertex(dataTermID, dotID, faceIndex, point, uv)
}

function newSphereRadius(newRadius) {
	sphereRadius = newRadius
}

// Class that contains all the vertex and sphere data.
// The sphere data auto updates the moment dotID & point update.
class Vertex {
	constructor(_dataTermID, _dotID, _faceIndex, _point, _uv) {
		this.dataTermID = _dataTermID
		this.dotID = _dotID
		this.faceIndex = _faceIndex
		this.point = _point
		this.uv = _uv
		this.sphere = function () {
			let mesh = new THREE.Mesh(
				new THREE.SphereGeometry(sphereRadius, 16, 16), // 16 = spheres width and heightSegments
				new THREE.MeshBasicMaterial({ color: labelSphereColor, wireframe: false, }),
			)

			mesh.name = this.dotID
			mesh.position.set(this.point['x'], this.point['y'], this.point['z'])
			return mesh
		}
	}

	static isVariableNull(value) {
		return value === null
	}
}

export {
	vertex, intersects, highlightSpheresGroup, renderedSpheresGroup,
	uvMapToMousePoint, centeringCameraEvent, createVertex, getOBJRender, removeModel,
	horizontalCameraRotation, verticalCameraRotation, addHighlightSphere, newSphereRadius
}