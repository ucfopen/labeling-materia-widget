

// I HAVE TO FIGURE OUT HOW TO MAKE THIS FILE WAIT UNTIL PLAYER.JS FINISHES LOADING.
// window.onload = init;
console.log('Beginning of draw3D.js');

const scene = new THREE.Scene();
// scene.background = new THREE.Color(0xcccccc);

const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);
camera.position.set(0, 0, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setClearColor(0x000000, 0);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const canvas =
	document.getElementById('board').appendChild(renderer.domElement);

canvas.setAttribute('id', '3D');

// window.addEventListener('resize', function () {
// 	camera.aspect = window.innerWidth / window.innerWidth;
// 	camera.updateProjectionMatrix();
// 	renderer.setSize(window.innerWidth, window.innerHeight);
// }, false);

const geometry = new THREE.BoxGeometry(1, 1, 15);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
cube.castShadow = true;
cube.receiveShadow = false;
cube.position.set(-2, 0, 0);
scene.add(cube);

const animate = function () {
	requestAnimationFrame(animate);
	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;

	renderer.render(scene, camera);
}

animate();

console.log('Ending of draw3D.js');
