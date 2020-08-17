// import * as THREE from './three.module.js'
// import { OrbitControls } from './OrbitControls.js'
const THREE = require('three')

let animationTime = 0
let camera
let controls
let scene
let renderer

const uniforms = {
  amplitude: {
    type: 'f',
    value: 0.5,
  },
}

const imageWidth = 640
const imageHeight = 360
let imageData = null

// init();

function init() {
  console.log('init')
  createScene()
  createControls()
  createPixelData()

  window.addEventListener('resize', onWindowResize, false)
}

function createScene() {
  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 1, 10000)
  camera.position.z = 3000

  renderer = new THREE.WebGLRenderer({ alpha: true })
  renderer.setSize(window.innerWidth, window.innerHeight)

  document.getElementById('container').appendChild(renderer.domElement)
}

function createControls() {
  controls = new OrbitControls(camera, renderer.domElement)
  controls.autoRotate = true
  controls.enableDamping = true
  controls.enableKeys = false
  controls.enablePan = false
  controls.rotateSpeed = 0.5
}

function createPixelData() {
  const image = document.createElement('img')
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  image.crossOrigin = 'Anonymous'
  image.onload = function () {
    image.width = canvas.width = imageWidth
    image.height = canvas.height = imageHeight

    context.fillStyle = context.createPattern(image, 'no-repeat')
    context.fillRect(0, 0, imageWidth, imageHeight)

    imageData = context.getImageData(0, 0, imageWidth, imageHeight).data

    createPoints()
    animate()
  }

  image.src = 'http://localhost:8000/Documents/CondenseAI/animation/tree_star.jpg'
}

function createPoints() {
  const weights = [0.2126, 0.7152, 0.0722]
  const zRange = 400

  let c = 0
  const position = []
  const vertexColor = []
  let x = imageWidth * -0.5
  let y = imageHeight * 0.5

  for (let i = 0; i < imageHeight; i++) {
    for (let j = 0; j < imageWidth; j++) {
      // Calculate Color
      const color = new THREE.Color()
      color.setRGB(imageData[c] / 255, imageData[c + 1] / 255, imageData[c + 2] / 255)
      vertexColor.push(color.r, color.g, color.b)

      // Calculate Position
      const weight = color.r * weights[0] + color.g * weights[1] + color.b * weights[2]
      position.push(x, y, (zRange * -0.5) + (zRange * weight))

      c += 4
      x++
    }

    x = imageWidth * -0.5
    y--
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(position, 3))
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(vertexColor, 3))

  // Create Material
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('fragmentShader').textContent,
  })

  // Add Points to Scene
  scene.add(new THREE.Points(geometry, material))
}

function animate() {
  uniforms.amplitude.value = Math.sin(animationTime)
  animationTime += 0.03

  renderer.render(scene, camera)
  controls.update()

  requestAnimationFrame(animate)
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}
