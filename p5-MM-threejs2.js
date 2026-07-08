// Three.js Sketch 2: Icosahedron Field (Level of Detail)
// Adapted from the official three.js example "webgl_lod" -
// swapped ES module imports for the classic CDN build already loaded on the page,
// scoped to a fixed 400x400 canvas, replaced the white wireframe material with
// the site's 5-color palette (cycled across objects), and set an off-black
// background/fog instead of pure black.

// Wrapping everything in (function () { ... })() keeps all the variables below
// private to this file, so they can't clash with the other sketch files on this page.
(function () {
  var width = 400;
  var height = 400;

  // The container is the empty <div> in the HTML that this canvas will live inside.
  var container = document.getElementById('threejs-container-2');

  // THREE.Clock measures time between animation frames, so movement speed stays
  // consistent no matter how fast or slow the browser is drawing frames.
  var clock = new THREE.Clock();

  // The camera is our "eye" into the 3D world.
  // PerspectiveCamera(fieldOfView, aspectRatio, nearClip, farClip) - a wider
  // fieldOfView (in degrees) sees more of the scene, like a wide-angle lens.
  var camera = new THREE.PerspectiveCamera(45, width / height, 1, 15000);
  camera.position.z = 1000; // start 1000 units back from the center of the scene

  // The scene is the 3D world/container that holds every object, light, and fog.
  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1613); // off-black
  // Fog fades distant objects into the background color as they get farther
  // from the camera - it hides the "pop-in" as far away shapes suddenly appear.
  scene.fog = new THREE.Fog(0x1a1613, 1, 15000);

  // Lights make the wireframe shapes visible with some shading/depth. Two kinds here:

  // PointLight shines outward in all directions from a single point in space,
  // like a bare lightbulb - here it sits at the center of the whole field (0,0,0).
  // Arguments: color, intensity, distance (0 = no limit), decay (0 = no falloff).
  var pointLight = new THREE.PointLight(0x922f3c, 3, 0, 0);
  pointLight.position.set(0, 0, 0);
  scene.add(pointLight);

  // DirectionalLight shines evenly from one direction, like sunlight - every
  // object gets lit from the same angle regardless of where it is in the scene.
  var dirLight = new THREE.DirectionalLight(0xf6ca7d, 3);
  dirLight.position.set(0, 0, 1).normalize();
  scene.add(dirLight);

  // LOD stands for "Level Of Detail." The idea: a shape far from the camera
  // doesn't need as many triangles as one right in front of you, since you
  // can't see the extra detail anyway - so we prepare several versions of the
  // same icosahedron (a 20-sided shape), from very detailed to very simple.
  //
  // Each entry below is [geometry, distance]: "use this geometry once the
  // object is at least this far from the camera." IcosahedronGeometry's second
  // argument is its "detail" level - higher number = more triangles = smoother.
  var geometryLevels = [
    [new THREE.IcosahedronGeometry(100, 16), 50],   // closest = most detailed
    [new THREE.IcosahedronGeometry(100, 8), 300],
    [new THREE.IcosahedronGeometry(100, 4), 1000],
    [new THREE.IcosahedronGeometry(100, 2), 2000],
    [new THREE.IcosahedronGeometry(100, 1), 8000]   // farthest = simplest
  ];

  // One wireframe material per palette color. MeshLambertMaterial reacts to
  // scene lights (unlike MeshBasicMaterial), and wireframe: true draws only
  // the edges of each triangle instead of a solid filled surface.
  var paletteColors = [0xcc8a8f, 0x922f3c, 0x738913, 0xf6ca7d, 0xe1e3af];
  var paletteMaterials = paletteColors.map(function (color) {
    return new THREE.MeshLambertMaterial({ color: color, wireframe: true });
  });

  // Create 1,000 LOD objects and scatter them randomly through a big 3D volume.
  for (var j = 0; j < 1000; j++) {
    var lod = new THREE.LOD();
    // Cycle through the 5 palette materials (j % 5) so colors repeat evenly
    // across all 1,000 objects instead of using the same color for all of them.
    var material = paletteMaterials[j % paletteMaterials.length];

    // Build every detail level for this one LOD object and register it.
    for (var i = 0; i < geometryLevels.length; i++) {
      var mesh = new THREE.Mesh(geometryLevels[i][0], material);
      mesh.scale.set(1.5, 1.5, 1.5);
      mesh.updateMatrix();
      // matrixAutoUpdate = false is a performance optimization: since this
      // mesh's position/scale never changes after this point, three.js
      // doesn't need to recalculate its transform matrix every single frame.
      mesh.matrixAutoUpdate = false;
      lod.addLevel(mesh, geometryLevels[i][1]); // "use this mesh past this distance"
    }

    // Math.random() - 0.5 gives a value from -0.5 to 0.5, so multiplying by
    // (for example) 10000 spreads objects randomly across a 10,000-unit range
    // centered on zero, in every direction (x, y, and z).
    lod.position.x = 10000 * (0.5 - Math.random());
    lod.position.y = 7500 * (0.5 - Math.random());
    lod.position.z = 10000 * (0.5 - Math.random());
    lod.updateMatrix();
    lod.matrixAutoUpdate = false;
    scene.add(lod);
  }

  // The renderer draws (renders) the scene, as seen through the camera, into a
  // <canvas> element - that's the actual picture you see on the page.
  var renderer = new THREE.WebGLRenderer({ antialias: true }); // antialias smooths jagged edges
  renderer.setPixelRatio(window.devicePixelRatio); // sharper rendering on high-DPI screens
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement); // add the canvas to our page

  // FlyControls gives free-flight movement: drag the mouse to steer/roll, and
  // use the arrow keys (or WASD) to move forward/back/side to side - like
  // piloting a small ship through the field of shapes, rather than orbiting
  // around a fixed point.
  var controls = new THREE.FlyControls(camera, renderer.domElement);
  controls.movementSpeed = 1000;
  controls.rollSpeed = Math.PI / 10;

  // The animation loop: this function calls itself roughly 60 times per second
  // via requestAnimationFrame, which asks the browser to run it right before
  // the next screen repaint (smoother and more efficient than a fixed timer).
  function animate() {
    requestAnimationFrame(animate);
    controls.update(clock.getDelta()); // move the camera based on user input + time passed
    renderer.render(scene, camera);    // draw the current frame (three.js swaps the correct
                                        // LOD detail level in automatically based on distance)
  }
  animate(); // kick off the loop
})();
