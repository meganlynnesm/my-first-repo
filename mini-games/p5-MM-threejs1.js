// Three.js Sketch 1: Procedural Terrain + Fog
// Adapted from the official three.js example "webgl_geometry_terrain" -
// swapped ES module imports for the classic CDN build already loaded on the page,
// scoped to a fixed 400x400 canvas, dropped the Stats.js FPS overlay, and
// replaced the original brown sun-shading formula with a height-based gradient
// across the site's 5-color palette (maroon valleys through pale peaks), using
// the sun-shading only as a lighting multiplier on top of the palette color.
//
// Note: the original example seeds its noise by overwriting the GLOBAL
// window.Math.random, which would silently break randomness in every other
// sketch on this page (e.g. Blooming Flowers). Kept the seeded RNG local instead.

// Wrapping everything in (function () { ... })() keeps all the variables below
// (scene, camera, mesh, etc.) private to this file, so it can't clash with
// variables of the same name in the other sketch files sharing this page.
(function () {
  var width = 400;
  var height = 400;

  // The container is the empty <div> in the HTML that this canvas will live inside.
  var container = document.getElementById('threejs-container-1');

  // How many height-map points make up the terrain grid (128 x 128 = 16,384 points).
  // Higher numbers = more detailed terrain, but slower to generate.
  var worldWidth = 128;
  var worldDepth = 128;

  // THREE.Clock measures time between animation frames, so movement speed stays
  // consistent even if the frame rate changes (e.g. a slower computer).
  var clock = new THREE.Clock();

  // Every three.js scene needs 3 basic things: a camera, a scene, and a renderer.

  // The camera is our "eye" into the 3D world.
  // PerspectiveCamera(fieldOfView, aspectRatio, nearClip, farClip):
  //   - fieldOfView: how wide the view is, in degrees (like a camera lens angle)
  //   - aspectRatio: width/height of the canvas, so things don't look stretched
  //   - nearClip/farClip: objects closer than "near" or farther than "far" aren't drawn
  var camera = new THREE.PerspectiveCamera(60, width / height, 1, 10000);
  camera.position.set(100, 800, -800); // where the camera starts
  camera.lookAt(-100, 810, -800); // which direction it starts facing

  // The scene is the 3D world/container that holds all our objects, lights, and fog.
  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0xe1e3af); // pale, matches the site palette
  // Fog fades distant objects into the background color - it hides the harsh edge
  // where the terrain plane ends and also adds a sense of depth/distance.
  scene.fog = new THREE.FogExp2(0xe1e3af, 0.0025);

  // Build a height-map (an array of elevation values) using Perlin noise.
  var data = generateHeight(worldWidth, worldDepth);

  // PlaneGeometry makes a flat grid of triangles - think of it like a sheet of
  // graph paper made of little squares (each square is 2 triangles).
  // The last two arguments (worldWidth - 1, worldDepth - 1) control how many
  // segments/subdivisions the grid has, matching our height-map resolution.
  var geometry = new THREE.PlaneGeometry(7500, 7500, worldWidth - 1, worldDepth - 1);
  geometry.rotateX(-Math.PI / 2); // rotate it flat (like a floor) instead of standing up

  // Every point on the grid ("vertex") has an x, y, z position stored in a flat
  // array: [x0, y0, z0, x1, y1, z1, ...]. Here we push each vertex's y (height)
  // up or down based on our height-map data, turning the flat plane into terrain.
  var vertices = geometry.attributes.position.array;
  for (var vi = 0, vj = 0, vl = vertices.length; vi < vl; vi++, vj += 3) {
    vertices[vj + 1] = data[vi] * 10; // vj+1 is the Y value of this vertex
  }

  // Generate a 2D image (canvas) that colors the terrain based on height + sunlight,
  // then use it as a texture (a "skin" wrapped over the 3D shape).
  var texture = new THREE.CanvasTexture(generateTexture(data, worldWidth, worldDepth));
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  // A Mesh = Geometry (the 3D shape) + Material (how its surface looks).
  // MeshBasicMaterial just displays the texture as-is, unaffected by scene lights
  // (we don't need real lighting here since the texture already has shading baked in).
  var mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ map: texture }));
  scene.add(mesh);

  // The renderer draws (renders) the scene, as seen through the camera, into a
  // <canvas> element - that's the actual picture you see on the page.
  var renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio); // sharper rendering on high-DPI screens
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement); // add the canvas to our page

  // FirstPersonControls lets you look around by dragging the mouse and move with
  // the arrow keys/WASD, like walking through the scene.
  var controls = new THREE.FirstPersonControls(camera, renderer.domElement);
  controls.movementSpeed = 150;
  controls.lookSpeed = 0.1;

  // Generates a grid of height values using layered ("fractal") Perlin noise -
  // combining several passes of noise at different scales ("quality") produces
  // more natural, bumpy-looking terrain than a single pass would.
  function generateHeight(w, h) {
    // A simple seeded pseudo-random number generator, so the terrain shape is
    // reproducible on every page load instead of different every time.
    var seed = Math.PI / 4;
    var seededRandom = function () {
      var x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    var size = w * h;
    var heightData = new Uint8Array(size); // one byte (0-255) per grid point
    var perlin = new THREE.ImprovedNoise();
    var z = seededRandom() * 100;
    var quality = 1;

    // Run 4 passes of noise, each one zoomed out further ("quality *= 5"),
    // and add them together - this is what makes the terrain look natural
    // instead of like uniform, repetitive bumps.
    for (var j = 0; j < 4; j++) {
      for (var i = 0; i < size; i++) {
        var x = i % w;
        var y = ~~(i / w); // ~~ is a fast way to round a number down (like Math.floor)
        heightData[i] += Math.abs(perlin.noise(x / quality, y / quality, z) * quality * 1.75);
      }
      quality *= 5;
    }

    return heightData;
  }

  // Given a height value from 0 (lowest) to 1 (highest), returns an [r, g, b]
  // color blended from the site's palette - like a 5-color gradient bar where
  // low elevations are maroon and the highest peaks are pale.
  function paletteColorAt(t) {
    // Each "stop" says: at this height (t), use this color.
    // Colors between two stops are smoothly blended (interpolated).
    var paletteStops = [
      { t: 0.0, rgb: [146, 47, 60] },   // maroon (valleys)
      { t: 0.35, rgb: [204, 138, 143] }, // rose
      { t: 0.55, rgb: [115, 137, 19] },  // olive
      { t: 0.78, rgb: [246, 202, 125] }, // gold
      { t: 1.0, rgb: [225, 227, 175] }   // pale (peaks)
    ];

    t = Math.min(1, Math.max(0, t)); // keep t safely within the 0-1 range
    for (var s = 0; s < paletteStops.length - 1; s++) {
      var a = paletteStops[s];
      var b = paletteStops[s + 1];
      if (t >= a.t && t <= b.t) {
        // localT is how far between stop "a" and stop "b" our height falls (0-1),
        // used to blend the two colors together smoothly.
        var localT = (t - a.t) / (b.t - a.t);
        return [
          a.rgb[0] + (b.rgb[0] - a.rgb[0]) * localT,
          a.rgb[1] + (b.rgb[1] - a.rgb[1]) * localT,
          a.rgb[2] + (b.rgb[2] - a.rgb[2]) * localT
        ];
      }
    }
    return paletteStops[paletteStops.length - 1].rgb;
  }

  // Paints a 2D image where each pixel's color represents one point of the
  // terrain: its palette color (by height) shaded lighter/darker depending on
  // how directly "sunlight" would hit that point. This image becomes the texture
  // draped over the 3D terrain mesh above.
  function generateTexture(heightData, w, h) {
    var vector3 = new THREE.Vector3(0, 0, 0);
    var sun = new THREE.Vector3(1, 1, 1); // fake "sun" direction for shading
    sun.normalize();

    // Find the lowest and highest points in the height-map, so we can convert
    // any height into a 0-1 range for paletteColorAt() above.
    var minHeight = 255;
    var maxHeight = 0;
    for (var hi = 0; hi < heightData.length; hi++) {
      if (heightData[hi] < minHeight) minHeight = heightData[hi];
      if (heightData[hi] > maxHeight) maxHeight = heightData[hi];
    }
    var heightRange = Math.max(1, maxHeight - minHeight);

    // A plain <canvas> (2D, not three.js) that we draw the texture pixels into.
    var canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;

    var context = canvas.getContext('2d');
    context.fillStyle = '#000';
    context.fillRect(0, 0, w, h);

    // getImageData gives us direct access to every pixel's R, G, B, A values
    // as one long array: [r0, g0, b0, a0, r1, g1, b1, a1, ...]
    var image = context.getImageData(0, 0, canvas.width, canvas.height);
    var imageData = image.data;

    for (var i = 0, j = 0, l = imageData.length; i < l; i += 4, j++) {
      // Estimate the terrain's "slope" at this point by comparing it to its
      // neighbors - steeper slopes catch light differently than flat ground,
      // similar to how a hillside looks brighter or darker depending on angle.
      vector3.x = heightData[j - 2] - heightData[j + 2];
      vector3.y = 2;
      vector3.z = heightData[j - w * 2] - heightData[j + w * 2];
      vector3.normalize();

      // The dot product tells us how directly this slope faces the "sun" -
      // a higher value means more directly lit, a lower value means more shaded.
      var shade = vector3.dot(sun);
      var lightFactor = 0.65 + shade * 0.45; // convert shade into a brightness multiplier

      var t = (heightData[j] - minHeight) / heightRange; // 0 = lowest point, 1 = highest
      var color = paletteColorAt(t);

      imageData[i] = color[0] * lightFactor;     // red
      imageData[i + 1] = color[1] * lightFactor; // green
      imageData[i + 2] = color[2] * lightFactor; // blue
      // (alpha, imageData[i + 3], is left at its default of 255/fully opaque)
    }

    context.putImageData(image, 0, 0);

    // Scale the small texture up 4x (with the browser's smoothing) so it looks
    // less blocky when stretched across the large 3D terrain mesh.
    var canvasScaled = document.createElement('canvas');
    canvasScaled.width = w * 4;
    canvasScaled.height = h * 4;

    context = canvasScaled.getContext('2d');
    context.scale(4, 4);
    context.drawImage(canvas, 0, 0);

    // Add a little random grain/noise on top so the enlarged texture doesn't
    // look too smooth or artificial.
    image = context.getImageData(0, 0, canvasScaled.width, canvasScaled.height);
    imageData = image.data;

    for (var si = 0, sl = imageData.length; si < sl; si += 4) {
      var v = ~~(Math.random() * 5);
      imageData[si] += v;
      imageData[si + 1] += v;
      imageData[si + 2] += v;
    }

    context.putImageData(image, 0, 0);

    return canvasScaled;
  }

  // The animation loop: this function calls itself roughly 60 times per second
  // via requestAnimationFrame, which asks the browser to run it right before
  // the next screen repaint (smoother and more efficient than a fixed timer).
  function animate() {
    requestAnimationFrame(animate);
    controls.update(clock.getDelta()); // move the camera based on user input + time passed
    renderer.render(scene, camera);    // draw the current frame
  }
  animate(); // kick off the loop
})();
