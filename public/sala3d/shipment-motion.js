import { Vector3, Quaternion, CatmullRomCurve3, MathUtils } from './vendor/three.module.js';
import { PREPARATION, EXIT, RACK } from './data.js?v=44';

const v = (x, y, z) => new Vector3(x, y, z);
const smooth = t => MathUtils.clamp(MathUtils.smootherstep(MathUtils.clamp(t, 0, 1), 0, 1), 0, 1);
const yaw = angle => new Quaternion().setFromAxisAngle(v(0, 1, 0), angle);
const angleMix = (a, b, t) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * t;
export const WORK_POINT = Object.freeze({ x: PREPARATION.x + .11, y: PREPARATION.y, z: PREPARATION.z });

export class ShipmentMotion {
  constructor(origin, dimensions) {
    this.origin = origin.clone(); this.dimensions = dimensions;
    this.work = v(WORK_POINT.x + .44, 0, WORK_POINT.z);
    this.pickup = v(origin.x, 0, RACK.z + RACK.depth / 2 + .57);
    this.end = v(EXIT.x - .5, 0, EXIT.z);
    this.approach = new CatmullRomCurve3([this.work, v(this.work.x, 0, -.35), v(this.work.x, 0, -.67), v(origin.x, 0, -.85), this.pickup]);
    this.returnPath = new CatmullRomCurve3([this.pickup, v(origin.x, 0, -.81), v(this.work.x, 0, -.60), v(this.work.x, 0, -.35), this.work]);
    this.exitPath = new CatmullRomCurve3([this.work, v(1.5, 0, WORK_POINT.z), v(2.15, 0, EXIT.z), this.end]);
  }

  along(curve, progress) {
    progress = MathUtils.clamp(progress, 0, 1);
    const tangent = curve.getTangentAt(progress);
    return { position: curve.getPointAt(progress), heading: Math.atan2(tangent.x, tangent.z) };
  }

  frame(phase) {
    const p = phase.progress;
    let actor = this.work.clone(), heading = -Math.PI / 2;
    let box = v(WORK_POINT.x, WORK_POINT.y, WORK_POINT.z), boxHeading = heading + Math.PI, hands = 1;
    if (phase.key === 'approaching') {
      const step = this.along(this.approach, smooth(p)); actor = step.position; heading = step.heading;
      if (p < .12) heading = angleMix(-Math.PI / 2, heading, smooth(p / .12));
      if (p > .82) heading = angleMix(heading, Math.PI, smooth((p - .82) / .18));
      box = this.origin.clone(); boxHeading = 0; hands = 0;
    }
    if (phase.key === 'picking') {
      actor = this.pickup.clone(); heading = Math.PI;
      const edge = this.carried(actor, heading); edge.y = this.origin.y;
      const held = this.carried(actor, heading);
      if (p < .28) {
        box = this.origin.clone().lerp(edge, smooth((p - .10) / .18));
        boxHeading = 0;
        hands = smooth(p / .12);
      } else if (p < .40) box = edge.lerp(held, smooth((p - .28) / .12));
      else if (p < .50) {
        heading = angleMix(Math.PI, this.along(this.returnPath, 0).heading, smooth((p - .40) / .10));
        box = this.carried(actor, heading);
      } else if (p < .84) {
        const step = this.along(this.returnPath, smooth((p - .50) / .34)); actor = step.position; heading = step.heading;
        box = this.carried(actor, heading);
      } else if (p < .93) {
        actor = this.work.clone(); heading = angleMix(this.along(this.returnPath, 1).heading, -Math.PI / 2, smooth((p - .84) / .09));
        box = this.carried(actor, heading);
      } else {
        actor = this.work.clone(); heading = -Math.PI / 2;
        box = this.carried(actor, heading).lerp(v(WORK_POINT.x, WORK_POINT.y, WORK_POINT.z), smooth((p - .93) / .07));
      }
      if (p >= .28) boxHeading = heading + Math.PI;
    }
    if (phase.key === 'leaving' || phase.key === 'done') {
      if (p < .18) box.lerp(this.carried(actor, heading), smooth(p / .18));
      else if (p < .30) {
        heading = angleMix(-Math.PI / 2, this.along(this.exitPath, 0).heading, smooth((p - .18) / .12));
        box = this.carried(actor, heading);
      } else if (p < .88) {
        const step = this.along(this.exitPath, smooth((p - .30) / .58)); actor = step.position; heading = step.heading;
        box = this.carried(actor, heading);
      } else {
        actor = this.end.clone(); heading = Math.PI / 2;
        box = this.carried(actor, heading).lerp(v(EXIT.x, EXIT.y, EXIT.z), smooth((p - .88) / .12));
      }
      boxHeading = heading + Math.PI;
    }
    return { actor, rotation: yaw(heading), box, boxRotation: yaw(boxHeading), handWeight: hands };
  }

