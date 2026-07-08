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
(function () {
  var width = 400;
  var height = 400;

  var container = document.getElementById('threejs-container-1');

  var worldWidth = 128;
  var worldDepth = 128;

  var clock = new THREE.Clock();

  var camera = new THREE.PerspectiveCamera(60, width / height, 1, 10000);
  camera.position.set(100, 800, -800);
  camera.lookAt(-100, 810, -800);

  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0xe1e3af);
  scene.fog = new THREE.FogExp2(0xe1e3af, 0.0025);

  var data = generateHeight(worldWidth, worldDepth);

  var geometry = new THREE.PlaneGeometry(7500, 7500, worldWidth - 1, worldDepth - 1);
  geometry.rotateX(-Math.PI / 2);

  var vertices = geometry.attributes.position.array;
  for (var vi = 0, vj = 0, vl = vertices.length; vi < vl; vi++, vj += 3) {
    vertices[vj + 1] = data[vi] * 10;
  }

  var texture = new THREE.CanvasTexture(generateTexture(data, worldWidth, worldDepth));
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  var mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ map: texture }));
  scene.add(mesh);

  var renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);

  var controls = new THREE.FirstPersonControls(camera, renderer.domElement);
  controls.movementSpeed = 150;
  controls.lookSpeed = 0.1;

  function generateHeight(w, h) {
    var seed = Math.PI / 4;
    var seededRandom = function () {
      var x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    var size = w * h;
    var heightData = new Uint8Array(size);
    var perlin = new THREE.ImprovedNoise();
    var z = seededRandom() * 100;
    var quality = 1;

    for (var j = 0; j < 4; j++) {
      for (var i = 0; i < size; i++) {
        var x = i % w;
        var y = ~~(i / w);
        heightData[i] += Math.abs(perlin.noise(x / quality, y / quality, z) * quality * 1.75);
      }
      quality *= 5;
    }

    return heightData;
  }

  function paletteColorAt(t) {
    // Palette gradient stops (low elevation -> high elevation)
    var paletteStops = [
      { t: 0.0, rgb: [146, 47, 60] },   // maroon
      { t: 0.35, rgb: [204, 138, 143] }, // rose
      { t: 0.55, rgb: [115, 137, 19] },  // olive
      { t: 0.78, rgb: [246, 202, 125] }, // gold
      { t: 1.0, rgb: [225, 227, 175] }   // pale
    ];

    t = Math.min(1, Math.max(0, t));
    for (var s = 0; s < paletteStops.length - 1; s++) {
      var a = paletteStops[s];
      var b = paletteStops[s + 1];
      if (t >= a.t && t <= b.t) {
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

  function generateTexture(heightData, w, h) {
    var vector3 = new THREE.Vector3(0, 0, 0);
    var sun = new THREE.Vector3(1, 1, 1);
    sun.normalize();

    var minHeight = 255;
    var maxHeight = 0;
    for (var hi = 0; hi < heightData.length; hi++) {
      if (heightData[hi] < minHeight) minHeight = heightData[hi];
      if (heightData[hi] > maxHeight) maxHeight = heightData[hi];
    }
    var heightRange = Math.max(1, maxHeight - minHeight);

    var canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;

    var context = canvas.getContext('2d');
    context.fillStyle = '#000';
    context.fillRect(0, 0, w, h);

    var image = context.getImageData(0, 0, canvas.width, canvas.height);
    var imageData = image.data;

    for (var i = 0, j = 0, l = imageData.length; i < l; i += 4, j++) {
      vector3.x = heightData[j - 2] - heightData[j + 2];
      vector3.y = 2;
      vector3.z = heightData[j - w * 2] - heightData[j + w * 2];
      vector3.normalize();

      var shade = vector3.dot(sun);
      var lightFactor = 0.65 + shade * 0.45;

      var t = (heightData[j] - minHeight) / heightRange;
      var color = paletteColorAt(t);

      imageData[i] = color[0] * lightFactor;
      imageData[i + 1] = color[1] * lightFactor;
      imageData[i + 2] = color[2] * lightFactor;
    }

    context.putImageData(image, 0, 0);

    var canvasScaled = document.createElement('canvas');
    canvasScaled.width = w * 4;
    canvasScaled.height = h * 4;

    context = canvasScaled.getContext('2d');
    context.scale(4, 4);
    context.drawImage(canvas, 0, 0);

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

  function animate() {
    requestAnimationFrame(animate);
    controls.update(clock.getDelta());
    renderer.render(scene, camera);
  }
  animate();
})();
