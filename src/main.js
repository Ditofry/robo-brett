import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);

camera.position.z = 135;
camera.position.y = 22

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

// TODO: these are a little outrageous....
const colCount = 160;
const rowCount = 120;
const spacing = 1.5;
const particleCount = colCount * rowCount;

const audioContext = new AudioContext(),
    audioElement = document.getElementById('audioElement'),
    audioSource = audioContext.createMediaElementSource(audioElement),
    analyser = audioContext.createAnalyser();

audioSource.connect(analyser);
audioSource.connect(audioContext.destination);

const frequencyData = new Uint8Array(colCount);

const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);

let i = 0;
for (let row = 0; row < rowCount; row++) {
  for (let col = 0; col < colCount; col++) {
    positions[i] = (col - colCount / 2) * spacing * .5;
    positions[i + 1] = 0;
    positions[i + 2] = (row - rowCount / 2) * spacing;
    i += 3;
  }
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const material = new THREE.PointsMaterial({ color: 0xFF0000, size: 0.5 });
const points = new THREE.Points(geometry, material);
scene.add(points);

function animate() {
  const positionsArray = geometry.attributes.position.array;
  analyser.getByteFrequencyData(frequencyData);

  let i = 0;
  for (let row = 0; row < rowCount; row++) {
    for (let col = 0; col < colCount; col++) {
      const index = i * 3 + 1;

      if (row < (rowCount - 1)) {
        positionsArray[index] = positionsArray[index + (colCount * 3)]
      }

      i++;
    }
  }
  
  i -= colCount
  
  for (let f = 0; f < colCount; f++) {
    const index = i * 3 + 1;
    positionsArray[index] = frequencyData[i % colCount] * .1;
    i++
  }

  geometry.attributes.position.needsUpdate = true;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