  carried(actor, heading) { return v(0, .98, .37).applyQuaternion(yaw(heading)).add(actor); }

  contacts(phase, pose, parcel) {
    const d = this.dimensions, forward = v(0, 0, 1).applyQuaternion(pose.rotation);
    const local = (x, y, z) => v(x, y, z).applyQuaternion(pose.boxRotation).add(pose.box);
    return [1, -1].map(side => {
      const cartonSide = -side;
      let position = local(cartonSide * (d.width / 2 + .026), d.height * .64, 0);
      let normal = v(-cartonSide, 0, 0).applyQuaternion(pose.boxRotation), fingers = v(0, -1, 0);
      if (['opening', 'closing'].includes(phase.key)) {
        const opening = phase.key === 'opening' ? smooth(phase.progress) : 1 - smooth(phase.progress);
        const angle = -cartonSide * opening * 2.1;
        const flapCenter = v(
          cartonSide * (d.width / 2 - d.width / 4 * Math.cos(opening * 2.1)),
          d.height + d.width / 4 * Math.sin(opening * 2.1),
          0,
        );
        // Follow the moving flap surface and keep the palm slightly above it.
        // The old fixed downward normal left the hand horizontal while the flap
        // rotated through it, which made the fingers clip into the cardboard.
        const localNormal = v(Math.sin(angle), -Math.cos(angle), 0);
        position = local(flapCenter.x, flapCenter.y, flapCenter.z)
          .add(localNormal.clone().multiplyScalar(-.045).applyQuaternion(pose.boxRotation));
        normal = localNormal.applyQuaternion(pose.boxRotation);
        fingers = forward;
      }
      if (phase.key === 'supplies' && side === -1) {
        const active = parcel.userData.ribbon.visible ? parcel.userData.ribbon : parcel.userData.supplies;
        position = local(active.position.x, Math.max(d.height + .06, active.position.y + .055), active.position.z);
        normal = v(0, -1, 0); fingers = forward;
      }
      if (phase.key === 'labeling' && side === -1) {
        const label = parcel.userData.trackingLabel;
        const p = phase.progress;
        // Approach beside the suspended label, move above it, then follow the
        // paper down. This prevents the hand from passing through the label.
        const stageX = p < .22
          ? d.width / 2 + .10
          : MathUtils.lerp(d.width / 2 + .10, 0, smooth((p - .22) / .13));
        const press = smooth((p - .84) / .16);
        const clearance = MathUtils.lerp(.072, .038, press);
        const paperUp = v(0, 0, 1).applyQuaternion(label.quaternion).normalize();
        position = local(label.position.x + stageX, label.position.y, label.position.z)
          .add(paperUp.clone().multiplyScalar(clearance).applyQuaternion(pose.boxRotation));
        normal = paperUp.multiplyScalar(-1).applyQuaternion(pose.boxRotation);
        fingers = forward;
      }
      return { position, normal, fingers, weight: pose.handWeight };
    });
  }
}
