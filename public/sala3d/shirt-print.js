// Print directly into the garment material, using its undeformed surface as UVs.
// The same skinned triangles carry both the cloth and the ink through every pose.
export function applyShirtPrint(material, logo) {
  material.onBeforeCompile = shader => {
    shader.uniforms.selbettiLogo = { value: logo };
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vShirtPrintPosition;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvShirtPrintPosition = position;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform sampler2D selbettiLogo;\nvarying vec3 vShirtPrintPosition;')
      .replace('#include <map_fragment>', `#include <map_fragment>
        float printSide = vShirtPrintPosition.z >= 0.0 ? 1.0 : -1.0;
        vec2 printUv = vec2(printSide * vShirtPrintPosition.x / 0.29 + 0.5,
          (vShirtPrintPosition.y - 1.365) / 0.0808 + 0.5);
        if (abs(vShirtPrintPosition.z) > 0.045 &&
            all(greaterThanEqual(printUv, vec2(0.0))) && all(lessThanEqual(printUv, vec2(1.0)))) {
          vec4 ink = texture2D(selbettiLogo, printUv);
          diffuseColor.rgb = mix(diffuseColor.rgb, ink.rgb, ink.a);
        }
      `);
  };
  material.customProgramCacheKey = () => 'selbetti-garment-print-v1';
  material.needsUpdate = true;
}

export function applyMustachePrint(material) {
  const previous = material.onBeforeCompile;
  material.onBeforeCompile = shader => {
    previous?.(shader);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vFacePrintPosition;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvFacePrintPosition = position;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vFacePrintPosition;')
      .replace('#include <map_fragment>', `#include <map_fragment>
        float moustacheX = abs(vFacePrintPosition.x);
        float moustacheCenterY = 1.669 - moustacheX * 0.085;
        float moustacheHalfHeight = mix(0.0034, 0.0017, smoothstep(0.018, 0.047, moustacheX));
        float moustacheShape = 1.0 - smoothstep(moustacheHalfHeight * 0.72, moustacheHalfHeight,
          abs(vFacePrintPosition.y - moustacheCenterY));
        moustacheShape *= 1.0 - smoothstep(0.040, 0.047, moustacheX);
        moustacheShape *= smoothstep(0.116, 0.124, vFacePrintPosition.z);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.045, 0.022, 0.014), moustacheShape * 0.94);
      `);
  };
  material.customProgramCacheKey = () => 'skin-surface-pencil-mustache-v4';
  material.needsUpdate = true;
}
