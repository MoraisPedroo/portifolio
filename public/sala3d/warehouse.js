import * as THREE from './vendor/three.module.js';
import { OrbitControls } from './vendor/OrbitControls.js';
import { createAsset as createMultifunctionPrinter } from './vendor/polyfork-multifunction-printer.js';
import { HumanWorker } from './human-worker.js';
import { ShipmentMotion, WORK_POINT } from './shipment-motion.js?v=44';
import { shipmentFrame, SHIPMENT_PHASES, ROOM, RACK, RACK_BAYS, REAR_RACK, REAR_RACK_BAYS, DOOR_DESK, PACKAGES, UNIT_DIMENSIONS, PREPARATION, EXIT, itemCoordinates } from './data.js?v=44';

const ease = t => t * t * (3 - 2 * t);
const vec = (x, y, z) => new THREE.Vector3(x, y, z);
const point = p => vec(p.x, p.y, p.z);
const INTRO_NIGHT = new THREE.Color('#0f2036'); // mesmo azul da tela de carregamento do EstoqueNTO

export class WarehouseScene {
  constructor(container, { shelves, items, onSelect, onProgress, onComplete, onError }) {
    this.container = container;
    this.callbacks = { onSelect, onProgress, onComplete, onError };
    this.shelves = shelves;
    this.meshes = new Map(); this.materials = new Map(); this.geometries = new Map(); this.labels = new Map();
    this.filter = 'all'; this.depthFilter = 'all'; this.areaFilter = 'all';
    this.disposed = false; this.dirty = true;
    // A simulação de envio é um pedido explícito do usuário, então roda sempre animada.
    // Antes seguia o "reduzir movimento" do sistema (Windows com "Efeitos de animação"
    // desligado): o envio terminava na hora e parecia que o botão não fazia nada.
    this.reducedMotion = { matches: false };
    this.scene = new THREE.Scene(); this.scene.background = new THREE.Color('#eaf0f5');
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    this.renderer.shadowMap.enabled = true; this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1.1;
    this.renderer.domElement.setAttribute('aria-label', 'Estoque em 3D. Arraste para girar. A lista permite selecionar caixas pelo teclado.');
    container.appendChild(this.renderer.domElement);
    this.camera = new THREE.OrthographicCamera(-6, 6, 5, -5, .01, 100);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    Object.assign(this.controls, { enableDamping: true, dampingFactor: .09, minZoom: .65, maxZoom: 5, minPolarAngle: .04, maxPolarAngle: Math.PI / 2.05, screenSpacePanning: true });
    this.changeListener = () => { this.dirty = true; };
    this.controls.addEventListener('change', this.changeListener);
    this.scene.add(new THREE.HemisphereLight(0xf6f8ff, 0xb7b6af, 2.5));
    const sun = new THREE.DirectionalLight(0xfffbf4, 2.7); sun.position.set(-3, 10, 7); sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: .1, far: 30 });
    sun.shadow.normalBias = .015; sun.shadow.bias = -.0001; this.scene.add(sun);
    this.buildRoom();
    this.buildWorker();
    this.workerReady = this.loadHumanWorker();
    this.stockGroup = new THREE.Group(); this.scene.add(this.stockGroup);
    this.outline = new THREE.Box3Helper(new THREE.Box3(), 0xe88a2a);
    Object.assign(this.outline.material, { depthTest: false, transparent: true, opacity: .95 });
    this.outline.renderOrder = 10; this.outline.visible = false; this.scene.add(this.outline);
    this.parcels = new Map();
    for (const model of Object.keys(PACKAGES)) {
      const parcel = this.buildOpenCarton(model); parcel.visible = false; this.scene.add(parcel); this.parcels.set(model, parcel);
    }
    this.setItems(items);
    this.raycaster = new THREE.Raycaster(); this.pointer = new THREE.Vector2();
    this.pointerDown = e => { if (this.intro) this.finishIntro(); this.pointerStart = { x: e.clientX, y: e.clientY }; };
    this.pointerUp = e => {
      if (this.shipment || !this.pointerStart || Math.hypot(e.clientX - this.pointerStart.x, e.clientY - this.pointerStart.y) > 5) return;
      const item = this.pick(e); if (item) this.callbacks.onSelect?.(item);
    };
    this.pointerMove = e => { if (!this.shipment && !e.buttons) this.renderer.domElement.style.cursor = this.pick(e) ? 'pointer' : 'grab'; };
    this.contextLost = e => { e.preventDefault(); this.cancelShipment(); this.callbacks.onError?.('A conexão gráfica foi interrompida. Recarregue a prévia para continuar.'); };
    const canvas = this.renderer.domElement;
    canvas.addEventListener('pointerdown', this.pointerDown); canvas.addEventListener('pointerup', this.pointerUp);
    canvas.addEventListener('pointermove', this.pointerMove); canvas.addEventListener('webglcontextlost', this.contextLost);
    this.resizeObserver = new ResizeObserver(() => this.resize()); this.resizeObserver.observe(container);
    this.setView('iso'); this.lastTime = performance.now(); this.tick = this.tick.bind(this);
    this.frameId = requestAnimationFrame(this.tick);
  }


  material(color, options = {}) {
    const key = color + JSON.stringify(options);
    if (!this.materials.has(key)) this.materials.set(key, new THREE.MeshStandardMaterial({ color, roughness: .72, metalness: .02, ...options }));
    return this.materials.get(key);
  }

  box(parent, w, h, d, x, y, z, color, { rounded = false, shadow = true, ...materialOptions } = {}) {
    const key = `${w}/${h}/${d}/${rounded}`;
    if (!this.geometries.has(key)) {
      let geometry;
      if (rounded) {
        const radius = Math.min(w, h, d) * .13;
        const shape = new THREE.Shape();
        const left = -w / 2 + radius, right = w / 2 - radius, low = -h / 2 + radius, high = h / 2 - radius;
        shape.moveTo(left, low); shape.lineTo(right, low); shape.lineTo(right, high); shape.lineTo(left, high); shape.closePath();
        geometry = new THREE.ExtrudeGeometry(shape, { depth: d - 2 * radius, bevelEnabled: true, bevelSize: radius, bevelThickness: radius, bevelSegments: 2, steps: 1, curveSegments: 1 });
        geometry.translate(0, 0, -d / 2 + radius);
      } else geometry = new THREE.BoxGeometry(w, h, d);
      this.geometries.set(key, geometry);
    }
    const mesh = new THREE.Mesh(this.geometries.get(key), this.material(color, materialOptions));
    mesh.position.set(x, y, z);
    mesh.castShadow = shadow;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  cylinder(parent, radius, height, x, y, z, color, rotation = 0) {
    const key = `cylinder/${radius}/${height}`;
    if (!this.geometries.has(key)) this.geometries.set(key, new THREE.CylinderGeometry(radius, radius, height, 16));
    const mesh = new THREE.Mesh(this.geometries.get(key), this.material(color));
    mesh.position.set(x, y, z);
    mesh.rotation.z = rotation;
    mesh.castShadow = true;
    parent.add(mesh);
    return mesh;
  }

  text(parent, text, x, y, z, width, { color = '#435d75', background = null, sprite = false, floor = false, height = .32 } = {}) {
    const key = JSON.stringify({ text, color, background });
    if (!this.labels.has(key)) {
      const canvas = document.createElement('canvas');
      canvas.width = 1024; canvas.height = 160;
      const ctx = canvas.getContext('2d');
      if (background) { ctx.fillStyle = background; ctx.fillRect(0, 0, 1024, 160); }
      ctx.fillStyle = color; ctx.font = '600 64px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 512, 84, 970);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      this.labels.set(key, texture);
    }
    const map = this.labels.get(key);
    let label;
    if (sprite) {
      label = new THREE.Sprite(new THREE.SpriteMaterial({ map, depthWrite: false, depthTest: false }));
      label.scale.set(width, height, 1);
      label.renderOrder = 4;
    } else {
      label = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
      if (floor) label.rotation.x = -Math.PI / 2;
    }
    label.position.set(x, y, z);
    parent.add(label);
    return label;
  }

  buildWorker() {
    const worker = new THREE.Group(); this.scene.add(worker); this.worker = worker;
    this.box(worker, .36, .48, .24, 0, 1.17, 0, '#f4f5ef', { rounded: true });
    this.box(worker, .35, .16, .23, 0, .87, 0, '#364451', { rounded: true });
    if (typeof document !== 'undefined') {
      const logo = new THREE.TextureLoader().load(new URL('./assets/dp-shirt-logo.png', import.meta.url).href, () => { this.dirty = true; });
      logo.colorSpace = THREE.SRGBColorSpace; this.labels.set('worker-logo', logo);
      const print = new THREE.Mesh(new THREE.PlaneGeometry(.30, .0836), new THREE.MeshBasicMaterial({ map: logo, transparent: true, depthWrite: false }));
      print.position.set(0, 1.265, .122); worker.add(print);
      const backPrint = print.clone(); backPrint.position.set(0, 1.275, -.122); backPrint.rotation.y = Math.PI; worker.add(backPrint);
    }
    this.cylinder(worker, .063, .09, 0, 1.455, 0, '#bb8967');
    this.box(worker, .235, .265, .225, 0, 1.61, .01, '#c99b78', { rounded: true });
    this.box(worker, .245, .08, .235, 0, 1.725, .005, '#383c40', { rounded: true });
    for (const x of [-.049, .049]) this.box(worker, .017, .017, .008, x, 1.635, .126, '#303b43', { shadow: false });
    const legs = [], arms = [];
    for (const side of [-1, 1]) {
      const leg = new THREE.Group(); leg.position.set(side * .105, .82, 0); worker.add(leg);
      this.box(leg, .135, .70, .15, 0, -.35, 0, '#425363', { rounded: true });
      this.box(leg, .15, .085, .26, 0, -.755, .05, '#26313b', { rounded: true }); legs.push(leg);
      const upper = this.cylinder(worker, .064, 1, 0, 0, 0, '#f4f5ef');
      const lower = this.cylinder(worker, .046, 1, 0, 0, 0, '#bb8967');
      const hand = this.box(worker, .075, .085, .09, 0, 0, 0, '#c99b78', { rounded: true });
      arms.push({ side, upper, lower, hand });
    }
    worker.userData = { legs, arms, stride: 0 };
    this.resetWorker();
    // Keep the lightweight proxy hidden while the finished human model loads.
    // The parent becomes visible only after the proxy parts have been removed.
    worker.visible = false;
  }

  resetWorker() {
    if (!this.worker) return;
    this.worker.position.set(WORK_POINT.x + .44, 0, WORK_POINT.z);
    this.worker.rotation.y = -Math.PI / 2;
    this.worker.userData.stride = 0;
    this.poseWorker(null, 0);
    this.humanRig?.reset();
    this.lastHumanPose = null;
  }

  async loadHumanWorker() {
    const proxyParts = [...this.worker.children];
    const rig = await HumanWorker.load(this.worker, this.labels.get('worker-logo'), () => { this.dirty = true; });
    if (this.disposed) { rig.dispose(); return; }
    proxyParts.forEach(part => { part.visible = false; });
    this.humanRig = rig; this.worker.visible = true; this.dirty = true;
  }

  poseWorker(target, swing = 0, gesture = 0, obstacle = null) {
    const worker = this.worker;
    if (!worker) return;
    worker.userData.legs.forEach((leg, i) => { leg.rotation.x = swing * (i ? -1 : 1); });
    const inverse = worker.quaternion.clone().invert();
    for (const arm of worker.userData.arms) {
      const shoulder = vec(arm.side * .225, 1.36, 0);
      const explicit = Array.isArray(target);
      const worldTarget = explicit ? target[arm.side === -1 ? 0 : 1] : target;
      const handTarget = worldTarget ? worldTarget.clone().sub(worker.position).applyQuaternion(inverse).add(explicit ? vec(0, 0, 0) : vec(arm.side * .115, gesture * (arm.side === 1 ? 1 : .25), 0)) : vec(arm.side * .25, .78, .04);
      const direction = handTarget.clone().sub(shoulder), distance = THREE.MathUtils.clamp(direction.length(), .10, .69);
      direction.normalize();
      const hand = shoulder.clone().addScaledVector(direction, distance);
      if (obstacle) {
        // Keep the complete palm outside the carton, including when reach is clamped.
        const worldHand = hand.clone().applyQuaternion(worker.quaternion).add(worker.position);
        const { position: p, dimensions: d } = obstacle, pad = .075;
        if (Math.abs(worldHand.x - p.x) < d.width / 2 + pad && Math.abs(worldHand.z - p.z) < d.depth / 2 + pad && worldHand.y > p.y - pad && worldHand.y < p.y + d.height + pad) {
          if (worldTarget.y >= p.y + d.height + .05) worldHand.y = p.y + d.height + pad;
          else if (Math.abs(worker.position.x - p.x) >= Math.abs(worker.position.z - p.z)) worldHand.x = p.x + Math.sign(worker.position.x - p.x) * (d.width / 2 + pad);
          else worldHand.z = p.z + Math.sign(worker.position.z - p.z) * (d.depth / 2 + pad);
          hand.copy(worldHand.sub(worker.position).applyQuaternion(inverse));
        }
      }
      const reach = hand.clone().sub(shoulder), actualDistance = reach.length(); reach.normalize();
      const bend = vec(arm.side, -.3, -.5).addScaledVector(reach, -vec(arm.side, -.3, -.5).dot(reach)).normalize();
      const elbow = shoulder.clone().addScaledVector(reach, actualDistance / 2).addScaledVector(bend, Math.sqrt(Math.max(0, .35 ** 2 - (actualDistance / 2) ** 2)));
      for (const [mesh, a, b] of [[arm.upper, shoulder, elbow], [arm.lower, elbow, hand]]) {
        const bone = b.clone().sub(a);
        mesh.position.copy(a).add(b).multiplyScalar(.5);
        mesh.scale.y = bone.length(); mesh.quaternion.setFromUnitVectors(vec(0, 1, 0), bone.normalize());
      }
      arm.hand.position.copy(hand);
    }
  }

  animateWorker(phase, shipment, delta = .025) {
    const pose = shipment.motion.frame(phase);
    const carton = ['approaching', 'picking'].includes(phase.key) ? shipment.printer : shipment.parcel;
    carton.position.copy(pose.box); carton.quaternion.copy(pose.boxRotation);
    if (!this.worker) return;
    const distance = this.worker.position.distanceTo(pose.actor);
    this.worker.position.copy(pose.actor); this.worker.quaternion.copy(pose.rotation);
    this.worker.userData.stride += distance * 8;
    const speed = phase.key === 'done' ? 0 : distance / Math.max(delta, .001);
    const contacts = phase.key === 'approaching' ? null : shipment.motion.contacts(phase, pose, shipment.parcel);
    if (this.humanRig) {
      // Direct anatomical palm targets; the old proxy skeleton never drives the human.
      this.humanRig.update(delta, speed, contacts, null, phase.key, this.reducedMotion.matches);
      this.lastHumanPose = { contacts, phase: phase.key };
    } else {
      // Lightweight geometry remains only as a loading/headless fallback.
      const swing = speed > .01 ? Math.sin(this.worker.userData.stride) * .25 : 0;
      this.poseWorker(contacts ? contacts.slice().reverse().map(contact => contact.position) : null, swing, 0);
    }
  }
  buildRoom() {
    const room = new THREE.Group(); this.scene.add(room); this.room = room;
    const left = -ROOM.width / 2, right = ROOM.width / 2, back = ROOM.back, front = ROOM.front;
    const partitionX = left + ROOM.annexWidth, corridorLeft = partitionX + ROOM.wall;
    const partitionZ = back + ROOM.upperDepth, annexCenterZ = front - ROOM.annexDepth / 2;
    const doorWidth = 1.30, doorHeight = 2.30;
    const openingStart = EXIT.z - doorWidth / 2, openingEnd = EXIT.z + doorWidth / 2;
    this.box(room, ROOM.outerWidth, .18, ROOM.outerDepth, 0, -.14, ROOM.centerZ, '#bac6ce', { rounded: true });
    // L-shaped active floor. The annex has a solid cover and no interior geometry.
    this.box(room, ROOM.width, .045, ROOM.upperDepth, 0, -.025, back + ROOM.upperDepth / 2, '#e5e4df');
    this.box(room, ROOM.corridorWidth, .045, ROOM.depth - ROOM.upperDepth, corridorLeft + ROOM.corridorWidth / 2, -.025, (front + partitionZ) / 2, '#e5e4df');
    for (let x = left + .6; x < right; x += .6) {
      const lower = x < corridorLeft ? partitionZ : front;
      this.box(room, .005, .004, lower - back, x, .001, (lower + back) / 2, '#cfcec9', { shadow: false });
    }
    for (let z = back + .6; z < front; z += .6) {
      const start = z < partitionZ ? left : corridorLeft;
      this.box(room, right - start, .004, .005, (right + start) / 2, .002, z, '#cfcec9', { shadow: false });
    }
    this.box(room, ROOM.outerWidth, ROOM.height, .15, 0, ROOM.height / 2, back - .075, '#eeefec');
    this.box(room, .15, ROOM.height, ROOM.depth, left - .075, ROOM.height / 2, ROOM.centerZ, '#e5e7e5');
    this.box(room, ROOM.outerWidth, .08, .20, 0, ROOM.height, back - .075, '#fafaf7');
    this.box(room, .18, .08, ROOM.depth, left - .075, ROOM.height, ROOM.centerZ, '#fafaf7');
    // Front and right walls are cut down for the dollhouse view.
    this.box(room, ROOM.outerWidth, .24, .155, 0, .12, front + .0775, '#d8dedf');
    this.box(room, .15, .4, openingStart - back, right + .075, .2, (openingStart + back) / 2, '#dfe3e3');
    this.box(room, .15, .4, front - openingEnd, right + .075, .2, (front + openingEnd) / 2, '#dfe3e3');
    this.box(room, ROOM.width, .08, .022, 0, .045, back + .01, '#bfc6c8');
    // Exact annex proportions from the drawing: 3.88 × 1.89 m plus 15 cm partitions.
    this.box(room, ROOM.annexWidth, .44, ROOM.annexDepth, left + ROOM.annexWidth / 2, .20, annexCenterZ, '#c9ced1');
    for (let n = 0; n < 17; n++) {
      const stripe = this.box(room, .015, .002, 1.7, left + .13 + n * .22, .423, annexCenterZ, '#b6bdc2', { shadow: false });
      stripe.rotation.y = .06;
    }
    this.text(room, 'SALA SEM VISUALIZAÇÃO', left + ROOM.annexWidth / 2, .43, annexCenterZ, 2.55, { floor: true, height: .26, color: '#7e8a93' });
    this.box(room, .15, .65, front - partitionZ, partitionX + .075, .325, (front + partitionZ) / 2, '#d7dddd');
    this.box(room, 2.75, .65, .15, left + 2.75 / 2, .325, partitionZ + .075, '#d7dddd');
    this.box(room, .29, .65, .15, partitionX - .29 / 2, .325, partitionZ + .075, '#d7dddd');
    // Internal doorway is a marker only; the omitted annex is never entered.
    this.box(room, .84, .035, .17, left + 2.75 + .42, .018, partitionZ + .075, '#aebdc4');
    // Right-hand exit stops the shipment at the threshold.
    for (const z of [openingStart, openingEnd]) this.box(room, .14, doorHeight, .065, right + .04, doorHeight / 2, z, '#aaa99d');
    this.box(room, .14, .065, doorWidth + .065, right + .04, doorHeight, EXIT.z, '#aaa99d');
    this.box(room, .19, .015, doorWidth, right + .03, .008, EXIT.z, '#a9b8bb');
    // Unequal double leaves, matching the reference: narrow leaf closed, main leaf open.
    this.box(room, .045, doorHeight - .07, .34, right, (doorHeight - .07) / 2, openingStart + .205, '#b9b8aa');
    this.door = new THREE.Group(); this.door.position.set(right, 0, openingEnd);
    this.box(this.door, .045, doorHeight - .07, .90, 0, (doorHeight - .07) / 2, -.45, '#b9b8aa');
    this.box(this.door, .024, .045, .12, -.037, 1.0, -.75, '#768a91');
    this.door.rotation.y = Math.PI / 2.25; room.add(this.door);
    const exitSign = this.text(room, 'SAÍDA', right - .15, doorHeight + .20, EXIT.z, .90, { height: .23, color: '#4a7265', background: '#f1f7f3' });
    exitSign.rotation.y = -Math.PI / 2;
    // Physical rack bays: the same structures carry several named areas and depths.
    for (const bay of RACK_BAYS) this.buildRack(room, bay.x, bay.width, bay.levels, bay.height);
    this.buildRearRacks(room);
    for (const shelf of this.shelves) this.rackSign(room, shelf.signName || shelf.name, shelf.x, shelf.base - .045, Math.min(1.25, shelf.width));
    // Upper half: fill both levels with toner boxes in all three depths.
    // Each position is stacked three cartons high at the supplied
    // 17.7 × 13.2 × 31.7 cm size.
    for (let bayIndex = 0; bayIndex < 2; bayIndex++) {
      const bay = RACK_BAYS[bayIndex];
      for (const shelfY of [1.40, 1.99]) {
        const cols = Math.floor((bay.width - .06) / .19);
        for (let depthIndex = 0; depthIndex < 3; depthIndex++) for (let col = 0; col < cols; col++) for (let stack = 0; stack < 3; stack++) {
          const toner = this.buildTonerBox();
          toner.userData.storageDepth = ['FRENTE', 'MEIO', 'FUNDO'][depthIndex];
          toner.position.set(
            bay.x + (col - (cols - 1) / 2) * .19,
            shelfY + .0175 + stack * .134,
            RACK.z + .38 - depthIndex * .38,
          );
          room.add(toner);
        }
      }
      // Lower half: two A4 printers on each usable level.
      for (const shelfY of [.17, .77]) for (const side of [-1, 1]) {
        const printer = this.buildA4Printer();
        printer.position.set(bay.x + side * bay.width * .23, shelfY + .0175, RACK.z + .25); room.add(printer);
      }
    }
    // Preparation desks remain empty until a simulation places a box on them.
    this.buildTable(room, PREPARATION.x, PREPARATION.z, PREPARATION.width, PREPARATION.length);
    const frontDeskStart = PREPARATION.z + PREPARATION.length / 2;
    const frontDeskEnd = front - .60;
    const frontDeskLength = frontDeskEnd - frontDeskStart;
    this.buildTable(room, PREPARATION.x, (frontDeskStart + frontDeskEnd) / 2, PREPARATION.width, frontDeskLength);
    this.text(room, 'MESA DE PREPARAÇÃO', PREPARATION.x + .06, .065, PREPARATION.z - PREPARATION.length / 2 - .225, 1.82, { floor: true, height: .20, color: '#637685' });
    const cornerDeskDepth = .61, cornerDeskWallGap = .035, cornerDeskJoin = partitionZ - .635;
    this.buildTable(room, left + cornerDeskWallGap + cornerDeskDepth / 2, partitionZ - 1.2275, cornerDeskDepth, 1.185);
    this.buildTable(room, left + cornerDeskWallGap + 2.37 / 2, cornerDeskJoin + cornerDeskDepth / 2, 2.37, cornerDeskDepth);
    this.buildTable(room, DOOR_DESK.x, (DOOR_DESK.start + DOOR_DESK.end) / 2, DOOR_DESK.width, DOOR_DESK.end - DOOR_DESK.start, 2);
    // Small empty rack at the lower end of the corridor in the supplied plan.
    const lowerRackLeft = corridorLeft;
    const lowerRackRight = right - .37;
    const lowerRackWidth = lowerRackRight - lowerRackLeft;
    const lowerRackCenter = (lowerRackLeft + lowerRackRight) / 2;
    const lowerRack = new THREE.Group(); lowerRack.position.set(lowerRackCenter, 0, front - .28); room.add(lowerRack);
    // Keep the original right bay and add a supported extension up to the wall.
    const lowerRackPosts = [lowerRackLeft, lowerRackRight - 2.26, lowerRackRight].map(x => x - lowerRackCenter);
    for (const x of lowerRackPosts) for (const z of [-.23, .23]) this.box(lowerRack, .035, .90, .035, x, .45, z, '#727c7f');
    for (const y of [.12, .53, .88]) this.box(lowerRack, lowerRackWidth, .045, .48, 0, y, 0, '#9aa2a2');
  }

  buildRack(parent, x, width, levels, height, z = RACK.z) {
    const rack = new THREE.Group(); rack.position.set(x, 0, z); parent.add(rack);
    for (const px of [-width / 2, width / 2]) for (const pz of [-.565, .565]) {
      this.box(rack, .038, height, .038, px, height / 2, pz, '#667276', { metalness: .45 });
      for (let y = .22; y < height; y += .17) this.box(rack, .012, .027, .004, px, y, pz + .021, '#bbc2c3', { shadow: false });
    }
    for (const y of levels) {
      this.box(rack, width, .035, 1.16, 0, y, 0, '#939d9f', { metalness: .25 });
      this.box(rack, width, .055, .025, 0, y, .58, '#6f7b7e', { metalness: .4 });
    }
    const brace = this.box(rack, .016, height, .016, 0, height / 2, -.58, '#a8afb0');
    brace.rotation.z = .36;
    return rack;
  }

  buildRearRacks(parent) {
    const row = new THREE.Group(); row.name = 'rear-reference-racks'; parent.add(row);
    for (let bayIndex = 0; bayIndex < REAR_RACK_BAYS.length; bayIndex++) {
      const bay = REAR_RACK_BAYS[bayIndex];
      const rack = this.buildRack(row, bay.x, bay.width, bay.levels, bay.height, REAR_RACK.z);
      rack.rotation.y = Math.PI;
      for (let level = 0; level < bay.levels.length; level++) {
        const bottom = bay.levels[level] + .0175;
        const nextLevel = bay.levels[level + 1] ?? bay.height;
        const availableHeight = Math.max(.08, nextLevel - bay.levels[level] - .065);
        const cols = Math.floor((bay.width - .08) / .30);
        for (let depthIndex = 0; depthIndex < 3; depthIndex++) for (let col = 0; col < cols; col++) {
          const seed = bayIndex * 53 + level * 17 + depthIndex * 7 + col * 3;
          const stack = this.buildITStorageStack(seed, availableHeight);
          stack.userData.storageDepth = ['FRENTE', 'MEIO', 'FUNDO'][depthIndex];
          stack.position.set((col - (cols - 1) / 2) * .30, bottom, .38 - depthIndex * .38);
          rack.add(stack);
        }
      }
    }
    this.text(parent, 'CORREDOR DE ACESSO · 0,60 m', -.8, .025, ROOM.back + REAR_RACK.aisle / 2, 2.7, { floor: true, height: .20, color: '#637685' });
    return row;
  }

  rackSign(parent, name, x, y, width) {
    this.box(parent, width, .074, .007, x, y, RACK.z + .593, '#344651', { shadow: false });
    this.text(parent, name.toUpperCase(), x, y, RACK.z + .598, width - .05, { height: .068, color: '#fff8e4' });
  }

  buildTable(parent, x, z, width, depth, middleSupportPairs = 0) {
    this.box(parent, width, .04, depth, x, .76, z, '#607986', { rounded: true });
    this.box(parent, width + .01, .018, depth + .01, x, .744, z, '#bfc9cc');
    const supportRows = [z - depth / 2 + .08, z + depth / 2 - .08];
    for (let index = 1; index <= middleSupportPairs; index++) supportRows.push(z - depth / 2 + depth * index / (middleSupportPairs + 1));
    for (const px of [x - width / 2 + .06, x + width / 2 - .06]) for (const pz of supportRows) {
      this.box(parent, .035, .72, .035, px, .36, pz, '#b1bcc0');
      this.box(parent, .055, .025, .09, px, .013, pz, '#68767d');
    }
    this.box(parent, .025, .17, depth - .15, x, .5, z, '#b8c2c6');
  }

  boxLabel(parent, model, code, dimensions, muted = false) {
    const key = 'label/' + model + '/' + code;
    if (!this.labels.has(key)) {
      const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 192;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = muted ? '#eeeade' : '#fffdf5'; ctx.fillRect(0, 0, 256, 192);
      ctx.strokeStyle = muted ? '#bcb7aa' : '#d4cec0'; ctx.lineWidth = 5; ctx.strokeRect(3, 3, 250, 186);
      const labelText = String(code || 'SELB').toUpperCase();
      let fontSize = 92;
      ctx.font = `900 ${fontSize}px Arial`;
      while (ctx.measureText(labelText).width > 226 && fontSize > 38) {
        fontSize -= 3;
        ctx.font = `900 ${fontSize}px Arial`;
      }
      ctx.fillStyle = muted ? '#5c5c58' : '#16283e';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.save();
      ctx.translate(128, 98);
      ctx.scale(1, 1.55);
      ctx.fillText(labelText, 0, 0);
      ctx.restore();
      const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; this.labels.set(key, texture);
    }
    const label = new THREE.Mesh(new THREE.PlaneGeometry(dimensions.width * .61, dimensions.height * .57), new THREE.MeshBasicMaterial({ map: this.labels.get(key) }));
    label.position.set(-dimensions.width * .075, dimensions.height * .54, dimensions.depth / 2 + .0015);
    parent.add(label);
  }

  buildCarton(item, dimensions = PACKAGES[item.model], muted = false) {
    const group = new THREE.Group(); const { width: w, height: h, depth: d } = dimensions;
    this.box(group, w, h, d, 0, h / 2, 0, muted ? '#b7a183' : '#bc945e');
    this.box(group, .035, .002, d + .002, 0, h + .001, 0, '#d1b789', { shadow: false });
    this.box(group, .035, h, .002, 0, h / 2, -d / 2 - .001, '#d1b789', { shadow: false });
    this.boxLabel(group, item.model, item.selb, dimensions, muted);
    return group;
  }

  buildTonerBox() {
    const toner = this.buildCarton({ model: 'TONER', selb: '' }, { width: .177, height: .132, depth: .317 }, true);
    toner.name = 'toner-box'; toner.userData.assetType = 'toner'; toner.userData.dimensions = { width: .177, height: .132, depth: .317 }; return toner;
  }

  buildA4Printer() {
    const printer = createMultifunctionPrinter({
      body: '#f4f5f3',
      fronts: '#e4e7e5',
      topcover: '#252c31',
      recess: '#151b1f',
      screen: '#53a9c5',
      accent: '#f28a3d',
      paper: '#fbfaf6',
      drawers: 2,
      feeder: true,
      era: .78,
      occupancy: .25,
    });
    printer.name = 'a4-printer';
    printer.userData.assetType = 'a4-printer';
    // Fit the real-world floor model onto the 60 cm shelf while keeping its
    // tall multifunction silhouette and the front facing the aisle.
    printer.scale.set(.48, .34, .42);
    printer.traverse(node => {
      if (!node.isMesh) return;
      node.castShadow = true;
      node.receiveShadow = true;
    });
    return printer;
  }

  buildITAsset(kind) {
    const group = new THREE.Group(); group.name = 'it-' + kind; group.userData.assetType = kind;
    if (kind === 'notebook') {
      this.box(group, .27, .022, .19, 0, .011, 0, '#3b4650', { rounded: true });
      const screen = this.box(group, .27, .17, .018, 0, .10, -.085, '#26333d', { rounded: true }); screen.rotation.x = -.12;
      this.box(group, .225, .125, .004, 0, .10, -.096, '#718b9b', { shadow: false });
    } else if (kind === 'keyboard') {
      this.box(group, .28, .025, .115, 0, .013, 0, '#424d55', { rounded: true });
      for (let row = 0; row < 3; row++) this.box(group, .235, .005, .016, 0, .028, -.028 + row * .027, '#899398', { shadow: false });
    } else if (kind === 'mouse') {
      this.box(group, .085, .045, .12, -.065, .023, 0, '#38444c', { rounded: true });
      this.box(group, .085, .045, .12, .065, .023, 0, '#566872', { rounded: true });
    } else if (kind === 'board') {
      this.box(group, .26, .018, .18, 0, .009, 0, '#39755b');
      for (const x of [-.08, 0, .08]) this.box(group, .045, .025, .04, x, .03, 0, '#28343a', { shadow: false });
    } else if (kind === 'network') {
      this.box(group, .28, .07, .20, 0, .035, 0, '#4c5960', { rounded: true });
      for (let i = 0; i < 5; i++) this.box(group, .025, .018, .006, -.065 + i * .034, .038, .103, '#9db5a7', { shadow: false });
    } else {
      const parts = this.buildCarton({ model: 'PEÇAS', selb: '' }, { width: .26, height: .18, depth: .26 }, true); group.add(parts);
    }
    return group;
  }

  buildITStorageStack(seed, maxHeight) {
    const variants = [
      { kind: 'notebook', model: 'NOTEBOOK', width: .28, height: .08, depth: .27, color: '#aa9270' },
      { kind: 'keyboard', model: 'TECLADO', width: .29, height: .07, depth: .18, color: '#c0a77f' },
      { kind: 'mouse', model: 'MOUSES', width: .22, height: .11, depth: .22, color: '#88969b' },
      { kind: 'board', model: 'PLACAS', width: .27, height: .06, depth: .29, color: '#718d83' },
      { kind: 'parts', model: 'PEÇAS TI', width: .25, height: .14, depth: .25, color: '#b09570' },
      { kind: 'network', model: 'REDE', width: .28, height: .15, depth: .27, color: '#697982' },
    ];
    const stack = new THREE.Group(); stack.name = 'it-storage-stack';
    const desired = 2 + (seed % 2);
    let height = 0;
    for (let layer = 0; layer < desired; layer++) {
      let variant = variants[(seed + layer * 5) % variants.length];
      if (height + variant.height > maxHeight) {
        variant = variants.find(candidate => height + candidate.height <= maxHeight);
        if (!variant) break;
      }
      const carton = this.buildITStorageBox(variant);
      carton.position.set(((seed + layer) % 3 - 1) * .008, height, 0);
      carton.rotation.y = (((seed + layer * 2) % 5) - 2) * .012;
      stack.add(carton);
      height += variant.height + .008;
    }
    if (!stack.children.length) stack.add(this.buildITStorageBox(variants[seed % variants.length]));
    return stack;
  }

  buildITStorageBox({ kind, model, width, height, depth, color }) {
    const group = new THREE.Group();
    group.name = 'it-box-' + kind;
    group.userData.assetType = kind;
    const dimensions = { width, height, depth };
    this.box(group, width, height, depth, 0, height / 2, 0, color, { rounded: color !== '#aa9270' && color !== '#c0a77f' });
    this.box(group, .026, .002, depth + .002, 0, height + .001, 0, '#d1b789', { shadow: false });
    this.boxLabel(group, model, '', dimensions, true);
    return group;
  }

  buildUnit(model) {
    const group = new THREE.Group();
    const mobile = model === 'ZQ521';
    const { height: h, width: w, depth: d } = UNIT_DIMENSIONS[mobile ? 'ZQ521' : 'ZD230'];
    this.box(group, w, h, d, 0, h / 2, 0, '#354047', { rounded: true });
    this.box(group, w * .8, .012, d * .8, 0, h, 0, '#4d575d', { rounded: true, shadow: false });
    this.box(group, w * .67, .014, .008, 0, h * .33, d / 2, '#18242a', { shadow: false });
    this.box(group, .018, .006, .022, w * .32, h + .01, d * .23, '#99b7a7', { shadow: false });
    if (mobile) this.box(group, .065, .004, .033, -.022, h + .012, 0, '#b4c9c9', { shadow: false });
    return group;
  }

  buildOpenCarton(model) {
    const dimensions = PACKAGES[model], { width: w, height: h, depth: d } = dimensions;
    const group = new THREE.Group(), t = .006;
    this.box(group, w, t, d, 0, t / 2, 0, '#aa824f');
    for (const x of [-w / 2 + t / 2, w / 2 - t / 2]) this.box(group, t, h, d, x, h / 2, 0, '#bc945e');
    for (const z of [-d / 2 + t / 2, d / 2 - t / 2]) this.box(group, w - 2 * t, h, t, 0, h / 2, z, '#bc945e');
    const flaps = [];
    for (const side of [-1, 1]) {
      const flap = new THREE.Group(); flap.position.set(side * w / 2, h, 0); group.add(flap);
      this.box(flap, w / 2, t, d, -side * w / 4, 0, 0, '#c8a56f', { shadow: false });
      flaps.push(flap);
    }
    const tape = this.box(group, .035, .002, d, 0, h + .004, 0, '#d1b789', { shadow: false });
    const unit = this.buildUnit(model); unit.position.y = .012; group.add(unit);
    const supplies = new THREE.Group();
    const roll = this.cylinder(supplies, .037, .084, 0, 0, 0, '#f6f4e7'); roll.rotation.z = Math.PI / 2;
    const core = this.cylinder(supplies, .012, .086, 0, 0, 0, '#9e927c'); core.rotation.z = Math.PI / 2;
    group.add(supplies);
    const ribbon = new THREE.Group();
    const spool = this.cylinder(ribbon, .022, .08, 0, 0, 0, '#27343b'); spool.rotation.z = Math.PI / 2; group.add(ribbon);
    this.boxLabel(group, model, 'PREPARAÇÃO', dimensions);
    const trackingLabel = this.buildTrackingLabel(); group.add(trackingLabel);
    group.userData = { flaps, tape, supplies, ribbon, model, dimensions, trackingLabel };
    this.setCartonOpen(group, 0); supplies.visible = false; ribbon.visible = false;
    return group;
  }

  buildTrackingLabel() {
    const key = 'tracking-demo';
    if (!this.labels.has(key)) {
      const canvas = document.createElement('canvas'); canvas.width = 384; canvas.height = 512;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 384, 512);
      ctx.strokeStyle = '#18242a'; ctx.lineWidth = 3; ctx.strokeRect(12, 12, 360, 488);
      ctx.fillStyle = '#18242a'; ctx.font = 'bold 38px Arial'; ctx.fillText('RASTREIO', 26, 68);
      ctx.font = 'bold 24px Arial'; ctx.fillText('DEMONSTRAÇÃO', 26, 111);
      ctx.fillRect(26, 138, 330, 3);
      ctx.font = '22px Arial'; ctx.fillText('ENVIO DE IMPRESSORA', 26, 180);
      ctx.font = '20px Arial'; ctx.fillText('ETIQUETA DE EXEMPLO', 26, 219);
      for (let n = 0; n < 53; n++) ctx.fillRect(28 + n * 6, 265, n % 3 === 0 ? 4 : 2, 105);
      ctx.font = 'bold 26px Arial'; ctx.fillText('DEMO 000 000', 65, 413);
      ctx.font = '18px Arial'; ctx.fillText('SEM VALIDADE POSTAL', 72, 469);
      const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; this.labels.set(key, texture);
    }
    const label = new THREE.Mesh(new THREE.PlaneGeometry(.18, .23), new THREE.MeshBasicMaterial({ map: this.labels.get(key), side: THREE.DoubleSide }));
    label.visible = false;
    return label;
  }

  setTrackingLabel(parcel, progress = null) {
    const label = parcel.userData.trackingLabel;
    label.visible = progress !== null;
    const p = progress === null ? 0 : THREE.MathUtils.clamp(progress, 0, 1);
    const approach = ease(Math.min(1, p / .7));
    const flatten = ease(THREE.MathUtils.clamp((p - .65) / .35, 0, 1));
    label.position.set(.045 * (1 - approach), parcel.userData.dimensions.height + .009 + .42 * (1 - approach) + .03 * (1 - flatten), 0);
    label.rotation.set(-Math.PI / 2 + .22 * (1 - flatten), 0, .15 * (1 - approach));
  }

  setCartonOpen(parcel, progress) {
    if (!parcel) return;
    parcel.userData.flaps[0].rotation.z = progress * 2.1;
    parcel.userData.flaps[1].rotation.z = -progress * 2.1;
    parcel.userData.tape.visible = progress < .015;
  }

  itemPosition(item) { return point(itemCoordinates(item, this.shelves)); }

  setItems(items) {
    this.cancelShipment();
    for (const mesh of this.meshes.values()) { this.stockGroup.remove(mesh); this.disposeUnique(mesh); }
    this.meshes.clear();
    for (const item of items) {
      const shelf = this.shelves.find(candidate => candidate.id === item.shelfId);
      const group = shelf?.renderMode === 'unit' ? this.buildUnit(item.model) : this.buildCarton(item);
      group.position.copy(this.itemPosition(item)); group.userData.item = { ...item };
      group.traverse(mesh => { mesh.userData.itemId = item.id; }); this.stockGroup.add(group); this.meshes.set(item.id, group);
    }
    if (this.intro) {
      // Estoque ao vivo chegou durante a abertura: troca as caixas antigas pelas novas na animação.
      const current = new Set(this.stockGroup.children);
      const kept = this.intro.pieces.filter(piece => piece.kind !== 'stock' || current.has(piece.obj));
      this.intro.pieces.length = 0; this.intro.pieces.push(...kept); // mesmo array (o trackStock usa ele)
      [...this.meshes.values()].forEach((group, i) => this.intro.trackStock(group, i + 500));
    }
    this.applyVisibility(); this.dirty = true;
  }

  matches(item) {
    return (this.filter === 'all' || item.model === this.filter) && (this.depthFilter === 'all' || item.depth === this.depthFilter) && (this.areaFilter === 'all' || item.shelfId === this.areaFilter);
  }
  applyVisibility() {
    for (const mesh of this.meshes.values()) mesh.visible = !mesh.userData.shipped && this.matches(mesh.userData.item);
    this.select(this.selectedId);
  }
  setFilter(model) { this.filter = model; this.applyVisibility(); }
  setDepth(depth) { this.depthFilter = depth; this.applyVisibility(); }
  setArea(area) { this.areaFilter = area; this.applyVisibility(); }

  select(id) {
    this.selectedId = id; const mesh = this.meshes.get(id);
    if (this.outline) {
      // Durante a abertura as caixas ainda estão "caindo": o contorno volta no finishIntro.
      this.outline.visible = !!mesh?.visible && !this.intro;
      if (mesh?.visible && !this.intro) { mesh.updateWorldMatrix(true, true); this.outline.box.setFromObject(mesh).expandByScalar(.014); }
    }
    this.dirty = true;
  }

  pick(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = this.raycaster.intersectObjects([...this.meshes.values()].filter(mesh => mesh.visible), true)[0];
    return hit ? this.meshes.get(hit.object.userData.itemId)?.userData.item : null;
  }

  setView(view) {
    const target = view === 'front' ? vec(.35 + RACK.shiftX, 1.33, RACK.z) : vec(.1, .5, ROOM.centerZ);
    this.controls.target.copy(target);
    this.camera.position.copy(target).add(view === 'top' ? vec(0, 16, .01) : view === 'front' ? vec(0, .25, 15) : vec(9, 10, 13));
    this.camera.zoom = view === 'front' ? 2 : 1;
    this.camera.lookAt(target); this.controls.update(); this.resize();
  }
  focus(id) {
    const mesh = this.meshes.get(id); if (!mesh?.visible || this.shipment) return;
    this.controls.target.copy(mesh.position).add(vec(0, .14, 0));
    this.camera.position.copy(this.controls.target).add(vec(1, .7, 4));
    this.camera.zoom = 4; this.camera.updateProjectionMatrix(); this.controls.update(); this.dirty = true;
  }
  zoom(factor) {
    this.camera.zoom = THREE.MathUtils.clamp(this.camera.zoom * factor, .65, 5);
    this.camera.updateProjectionMatrix(); this.dirty = true;
  }
  resize() {
    const width = Math.max(1, this.container.clientWidth), height = Math.max(1, this.container.clientHeight), aspect = width / height;
    const extent = Math.max(ROOM.depth + 2.5, (ROOM.width + 3.5) / aspect) / 2;
    Object.assign(this.camera, { left: -extent * aspect, right: extent * aspect, top: extent, bottom: -extent });
    this.camera.updateProjectionMatrix(); this.renderer.setSize(width, height, false); this.dirty = true;
  }

  // ---------- Abertura: a sala "se constrói" ----------
  // Planta azul com grade laranja → onda varre o chão e o piso aparece → paredes
  // sobem → estantes e mesas se erguem → caixas caem nas prateleiras em onda →
  // etiquetas e funcionário. A câmera desce da vista de cima (a planta 2D) até a
  // vista da sala e o fundo passa do azul-noite para a luz do dia.
  playIntro() {
    if (this.disposed || !this.room || this.shipment) return false;
    if (this.intro) this.finishIntro();
    const box = new THREE.Box3(), size = new THREE.Vector3(), mid = new THREE.Vector3();
    const minX = -ROOM.width / 2 - .3, spanX = ROOM.width + .6;
    const maxDist = Math.hypot(ROOM.outerWidth / 2, ROOM.outerDepth / 2);
    const jitter = i => { const v = Math.sin(i * 12.9898) * 43758.5453; return v - Math.floor(v); };
    const pieces = [];
    const track = (obj, forcedKind, i) => {
      obj.updateWorldMatrix(true, true);
      box.setFromObject(obj);
      if (box.isEmpty()) return;
      box.getSize(size); box.getCenter(mid);
      const xNorm = THREE.MathUtils.clamp((mid.x - minX) / spanX, 0, 1);
      const dist = Math.min(1, Math.hypot(mid.x, mid.z - ROOM.centerZ) / maxDist);
      const flat = obj.isSprite || (obj.isMesh && obj.geometry?.type === 'PlaneGeometry');
      let kind = forcedKind;
      if (!kind) {
        if (box.max.y < .1) kind = 'floor';
        else if (flat || (size.y < .1 && Math.max(size.x, size.z) < 1.6 && box.min.y > .1)) kind = 'label';
        else if (box.min.y > .1) kind = 'drop';
        else kind = size.y > ROOM.height * .85 && Math.max(size.x, size.z) > 3 ? 'wall' : 'rise';
      }
      const [delay, duration] = {
        floor: [.05 + dist * .85, .45],
        wall: [.65 + xNorm * .35, .7],
        rise: [.95 + xNorm * .75, .65],
        drop: [1.6 + xNorm * .9 + jitter(i) * .15, .55],
        stock: [2.15 + xNorm * .8 + jitter(i) * .12, .5],
        label: [2.7 + jitter(i) * .25, .35],
      }[kind];
      pieces.push({ obj, kind, delay, duration, position: obj.position.clone(), scale: obj.scale.clone(), bottom: box.min.y - obj.position.y });
    };
    this.room.children.forEach((child, i) => track(child, null, i));
    this.stockGroup.children.forEach((child, i) => track(child, 'stock', i + 500));
    const trackStock = (obj, i) => {
      track(obj, 'stock', i);
      const piece = pieces[pieces.length - 1];
      // Estoque que chega do Firebase no meio da abertura entra na próxima onda.
      if (piece?.obj === obj) piece.delay = Math.max(piece.delay, (this.intro?.elapsed || 0) + .05);
    };

    this.ensureIntroEffects();
    const target = vec(.1, .5, ROOM.centerZ);
    const end = new THREE.Spherical().setFromVector3(vec(9, 10, 13));
    const start = new THREE.Spherical(16.5, .06, end.theta - 1.1);
    this.intro = {
      elapsed: 0, startedAt: performance.now(), total: 3.55, pieces, trackStock, target, start, end,
      worker: { scale: this.worker.scale.clone() },
      background: this.scene.background.clone(), exposure: this.renderer.toneMappingExposure,
    };
    this.controls.enabled = false; this.outline.visible = false;
    this.updateIntro();
    return true;
  }

  ensureIntroEffects() {
    if (this.introFx) return;
    const orange = new THREE.Color('#fb923c');
    const grid = new THREE.GridHelper(15, 30, orange, orange);
    Object.assign(grid.material, { transparent: true, opacity: 0, depthWrite: false });
    grid.position.set(0, .015, ROOM.centerZ);
    const frame = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(ROOM.outerWidth, ROOM.height, ROOM.outerDepth)),
      new THREE.LineBasicMaterial({ color: orange, transparent: true, opacity: 0, depthWrite: false }),
    );
    frame.position.set(0, 0, ROOM.centerZ);
    frame.geometry.translate(0, ROOM.height / 2, 0);
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(.93, 1, 96),
      new THREE.MeshBasicMaterial({ color: orange, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }),
    );
    ring.rotation.x = -Math.PI / 2; ring.position.set(0, .03, ROOM.centerZ);
    for (const fx of [grid, frame, ring]) { fx.visible = false; fx.renderOrder = 5; this.scene.add(fx); }
    this.introFx = { grid, frame, ring };
  }

  updateIntro() {
    const intro = this.intro; if (!intro) return;
    // Relógio real (não o delta por quadro, que é limitado): em PC mais lento a
    // abertura fica menos fluida, mas continua durando ~3,5s.
    intro.elapsed = (performance.now() - intro.startedAt) / 1000;
    const time = intro.elapsed;
    const clamp01 = v => THREE.MathUtils.clamp(v, 0, 1);
    const outCubic = t => 1 - (1 - t) ** 3;
    const outBack = t => { const c = 1.45; return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2; };
    const outBounce = t => {
      const n = 7.5625, d = 2.75;
      if (t < 1 / d) return n * t * t;
      if (t < 2 / d) return n * (t -= 1.5 / d) * t + .75;
      if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + .9375;
      return n * (t -= 2.625 / d) * t + .984375;
    };
    const tiny = 1e-4;
    for (const piece of intro.pieces) {
      const { obj, kind, position, scale, bottom } = piece;
      const t = clamp01((time - piece.delay) / piece.duration);
      if (t <= 0) { obj.scale.copy(scale).multiplyScalar(tiny); obj.position.copy(position); continue; }
      if (kind === 'floor' || kind === 'label') {
        const k = Math.max(tiny, kind === 'floor' ? outCubic(t) : outBack(t));
        obj.scale.copy(scale).multiplyScalar(k); obj.position.copy(position);
      } else if (kind === 'wall' || kind === 'rise') {
        // Cresce a partir do chão (a base fica parada) com um leve "passar do ponto".
        const k = Math.max(tiny, outBack(t));
        obj.scale.set(scale.x, scale.y * k, scale.z);
        obj.position.set(position.x, position.y + bottom * (1 - k), position.z);
      } else {
        // drop / stock: cai de cima e quica na prateleira.
        const fall = kind === 'stock' ? .9 : 1.1;
        obj.position.set(position.x, position.y + (1 - outBounce(t)) * fall, position.z);
        obj.scale.copy(scale).multiplyScalar(.55 + .45 * outCubic(clamp01(t * 1.6)));
      }
    }
    // Funcionário "materializa" por último, dos pés à cabeça.
    const workerT = clamp01((time - 2.85) / .55);
    this.worker.scale.set(intro.worker.scale.x, intro.worker.scale.y * Math.max(tiny, outBack(workerT)), intro.worker.scale.z);

    // Efeitos de planta: grade, contorno da sala e a onda que varre o chão.
    const { grid, frame, ring } = this.introFx;
    grid.visible = frame.visible = ring.visible = true;
    grid.material.opacity = .55 * clamp01(time / .3) * (1 - clamp01((time - 1.5) / .8));
    frame.material.opacity = .9 * clamp01((time - .15) / .4) * (1 - clamp01((time - 1.7) / .7));
    frame.scale.set(1, Math.max(tiny, outCubic(clamp01((time - .15) / .65))), 1);
    const ringT = clamp01(time / 1.15);
    ring.scale.setScalar(Math.max(.05, ringT * maxRingRadius()));
    ring.material.opacity = ringT < 1 ? .9 * (1 - ringT) : 0;

    // Noite (planta) → dia (sala pronta).
    const day = outCubic(clamp01((time - .35) / 1.5));
    this.scene.background.copy(INTRO_NIGHT).lerp(intro.background, day);
    this.renderer.toneMappingExposure = THREE.MathUtils.lerp(.72, intro.exposure, day);

    // Câmera: de cima (como a planta 2D) girando e descendo até a vista "Sala".
    const c = clamp01(time / 3.0), e = c < .5 ? 4 * c ** 3 : 1 - (-2 * c + 2) ** 3 / 2;
    const sph = new THREE.Spherical(
      THREE.MathUtils.lerp(intro.start.radius, intro.end.radius, e),
      THREE.MathUtils.lerp(intro.start.phi, intro.end.phi, e),
      THREE.MathUtils.lerp(intro.start.theta, intro.end.theta, e),
    );
    this.controls.target.copy(intro.target);
    this.camera.position.copy(intro.target).add(new THREE.Vector3().setFromSpherical(sph));
    this.camera.zoom = THREE.MathUtils.lerp(.82, 1, e);
    this.camera.lookAt(intro.target); this.camera.updateProjectionMatrix();
    this.dirty = true;
    if (time >= intro.total) this.finishIntro();

    function maxRingRadius() { return Math.hypot(ROOM.outerWidth / 2, ROOM.outerDepth / 2) * 1.15; }
  }

  // Termina na hora (fim natural, clique na cena ou início de um envio).
  finishIntro() {
    const intro = this.intro; if (!intro) return;
    this.intro = null;
    for (const { obj, position, scale } of intro.pieces) { obj.position.copy(position); obj.scale.copy(scale); }
    this.worker.scale.copy(intro.worker.scale);
    for (const fx of Object.values(this.introFx || {})) fx.visible = false;
    this.scene.background.copy(intro.background);
    this.renderer.toneMappingExposure = intro.exposure;
    this.controls.enabled = true;
    this.setView('iso');
    this.select(this.selectedId);
    this.callbacks.onIntroEnd?.();
    this.dirty = true;
  }

  startShipment(id) {
    if (this.intro) this.finishIntro();
    const printer = this.meshes.get(id);
    if (this.shipment || !printer?.visible || printer.userData.shipped) return false;
    this.resetWorker();
    for (const parcel of this.parcels.values()) { parcel.visible = false; this.setCartonOpen(parcel, 0); this.setTrackingLabel(parcel); parcel.userData.supplies.visible = false; parcel.userData.ribbon.visible = false; }
    const parcel = this.parcels.get(printer.userData.item.model);
    this.shipment = { id, item: { ...printer.userData.item }, elapsed: 0, origin: printer.position.clone(), originRotation: printer.quaternion.clone(), printer, parcel, motion: new ShipmentMotion(printer.position, PACKAGES[printer.userData.item.model]) };
    this.controls.enabled = false; this.outline.visible = false;
    // Shipments always keep the complete room visible. The physical picking order
    // is front-to-back, so hiding another depth or shelf gives a false stock view.
    this.filter = 'all'; this.depthFilter = 'all'; this.areaFilter = 'all';
    this.applyVisibility(); this.outline.visible = false;
    this.animateWorker(shipmentFrame(0), this.shipment);
    if (this.reducedMotion.matches) this.finishShipment();
    return true;
  }

  startHistoricalShipment(item) {
    if (this.intro) this.finishIntro();
    if (this.shipment || !item || !PACKAGES[item.model]) return false;
    this.resetWorker();
    for (const parcel of this.parcels.values()) { parcel.visible = false; this.setCartonOpen(parcel, 0); this.setTrackingLabel(parcel); parcel.userData.supplies.visible = false; parcel.userData.ribbon.visible = false; }
    const replayItem = { ...item, id: item.id || `history-${Date.now()}`, historyReplay: true };
    const printer = this.buildCarton(replayItem);
    const hasLocation = replayItem.locationKnown && this.shelves.some(shelf => shelf.id === replayItem.shelfId);
    printer.position.copy(hasLocation ? this.itemPosition(replayItem) : point(WORK_POINT));
    printer.userData.item = { ...replayItem };
    printer.traverse(mesh => { mesh.userData.itemId = replayItem.id; });
    this.stockGroup.add(printer); this.meshes.set(replayItem.id, printer);
    const parcel = this.parcels.get(replayItem.model);
    const preparationStart = SHIPMENT_PHASES.slice(0, 2).reduce((sum, phase) => sum + phase.duration, 0) + .001;
    const elapsed = hasLocation ? 0 : preparationStart;
    this.shipment = { id: replayItem.id, item: replayItem, elapsed, origin: printer.position.clone(), originRotation: printer.quaternion.clone(), printer, parcel, motion: new ShipmentMotion(printer.position, PACKAGES[replayItem.model]), replay: true };
    this.controls.enabled = false; this.outline.visible = false;
    this.filter = 'all'; this.depthFilter = 'all'; this.areaFilter = 'all'; this.applyVisibility(); this.outline.visible = false;
    if (!hasLocation) {
      printer.visible = false; parcel.visible = true; parcel.position.copy(point(WORK_POINT)); this.setCartonOpen(parcel, 0);
    }
    const phase = shipmentFrame(elapsed);
    this.animateWorker(phase, this.shipment); this.callbacks.onProgress?.(phase);
    if (this.reducedMotion.matches) this.finishShipment();
    return true;
  }

  removeReplayPrinter(shipment) {
    if (!shipment?.replay) return;
    this.meshes.delete(shipment.id); this.stockGroup.remove(shipment.printer); this.disposeUnique(shipment.printer);
  }

  cancelShipment() {
    if (this.shipment) {
      const active = this.shipment;
      const { printer, origin, originRotation } = active; printer.position.copy(origin); printer.quaternion.copy(originRotation); printer.visible = true;
      this.removeReplayPrinter(active);
    }
    this.shipment = null;
    for (const parcel of this.parcels?.values() || []) {
      parcel.visible = false; this.setCartonOpen(parcel, 0); this.setTrackingLabel(parcel); parcel.userData.supplies.visible = false; parcel.userData.ribbon.visible = false;
    }
    if (this.controls) this.controls.enabled = true;
    this.resetWorker();
    this.dirty = true;
  }

  finishShipment() {
    if (!this.shipment) return;
    const active = this.shipment;
    const { item, printer, parcel } = active;
    printer.userData.shipped = true; printer.visible = false;
    this.setCartonOpen(parcel, 0); parcel.userData.supplies.visible = false; parcel.userData.ribbon.visible = false;
    this.setTrackingLabel(parcel, 1);
    parcel.position.copy(point(EXIT)); parcel.visible = true;
    this.animateWorker(shipmentFrame(100), active);
    this.removeReplayPrinter(active);
    this.shipment = null; this.controls.enabled = true; this.dirty = true;
    this.callbacks.onProgress?.(shipmentFrame(100)); this.callbacks.onComplete?.(item);
  }

  animateShipment(delta) {
    const shipment = this.shipment; shipment.elapsed += delta;
    const phase = shipmentFrame(shipment.elapsed);
    if (phase.done) { this.finishShipment(); return; }
    const t = ease(phase.progress), { printer, parcel, item } = shipment;
    const table = point(WORK_POINT);
    if (['approaching', 'picking'].includes(phase.key)) {
      parcel.visible = false;
    } else {
      printer.visible = false; parcel.visible = true; parcel.position.copy(table);
      if (phase.key === 'opening') this.setCartonOpen(parcel, t);
      if (phase.key === 'supplies') {
        this.setCartonOpen(parcel, 1);
        const roll = parcel.userData.supplies, ribbon = parcel.userData.ribbon;
        const rollT = ease(Math.min(1, t * 1.8));
        roll.visible = rollT < .96; roll.position.set(.035, .59 - rollT * .42, .065);
        const ribbonT = ease(THREE.MathUtils.clamp((t - .42) / .58, 0, 1));
        ribbon.visible = item.model === 'ZD230' && t > .42 && ribbonT < .96;
        ribbon.position.set(-.055, .54 - ribbonT * .38, -.075);
      }
      if (phase.key === 'closing') {
        parcel.userData.supplies.visible = false; parcel.userData.ribbon.visible = false; this.setCartonOpen(parcel, 1 - t);
      }
      if (phase.key === 'labeling') {
        this.setCartonOpen(parcel, 0);
        parcel.userData.supplies.visible = false; parcel.userData.ribbon.visible = false;
        // Hold the label above the carton while the hand approaches from its
        // outside edge. Once the palm is in place, both descend together.
        const labelProgress = ease(THREE.MathUtils.clamp((phase.progress - .35) / .65, 0, 1));
        this.setTrackingLabel(parcel, labelProgress);
      }
      if (phase.key === 'leaving') {
        this.setCartonOpen(parcel, 0);
        this.setTrackingLabel(parcel, 1);
      }
    }
    this.animateWorker(phase, shipment, delta);
    const label = phase.key === 'supplies' && item.model === 'ZQ521' ? 'Colocando as etiquetas' : phase.label;
    if (this.camera && !this.reducedMotion.matches && !['approaching', 'picking'].includes(phase.key)) {
      // Move close enough to see the flaps and consumables, then follow the exit.
      const target = (phase.key === 'leaving' ? parcel.position : table).clone().add(vec(0, .16, 0));
      const offset = phase.key === 'leaving' ? vec(3.3, 3.6, 4.8) : vec(2.0, 2.3, 3.0);
      const blend = 1 - Math.exp(-delta * 3);
      this.controls.target.lerp(target, blend);
      this.camera.position.lerp(target.clone().add(offset), blend);
      this.camera.zoom = THREE.MathUtils.lerp(this.camera.zoom, phase.key === 'leaving' ? 2.1 : 3.8, blend);
      this.camera.lookAt(this.controls.target); this.camera.updateProjectionMatrix();
    }
    this.callbacks.onProgress?.({ ...phase, label }); this.dirty = true;
  }

  tick(time) {
    if (this.disposed) return;
    const delta = Math.min(Math.max((time - this.lastTime) / 1000, 0), .05); this.lastTime = time;
    if (!document.hidden) {
      if (this.intro) this.updateIntro();
      this.controls.update(); if (this.shipment) this.animateShipment(delta);
      else if (this.humanRig && !this.reducedMotion.matches) this.humanRig.update(delta, 0, this.lastHumanPose?.contacts, null, this.lastHumanPose?.phase || 'idle');
      if (this.dirty) { this.renderer.render(this.scene, this.camera); this.dirty = false; }
    }
    this.frameId = requestAnimationFrame(this.tick);
  }

  disposeUnique(group) {
    const sharedGeometries = new Set(this.geometries.values()), sharedMaterials = new Set(this.materials.values());
    group.traverse(mesh => {
      if (mesh.geometry && !sharedGeometries.has(mesh.geometry)) mesh.geometry.dispose();
      for (const material of mesh.material ? (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) : []) if (!sharedMaterials.has(material)) material.dispose();
    });
  }
  dispose() {
    this.disposed = true; cancelAnimationFrame(this.frameId); this.cancelShipment();
    this.resizeObserver.disconnect(); this.controls.removeEventListener('change', this.changeListener); this.controls.dispose();
    this.humanRig?.dispose();
    const canvas = this.renderer.domElement;
    canvas.removeEventListener('pointerdown', this.pointerDown); canvas.removeEventListener('pointerup', this.pointerUp);
    canvas.removeEventListener('pointermove', this.pointerMove); canvas.removeEventListener('webglcontextlost', this.contextLost);
    this.disposeUnique(this.scene);
    for (const resource of [...this.geometries.values(), ...this.materials.values(), ...this.labels.values()]) resource.dispose();
    this.renderer.dispose(); canvas.remove();
  }
}
