// Main.js - SuperGame (HTML/CSS/JS) - uses Three.js modules from unpkg
import * as THREE from 'https://unpkg.com/three@0.161.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.161.0/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'https://unpkg.com/three@0.161.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://unpkg.com/three@0.161.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://unpkg.com/three@0.161.0/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SMAAPass } from 'https://unpkg.com/three@0.161.0/examples/jsm/postprocessing/SMAAPass.js';

const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b1020);

// Camera
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 500);
camera.position.set(0, 6, 12);

// Lights
const hemi = new THREE.HemisphereLight(0xffffff, 0x444455, 0.8);
hemi.position.set(0, 20, 0);
scene.add(hemi);

const dir = new THREE.DirectionalLight(0xffffff, 1.5);
dir.position.set(8, 20, 10);
dir.castShadow = true;
dir.shadow.mapSize.set(2048, 2048);
dir.shadow.camera.left = -30; dir.shadow.camera.right = 30;
dir.shadow.camera.top = 30; dir.shadow.camera.bottom = -30;
scene.add(dir);

// Ground with high-res tiling texture (placeholder)
const textureLoader = new THREE.TextureLoader();
const groundTex = textureLoader.load('assets/ground_diffuse.jpg');
groundTex.wrapS = groundTex.wrapT = THREE.RepeatWrapping;
groundTex.repeat.set(40,40);
groundTex.anisotropy = 16;

const groundMat = new THREE.MeshStandardMaterial({ map: groundTex, roughness: 0.9, metalness: 0.0 });
const ground = new THREE.Mesh(new THREE.PlaneGeometry(200,200), groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Player (sphere) with metallic paint
const playerGeo = new THREE.SphereGeometry(0.9, 48, 48);
const playerMat = new THREE.MeshStandardMaterial({ color: 0x00aaff, metalness: 0.6, roughness: 0.15, envMapIntensity: 1 });
const player = new THREE.Mesh(playerGeo, playerMat);
player.position.set(0,1,0);
player.castShadow = true;
scene.add(player);

// Some decorative objects (boxes with PBR-like materials)
function makeCrate(x,z,color){
  const g = new THREE.BoxGeometry(2,2,2);
  const m = new THREE.MeshStandardMaterial({ color, metalness:0.2, roughness:0.6 });
  const mesh = new THREE.Mesh(g,m);
  mesh.position.set(x,1,z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
}
makeCrate(6, -4, 0xff7a7a);
makeCrate(-5, 5, 0x7affc2);
makeCrate(10, 8, 0xffd36b);

// Enemies (cones) that orbit
const enemies = [];
for(let i=0;i<6;i++){
  const g = new THREE.ConeGeometry(0.8,2,32);
  const m = new THREE.MeshStandardMaterial({ color: 0xff4d4f, metalness:0.1, roughness:0.5 });
  const e = new THREE.Mesh(g,m);
  e.castShadow = true;
  e.position.set(Math.cos(i/6*Math.PI*2)*6,1, Math.sin(i/6*Math.PI*2)*6);
  scene.add(e);
  enemies.push({mesh:e,offset:Math.random()*10});
}

// Skybox-like environment (simple big sphere)
const skyGeo = new THREE.SphereGeometry(120, 32, 32);
const skyMat = new THREE.MeshBasicMaterial({ color: 0x071129, side: THREE.BackSide });
const sky = new THREE.Mesh(skyGeo, skyMat);
scene.add(sky);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0,1,0);
controls.enableDamping = true;

// Postprocessing (bloom + SMAA)
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.6, 0.8, 0.1);
bloomPass.threshold = 0.2;
bloomPass.strength = 0.9;
composer.addPass(bloomPass);
// SMAA is optional and may not be supported in all contexts
try{
  const smaa = new SMAAPass(innerWidth * renderer.getPixelRatio(), innerHeight * renderer.getPixelRatio());
  composer.addPass(smaa);
}catch(e){ /* ignore if not supported */ }

let usePost = true;

function resize(){
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w,h);
  composer.setSize(w,h);
  camera.aspect = w/h; camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
resize();

// Game loop
const clock = new THREE.Clock();

function update(dt){
  // player bob
  player.position.y = 1 + Math.sin(clock.elapsedTime * 2) * 0.08;
  player.rotation.y += dt * 0.5;

  // enemies orbit
  enemies.forEach((en,i)=>{
    const t = clock.elapsedTime * (0.5 + i*0.06) + en.offset;
    en.mesh.position.x = Math.cos(t) * (5 + i*0.5);
    en.mesh.position.z = Math.sin(t) * (5 + i*0.5);
    en.mesh.rotation.y = t * 0.8;
  });

  controls.update();
}

function render(){
  const dt = clock.getDelta();
  update(dt);
  if(usePost){
    composer.render(dt);
  }else{
    renderer.render(scene, camera);
  }
  requestAnimationFrame(render);
}

// UI buttons
document.getElementById('startBtn').addEventListener('click', ()=>{
  // start or focus loop
  render();
  document.getElementById('startBtn').disabled = true;
});

document.getElementById('togglePost').addEventListener('click', ()=>{
  usePost = !usePost;
  console.log('Postprocessing', usePost);
});

// set initial pixel ratio for crispness on high-DPI devices
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Initial render
renderer.render(scene, camera);
