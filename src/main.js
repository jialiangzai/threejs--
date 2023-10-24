import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
// 1. 单独引入 stats 组件
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js'
// 性能监视器

import * as dat from 'dat.gui'
let scene, camera, renderer, mesh, labelRenderer
let stats
// 轨道控制器
let controls
const group1 = new THREE.Group()
function init () {
  // 创建3D场景对象Scene
  scene = new THREE.Scene()
  // 实例化一个透视投影相机对象
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100)
  // camera.position.z = 0.1
  camera.position.z = 6
  // 4. 创建渲染器，并设置画布大小，添加到 DOM 显示
  renderer = new THREE.WebGLRenderer({ antialias: true })
  // 设置画布大小
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.append(renderer.domElement)
}
function controlsCreate () {
  // 2. 创建轨道控制器
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  // controls.autoRotate = true
  // controls.maxPolarAngle = Math.PI
  // controls.minPolarAngle = 0
  // // // 水平角度范围控制
  // controls.maxAzimuthAngle = 1.5 * Math.PI
  // controls.minAzimuthAngle = 0.5 * Math.PI
  // // 4. 摄像机移动范围控制
  // controls.minDistance = 2
  // controls.maxDistance = 1
}
function rendloop () {
  // 传入场景和摄像机，渲染画面
  renderer.render(scene, camera)
  labelRenderer && labelRenderer.render(scene, camera)
  controls.update()
  stats.update()
  requestAnimationFrame(rendloop)
}
function createAxesHelper () {
  // AxesHelper：辅助观察的坐标系
  const axesHelper = new THREE.AxesHelper()
  scene.add(axesHelper)
}
function createDom () {
  //创建一个长方体几何对象Geometry
  const geometry = new THREE.BoxGeometry(1, 1, 1)
  // 1. 定义颜色数组（x 正负，y 正负，z 正负）
  const colorArr = ['red', 'green', 'blue', 'pink', 'orange', 'write']
  const newMeshColors = colorArr.map(item => {
    return new THREE.MeshBasicMaterial({
      color: item,
      transparent: true,//开启透明
      opacity: 0.5,//设置透明度
    })
  })
  // 两个参数分别为几何体geometry、材质material
  mesh = new THREE.Mesh(geometry, newMeshColors) //网格模型对象Mesh
  scene.add(mesh)
}
function reseizeWin () {
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight)
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
  })
}
function moveCube () {
  mesh.position.set(1, 1, 0)
  mesh.rotation.x = Math.PI / 4
  mesh.scale.z = 2
}
function createGUI () {
  const gui = new dat.GUI()

  //改变交互界面style属性
  gui.add(document, 'title')
  gui.add(mesh, 'visible')
  gui.add(controls, 'reset')
  gui.domElement.style.right = '0px'
  gui.domElement.style.width = '300px'
  //创建一个对象，对象属性的值可以被GUI库创建的交互界面改变
  // 创建材质子菜单
  const matFolder = gui.addFolder('位置')
  matFolder.add(mesh.position, 'x', 0, 10, 0.1)
  matFolder.add(mesh.position, 'y', 0, 10, 0.1)
  matFolder.add(mesh.position, 'z', 0, 10, 0.1)
  const obj = {
    color: 0x00ffff,
  }
  // .addColor()生成颜色值改变的交互界面
  matFolder.addColor(obj, 'color').onChange(function (value) {
    mesh.material.color.set(value)
  })
  const matFolderFa = gui.addFolder('解决方案')
  // 参数3数据类型：数组(下拉菜单)
  matFolderFa.add({ type: '1' }, 'type', { '方案1': '1', '方案2': '2' }).name('解决方案').onChange(function (val) {
    // val 方案对象的 '1','2'
    switch (val) {
      case '1':
        mesh.position.set(0, 0, 0)
        break
      case '2':
        mesh.position.set(2, 2, 2)
        break
    }
  })

}
function createDoms () {
  const cubeInfoArr = []
  for (let index = 0; index < 5; index++) {
    cubeInfoArr.push({
      color: `rgb(${Math.floor(Math.random() * (255 - 0 + 1) + 0)}, ${Math.floor(Math.random() * (255 - 0 + 1) + 0)}, ${Math.floor(Math.random() * (255 - 0 + 1) + 0)})`,
      w: Math.floor(Math.random() * (3 - 1 + 1) + 1),
      h: Math.floor(Math.random() * (3 - 1 + 1) + 1),
      d: Math.floor(Math.random() * (3 - 1 + 1) + 1),
      x: Math.floor(Math.random() * (5 - -5 + 1) + -5),
      y: Math.floor(Math.random() * (5 - -5 + 1) + -5),
      z: Math.floor(Math.random() * (5 - -5 + 1) + -5),
    })
  }
  cubeInfoArr.map(m => {
    const { color, w, h, d, x, y, z } = m
    const geometry = new THREE.BoxGeometry(w, h, d)
    const material = new THREE.MeshBasicMaterial({ color })
    let meshs = new THREE.Mesh(geometry, material) //网格模型对象Mesh
    meshs.position.set(x, y, z)
    meshs.name = 'cft'
    group1.add(meshs)
  })
  scene.add(group1)
}
function createStats () {
  // 2. 创建性能监视器
  stats = new Stats()
  // 3. 设置监视器面板类型（0：fps-每秒传输帧数，1：ms-每帧刷新用时，2：mb-内存占用）
  stats.setMode(0)
  // 4. 设置监视器位置并添加 DOM
  stats.domElement.style.position = 'fixed'
  stats.domElement.style.left = '0'
  stats.domElement.style.top = '0'
  document.body.appendChild(stats.domElement)
}
function remoMeshpp () {
  window.addEventListener('dblclick', () => {
    // let sceneItemArr = scene.children
    // let newArr = sceneItemArr.filter(items => items.name === 'cft')
    // if (newArr.length > 0) {
    //   let newItemObj = newArr[0]
    //   newItemObj.geometry.dispose()
    //   newItemObj.material.dispose()
    //   scene.remove(newItemObj)
    // }
    group1.children.map(mm => {
      mm.geometry.dispose()
      mm.material.dispose()
      group1.remove(mm)
    })
    scene.remove(group1)
  })
}

