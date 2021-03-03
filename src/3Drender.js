
import 'build/three.js';

const canvas = document.querySelector('#scene');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
	45,
	window.innerWidth / window.innerHeight,
	1,
	2000
);

camera.position.set(0, 0, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);