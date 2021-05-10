
function main() {
	const canvas = document.getElementById('board');
	const renderer = new THREE.WebGLRenderer({ alpha: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	canvas.appendChild(renderer.domElement);

	const fov = 45;
	// window.innerWidth = 800 & window.innerHeight = 601
	const aspect = canvas.offsetWidth / canvas.offsetHeight;  // the canvas default
	const near = 1;
	const far = 1000;
	const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	camera.position.z = 40;

	const scene = new THREE.Scene();
	scene.background = new THREE.Color('white');

	// put the camera on a pole (parent it to an object)
	// so we can spin the pole to move the camera around the scene
	const cameraPole = new THREE.Object3D();
	scene.add(cameraPole);
	cameraPole.add(camera);

	{
		const color = 0xFFFFFF;
		const intensity = 1;
		const light = new THREE.DirectionalLight(color, intensity);
		light.position.set(-1, 2, 4);
		camera.add(light);
	}

	const boxWidth = 1;
	const boxHeight = 1;
	const boxDepth = 1;
	const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

	function rand(min, max) {
		if (max === undefined) {
			max = min;
			min = 0;
		}
		return min + (max - min) * Math.random();
	}

	function randomColor() {
		return `hsl(${rand(360) | 0}, ${rand(50, 100) | 0}%, 50%)`;
	}

	const numObjects = 100;

	for (let i = 0; i < numObjects; ++i) {
		const material = new THREE.MeshPhongMaterial({
			color: randomColor(),
		});

		const cube = new THREE.Mesh(geometry, material);
		scene.add(cube);

		cube.position.set(rand(-20, 20), rand(-20, 20), rand(-20, 20));
		cube.rotation.set(rand(Math.PI), rand(Math.PI), 0);
		cube.scale.set(rand(3, 6), rand(3, 6), rand(3, 6));
	}

	resizeRendererToDisplaySize(renderer);

	const pickPosition = { x: 0, y: 0 };
	const pickHelper = new PickHelper(scene, camera);
	clearPickPosition();

	function render(time) {
		time *= 0.001;  // convert to seconds;

		if (resizeRendererToDisplaySize(renderer)) {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
		}

		// cameraPole.rotation.y = time * .1;
		pickHelper.pick(pickPosition, scene, camera, time);
		renderer.render(scene, camera);
		requestAnimationFrame(render);
	}

	requestAnimationFrame(render);

	function getCanvasRelativePosition(event) {
		const rect = canvas.getBoundingClientRect();
		return {
			x: (event.clientX - rect.left) * canvas.offsetWidth / rect.width,
			y: (event.clientY - rect.top) * canvas.offsetHeight / rect.height,
		};
	}

	function setPickPosition(event) {
		const pos = getCanvasRelativePosition(event);
		pickPosition.x = (pos.x / window.innerWidth) * 2 - 1;
		pickPosition.y = (pos.y / window.innerHeight) * -2 + 1;  // note we flip Y
		// console.log(pickPosition.x)
	}

	function clearPickPosition() {
		// unlike the mouse which always has a position
		// if the user stops touching the screen we want
		// to stop picking. For now we just pick a value
		// unlikely to pick something
		pickPosition.x = -100000;
		pickPosition.y = -100000;
	}

	window.addEventListener('mousemove', setPickPosition);
	window.addEventListener('mouseout', clearPickPosition);
	window.addEventListener('mouseleave', clearPickPosition);

	window.addEventListener('touchstart', (event) => {
		// prevent the window from scrolling
		event.preventDefault();
		setPickPosition(event.touches[0]);
	}, { passive: false });

	window.addEventListener('touchmove', (event) => {
		setPickPosition(event.touches[0]);
	});

	window.addEventListener('touchend', clearPickPosition);
}


function resizeRendererToDisplaySize(renderer) {
	const canvas = document.getElementById('board');
	const width = window.innerWidth;
	const height = window.innerHeight;
	// canvas.offsetWidth = 605 & canvas.offsetHeight = 551
	const needResize = canvas.offsetWidth !== width || canvas.offsetHeight !== height;
	if (needResize) {
		renderer.setSize(width, height, false);
	}
	return needResize;
}

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
		const intersectedObjects = this.raycaster.intersectObjects(scene.children);
		if (intersectedObjects.length) {
			// pick the first object. It's the closest one
			this.pickedObject = intersectedObjects[0].object;
			// save its color
			this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex();
			// set its emissive color to flashing red/yellow
			this.pickedObject.material.emissive.setHex((time * 1.5) % 2 > 1 ? 0xFFFF00 : 0xFF0000);
		}
	}
}

main();