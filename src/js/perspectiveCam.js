
import { THREE } from "../lib/three"

var fov = 45;
var aspect = canvas.offsetWidth / canvas.offsetHeight;  // the canvas default
var near = 1;
var far = 1000;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

camera.name = 'camera';
camera.position.set(0, 0, 1);
// camera.add(getDirectionalLight(1));

export { camera };