function createPointDom () {
  const geometry = new THREE.SphereGeometry(1, 32, 16)
  const material = new THREE.PointsMaterial({ color: 0x6600ff, size: 0.05 })

  const points = new THREE.Points(geometry, material)

  scene.add(points)
}
function createLintDom () {
  const geometry = new THREE.SphereGeometry(1, 32, 16)
  const material = new THREE.LineBasicMaterial({
    color: 0x6600ff, linewidth: 1,
    linecap: 'round', //ignored by WebGLRenderer
    linejoin: 'round' //ignored by WebGLRenderer
  })

  const points = new THREE.Line(geometry, material)

  scene.add(points)
}
function createMap () {
  const geometry = new THREE.SphereGeometry(1, 32, 16)
  const texture = new THREE.TextureLoader().load('/src/assets/image/earth/earth.png')
  const material = new THREE.MeshBasicMaterial({
    map: texture
  })
  const sphere = new THREE.Mesh(geometry, material)
  scene.add(sphere)
}
function createCubeMap () {

  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const imgUrlArr = ['posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg']
  const texture = new THREE.TextureLoader()
  texture.setPath('./src/assets/image/park/')
  // 立即使用纹理进行材质创建
  let imgUrlArrNew = imgUrlArr.map(item => {
    let textureItm = texture.load(item)
    // three.js 颜色通道为 rgb 颜色（为了防止图片太浅）
    textureItm.colorSpace = THREE.SRGBColorSpace
    return new THREE.MeshBasicMaterial({
      map: textureItm,
      side: THREE.DoubleSide
    })
  })
  const cube = new THREE.Mesh(geometry, imgUrlArrNew)
  cube.scale.set(1, 1, -1)
  scene.add(cube)
}
/**
 * 平面
 * 视频纹理
 */
function createPlaneMap () {
  const geometry = new THREE.PlaneGeometry(1, 0.5)

  const video = document.createElement('video')
  video.src = './src/assets/video/mouse_cat.mp4'
  video.muted = true
  video.addEventListener('loadedmetadata', () => {
    video.play() // 开始播放视频
  })
  const texture = new THREE.VideoTexture(video)


  const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
  const plane = new THREE.Mesh(geometry, material)
  scene.add(plane)
  const button = document.createElement('button')
  button.innerHTML = '开启声音'
  button.style.position = 'fixed'
  button.style.left = '0'
  button.style.bottom = '0'
  document.body.appendChild(button)
  button.addEventListener('click', () => {
    video.muted = false // 关闭静音
  })
}
function domTo3D () {
  // 创建dom
  // 标签-3ddom  CSS3DObject, CSS3DRenderer 并把 DOM 转换成 3D 物体并加入到场景中
  //渲染
  const spanTag = document.createElement('span')
  spanTag.innerHTML = '我是文字'
  spanTag.style.pointerEvents = 'all'
  spanTag.style.color = 'white'
  spanTag.addEventListener('click', e => {
    alert('dom 被点击了')
    e.stopPropagation()
  })
  const tag3d = new CSS3DObject(spanTag)
  tag3d.scale.set(1 / 16, 1 / 16, 1 / 16)
  scene.add(tag3d)

  labelRenderer = new CSS3DRenderer()
  labelRenderer.setSize(window.innerWidth, window.innerHeight)
  labelRenderer.domElement.style.pointerEvents = 'none' // 让标签触发鼠标交互事件
  labelRenderer.domElement.style.position = 'fixed'
  labelRenderer.domElement.style.left = '0'
  labelRenderer.domElement.style.top = '0'
  document.body.appendChild(labelRenderer.domElement)
}
function bindClick3d () {
  window.addEventListener('click', (event) => {
    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1
    pointer.y = - (event.clientY / window.innerHeight) * 2 + 1
    // 通过摄像机和鼠标位置更新射线
    raycaster.setFromCamera(pointer, camera)
    const intersects = raycaster.intersectObjects(scene.children)
    console.log('intersects', intersects)
  })
}

// 初始化 场景 相机 渲染器
init()
// 坐标轴
createAxesHelper()
//相机轨道控制器
controlsCreate()
// 长方体
createDom()
// createDoms()
// 创建点物体
// createPointDom()
// 创建线物体
// createLintDom()
// 创建全景图贴图
// createMap()
// 立体贴图
// createCubeMap()
// 视频纹理
// createPlaneMap()
// 文字3d
// domTo3D()
// 点击事件绑定
bindClick3d()
// 适配 改变    渲染器的canvas大小   相机的宽高比和更新
reseizeWin()
// moveCube()
// 循环渲染
createStats()
rendloop()
// createGUI()
// remoMeshpp()
createApp(App).mount('#app')
