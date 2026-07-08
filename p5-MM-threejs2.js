// Three.js Sketch 2: Occlusion Test (WebGPU)
// Adapted from the official three.js example "webgpu_occlusion" -
// this is a real ES module using three.js's newer WebGPURenderer and TSL
// (node-based shading) system, which is a different runtime from the classic
// WebGL build the rest of this page uses - see the <script type="importmap">
// in p5-MM.html. Scoped to a fixed 400x400 canvas, dropped the full-window
// resize handling, kept the off-black background, and recolored the plane's
// two states + the sphere to the site's maroon and pink instead of the
// original green/yellow/blue.
//
// Note: this requires a browser with WebGPU support (recent Chrome/Edge).
// In a browser without it, this canvas simply won't render.

import * as THREE from 'three/webgpu';
import { uniform } from 'three/tsl';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

(async function () {
  var width = 400;
  var height = 400;

  var container = document.getElementById('threejs-container-2');

  // A "Node" lets you write a small custom piece of shader logic and plug it
  // straight into a material - here, it recalculates the plane's color every
  // frame based on whether the renderer reports the sphere as fully hidden
  // (occluded) behind it.
  class OcclusionNode extends THREE.Node {
    constructor(testObject, normalColor, occludedColor) {
      super('vec3'); // this node outputs a color (vec3 = red, green, blue)

      // OBJECT means "re-run update() once per object per frame" rather than
      // once per vertex/pixel - we only need to check occlusion once per frame.
      this.updateType = THREE.NodeUpdateType.OBJECT;

      // uniform() creates a value that can change over time but stays the
      // same across every pixel the shader draws in a given frame.
      this.uniformNode = uniform(new THREE.Color());

      this.testObject = testObject;
      this.normalColor = normalColor;
      this.occludedColor = occludedColor;
    }

    // Runs once per frame, before drawing: ask the renderer whether
    // "testObject" (our sphere) is completely hidden behind other geometry
    // from the camera's current point of view.
    async update(frame) {
      var isOccluded = frame.renderer.isOccluded(this.testObject);
      this.uniformNode.value.copy(isOccluded ? this.occludedColor : this.normalColor);
    }

    // Tells the shader system: "use this uniform value as the output color."
    setup() {
      return this.uniformNode;
    }
  }

  // The camera is our "eye" into the 3D world.
  // PerspectiveCamera(fieldOfView, aspectRatio, nearClip, farClip).
  var camera = new THREE.PerspectiveCamera(50, width / height, 0.01, 100);
  camera.position.z = 7;

  // The scene holds every object, light, and background setting.
  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1613); // off-black, matches the rest of the page

  // AmbientLight lights every surface evenly from all directions (like soft,
  // indirect daylight) so nothing is ever pitch black.
  var ambientLight = new THREE.AmbientLight(0xb0b0b0);
  // DirectionalLight shines from one direction, like sunlight, adding
  // brighter highlights and shadowed sides to give the shapes some depth.
  var light = new THREE.DirectionalLight(0xffffff, 1.0);
  light.position.set(0.32, 0.39, 0.7);
  scene.add(ambientLight);
  scene.add(light);

  var planeGeometry = new THREE.PlaneGeometry(2, 2);
  var sphereGeometry = new THREE.SphereGeometry(0.5);

  // MeshPhongNodeMaterial is the node-based version of the classic Phong
  // material (shiny, reacts to lights) - it's what lets us swap in our
  // custom OcclusionNode as the plane's color source below.
  var plane = new THREE.Mesh(
    planeGeometry,
    new THREE.MeshPhongNodeMaterial({ color: 0xcc8a8f, side: THREE.DoubleSide })
  );
  var sphere = new THREE.Mesh(
    sphereGeometry,
    new THREE.MeshPhongNodeMaterial({ color: 0xcc8a8f })
  );

  // Pink while the sphere is visible, maroon once the plane fully hides it.
  var occlusionColor = new OcclusionNode(sphere, new THREE.Color(0xcc8a8f), new THREE.Color(0x922f3c));
  // colorNode overrides the material's normal color with our custom node's
  // output, so the plane's color is now driven by the occlusion test above.
  plane.material.colorNode = occlusionColor;

  sphere.position.z = -1; // sits just behind the plane, from the camera's starting view
  sphere.occlusionTest = true; // tells the renderer to track this object's visibility

  scene.add(plane);
  scene.add(sphere);

  // WebGPURenderer works like the classic WebGLRenderer (draws the scene into
  // a <canvas>), but talks to the newer WebGPU browser API instead of WebGL,
  // which is what lets it run occlusion queries (isOccluded) efficiently.
  var renderer = new THREE.WebGPURenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  renderer.setAnimationLoop(render); // WebGPU's version of a requestAnimationFrame loop
  container.appendChild(renderer.domElement);

  // OrbitControls lets you click-and-drag to orbit the camera around the
  // scene's center, and scroll/pinch to zoom between minDistance and maxDistance.
  var controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 3;
  controls.maxDistance = 25;

  function render() {
    renderer.render(scene, camera);
  }
})();
