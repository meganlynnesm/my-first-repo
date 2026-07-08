// Three.js Sketch 2: Interactive Scene with OrbitControls (placeholder)
// Replace this with your own scene once you've built it in the Three.js editor.
(function () {
  var width = 400;
  var height = 400;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  var renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setClearColor(0xfaf7f1);

  document.getElementById('threejs-container-2').appendChild(renderer.domElement);

  var controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  var ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  var directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 10, 7);
  scene.add(directionalLight);

  var box = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshPhongMaterial({ color: 0x922f3c })
  );
  box.position.set(-2, 0.5, 0);
  scene.add(box);

  var sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.6, 32, 32),
    new THREE.MeshPhongMaterial({ color: 0xcc8a8f })
  );
  sphere.position.set(0, 0.6, 0);
  scene.add(sphere);

  var cylinder = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.5, 1, 32),
    new THREE.MeshPhongMaterial({ color: 0xe1e3af })
  );
  cylinder.position.set(2, 0.5, 0);
  scene.add(cylinder);

  var cone = new THREE.Mesh(
    new THREE.ConeGeometry(0.5, 1, 32),
    new THREE.MeshPhongMaterial({ color: 0x738913 })
  );
  cone.position.set(0, 0.5, -2);
  scene.add(cone);

  var torus = new THREE.Mesh(
    new THREE.TorusGeometry(0.4, 0.18, 16, 32),
    new THREE.MeshPhongMaterial({ color: 0xf6ca7d })
  );
  torus.position.set(0, 0.5, 2);
  torus.rotation.x = Math.PI / 2;
  scene.add(torus);

  camera.position.set(4, 4, 6);
  camera.lookAt(0, 0.5, 0);

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
})();
