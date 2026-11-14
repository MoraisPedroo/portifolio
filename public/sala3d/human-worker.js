import * as THREE from './vendor/three.module.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';
import { applyMustachePrint, applyShirtPrint } from './shirt-print.js';

const v = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

export class HumanWorker {
  static async load(parent, logo, invalidate) {
    const [gltf, response] = await Promise.all([
      new GLTFLoader().loadAsync(new URL('./assets/worker-human.glb', import.meta.url).href),
      fetch(new URL('./assets/worker-motion.json', import.meta.url)),
    ]);
    if (!response.ok) throw new Error('Não foi possível carregar os movimentos da pessoa.');
    return new HumanWorker(parent, gltf.scene, await response.json(), logo, invalidate);
  }

  constructor(parent, model, motion, logo = null, invalidate = () => {}) {
    this.parent = parent; this.model = model; this.invalidate = invalidate;
    this.fingers = [];
    this.bones = new Map(); model.traverse(n => {
      if (n.isBone) {
        this.bones.set(n.name, n);
        if (/Hand(Thumb|Index|Middle|Ring|Pinky)/.test(n.name)) this.fingers.push({ bone: n, rest: n.quaternion.clone() });
      }
      if (n.isMesh) {
        n.castShadow = true; n.receiveShadow = true; n.frustumCulled = false;
        if (n.name.includes('Outfit_Top')) {
          n.material.map = null; n.material.color.set('#f4f5ef'); n.material.metalness = 0; n.material.roughness = .9;
          if (logo) applyShirtPrint(n.material, logo);
        }
        if (n.name === 'Wolf3D_Head') applyMustachePrint(n.material);
      }
    });
    model.scale.setScalar(1.78 / motion.modelHeight); parent.add(model); model.updateWorldMatrix(true, true);
    this.feet = ['LeftToeBase', 'RightToeBase', 'LeftFoot', 'RightFoot'].map(n => this.bones.get(n));
    this.sole = Math.min(...this.feet.map(b => b.getWorldPosition(v()).y)) - new THREE.Box3().setFromObject(model).min.y;
    this.mixer = new THREE.AnimationMixer(model);
    this.actions = Object.fromEntries(motion.clips.map(json => {
      const clip = THREE.AnimationClip.parse(json);
      clip.tracks = clip.tracks.filter(track => !/Hand(Thumb|Index|Middle|Ring|Pinky)|^(Left|Right)Hand\.quaternion$/.test(track.name));
      return [clip.name, this.mixer.clipAction(clip)];
    }));
    this.walkSpeed = motion.walkSpeed; this.walkWeight = 0;
    this.actions.Idle.play(); this.actions.Walk.play(); this.actions.Walk.setEffectiveWeight(0);
    this.arms = ['Left', 'Right'].map((name, i) => ({ side: i ? -1 : 1, upper: this.bones.get(name + 'Arm'), lower: this.bones.get(name + 'ForeArm'), hand: this.bones.get(name + 'Hand'), finger: this.bones.get(name + 'HandMiddle1') }));
    for (const arm of this.arms) {
      arm.rest = arm.hand.quaternion.clone();
      const name = arm.side === 1 ? 'Left' : 'Right';
      const f = arm.finger.position.clone().normalize();
      const across = this.bones.get(name + 'HandIndex1').position.clone().sub(this.bones.get(name + 'HandPinky1').position);
      // The native fingers curl toward local +Z: that side is the palm, not the back.
      across.addScaledVector(f, -across.dot(f)).normalize().multiplyScalar(-arm.side);
      const normal = across.clone().cross(f).normalize();
      arm.localBasisInverse = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(across, f, normal)).invert();
      arm.palmOffset = arm.finger.position.clone().multiplyScalar(.5);
    }
    this.reset();
  }

  reset() {
    this.walkWeight = 0;
    for (const arm of this.arms) { arm.phase = null; arm.previousTarget = null; arm.previousRotation = null; }
    for (const action of Object.values(this.actions)) action.reset().play();
    this.actions.Walk.setEffectiveWeight(0); this.actions.Idle.setEffectiveWeight(1);
    this.mixer.update(0); this.restoreHands(); this.groundFeet();
  }

  restoreHands() {
    for (const arm of this.arms) arm.hand.quaternion.copy(arm.rest);
    for (const finger of this.fingers) finger.bone.quaternion.copy(finger.rest);
  }

  groundFeet() {
    this.model.position.y = 0; this.model.updateWorldMatrix(true, true);
    const minimum = Math.min(...this.feet.map(b => b.getWorldPosition(v()).y));
    this.model.position.y = this.parent.position.y + this.sole + .008 - minimum;
    this.model.updateWorldMatrix(true, true);
  }

  update(delta, speed = 0, targets = null, obstacle = null, phase = 'idle', reduced = false) {
    const desired = reduced ? 0 : THREE.MathUtils.clamp(speed / .65, 0, 1);
    this.walkWeight = THREE.MathUtils.damp(this.walkWeight, desired, 9, delta);
    this.actions.Walk.setEffectiveWeight(this.walkWeight);
    this.actions.Idle.setEffectiveWeight(1 - this.walkWeight);
    this.actions.Walk.setEffectiveTimeScale(THREE.MathUtils.clamp(speed / this.walkSpeed, .05, 1.8));
    this.mixer.update(reduced ? 0 : delta); this.restoreHands(); this.groundFeet();
    if (targets) for (let i = 0; i < this.arms.length; i++) {
      const contact = targets[i];
      this.solveArm(this.arms[i], contact.isVector3 ? { position: contact, normal: v(0, -1, 0), fingers: v(0, 0, 1), weight: 1 } : contact, delta, phase);
    }
    this.model.updateWorldMatrix(true, true); this.invalidate();
  }

  aim(bone, child, worldTarget) {
    const origin = bone.getWorldPosition(v()), current = child.getWorldPosition(v()).sub(origin).normalize();
    const desired = worldTarget.clone().sub(origin).normalize();
    const world = new THREE.Quaternion().setFromUnitVectors(current, desired).multiply(bone.getWorldQuaternion(new THREE.Quaternion()));
    bone.quaternion.copy(bone.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(world));
    bone.updateWorldMatrix(false, true);
  }

  solveArm(arm, contact, delta, phase) {
    if (!contact || contact.weight === 0) return;
    const originals = [arm.upper, arm.lower, arm.hand].map(bone => bone.quaternion.clone());
    const guideFingers = contact.fingers.clone().normalize();
    const guideNormal = contact.normal.clone().addScaledVector(guideFingers, -contact.normal.dot(guideFingers)).normalize();
    const guideAcross = guideFingers.clone().cross(guideNormal).normalize();
    const guideRotation = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(guideAcross, guideFingers, guideNormal)).multiply(arm.localBasisInverse);
    const palmTarget = contact.position.clone();
    if (arm.phase !== phase) {
      arm.transitionFrom = arm.previousTarget?.clone();
      arm.rotationFrom = arm.previousRotation?.clone();
      arm.transitionTime = 0; arm.phase = phase;
    }
    arm.transitionTime += delta;
    if (arm.transitionFrom && arm.transitionTime < .24) {
      const blend = THREE.MathUtils.smootherstep(arm.transitionTime, 0, .24);
      palmTarget.lerpVectors(arm.transitionFrom, palmTarget.clone(), blend);
    }
    const shoulder = arm.upper.getWorldPosition(v()), elbowNow = arm.lower.getWorldPosition(v()), wrist = arm.hand.getWorldPosition(v());
    const a = shoulder.distanceTo(elbowNow), b = elbowNow.distanceTo(wrist);
    const placeWrist = rotation => {
      const offset = arm.palmOffset.clone().multiply(arm.hand.getWorldScale(v())).applyQuaternion(rotation);
      const target = palmTarget.clone().sub(offset);
      const direction = target.clone().sub(shoulder);
      const distance = THREE.MathUtils.clamp(direction.length(), Math.abs(a - b) + .001, a + b - .004);
      direction.normalize();
      const pole = v(arm.side * .5, -.85, -.1).applyQuaternion(this.parent.quaternion);
      pole.addScaledVector(direction, -pole.dot(direction)).normalize();
      const cosine = THREE.MathUtils.clamp((a * a + distance * distance - b * b) / (2 * a * distance), -1, 1);
      const elbow = shoulder.clone().addScaledVector(direction, a * cosine).addScaledVector(pole, a * Math.sqrt(1 - cosine * cosine));
      this.aim(arm.upper, arm.lower, elbow);
      this.aim(arm.lower, arm.hand, shoulder.clone().addScaledVector(direction, distance));
      return arm.hand.getWorldPosition(v()).sub(arm.lower.getWorldPosition(v())).normalize();
    };

    // First solve the reach, then orient the hand from the resulting forearm.
    // Projecting the forearm onto the palm plane keeps the fingers aligned with
    // the wrist instead of forcing the hand into the old 90-degree bend.
    const forearm = placeWrist(guideRotation);
    const fingers = forearm.clone().normalize();
    const normal = contact.normal.clone().addScaledVector(fingers, -contact.normal.dot(fingers));
    if (normal.lengthSq() < 1e-5) normal.copy(guideNormal);
    normal.normalize();
    const across = fingers.clone().cross(normal).normalize();
    const palmRotation = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(across, fingers, normal)).multiply(arm.localBasisInverse);
    if (arm.rotationFrom && arm.transitionTime < .24) {
      const blend = THREE.MathUtils.smootherstep(arm.transitionTime, 0, .24);
      palmRotation.slerpQuaternions(arm.rotationFrom, palmRotation.clone(), blend);
    }
    arm.previousTarget = palmTarget.clone(); arm.previousRotation = palmRotation.clone();
    placeWrist(palmRotation);
    arm.hand.quaternion.copy(arm.hand.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(palmRotation));
    [arm.upper, arm.lower, arm.hand].forEach((bone, i) => { if (contact.weight < 1) { const solved = bone.quaternion.clone(); bone.quaternion.copy(originals[i]).slerp(solved, contact.weight); } });
    this.model.updateWorldMatrix(true, true);
    arm.contact = contact.position.clone();
    arm.palm = arm.hand.localToWorld(arm.palmOffset.clone());
    arm.forearmDirection = arm.hand.getWorldPosition(v()).sub(arm.lower.getWorldPosition(v())).normalize();
    arm.handDirection = arm.finger.getWorldPosition(v()).sub(arm.hand.getWorldPosition(v())).normalize();
    arm.wristAngle = arm.forearmDirection.angleTo(arm.handDirection);
  }

  dispose() {
    this.mixer.stopAllAction(); this.mixer.uncacheRoot(this.model);
    const textures = new Set();
    this.model.traverse(n => { if (n.material) for (const mat of Array.isArray(n.material) ? n.material : [n.material]) for (const value of Object.values(mat)) if (value?.isTexture) textures.add(value); });
    for (const texture of textures) texture.dispose();
  }
}
