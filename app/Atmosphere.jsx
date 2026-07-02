'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Atmosphere() {
  const mountRef = useRef(null);

  useEffect(() => {
    let animationFrameId;
    const currentMount = mountRef.current;
    
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    const initW = document.documentElement.clientWidth;
    const initH = window.innerHeight;
    renderer.setSize(initW, initH);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.autoClear = false;
    // Prevent canvas from causing horizontal overflow
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.maxWidth = '100%';
    currentMount.appendChild(renderer.domElement);

    // ==========================================
    // 1. BACKGROUND SCENE (Orthographic Shader)
    // ==========================================
    const bgScene = new THREE.Scene();
    const bgCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    bgCamera.position.z = 1;

    const uniforms = {
      u_time: { value: 0.0 },
      u_resolution: { value: new THREE.Vector2(initW, initH) },
      u_mouse: { value: new THREE.Vector2(0.5, 0.5) }
    };

    const vertexShader = `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
    `;

    const fragmentShader = `
      precision mediump float;
      uniform float u_time; uniform vec2 u_resolution; uniform vec2 u_mouse;
      varying vec2 vUv;
      float random(vec2 st) { return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123); }
      float noise(vec2 st) {
          vec2 i = floor(st); vec2 f = fract(st);
          float a = random(i); float b = random(i + vec2(1.0, 0.0));
          float c = random(i + vec2(0.0, 1.0)); float d = random(i + vec2(1.0, 1.0));
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }
      float fbm(vec2 st) {
          float value = 0.0; float amplitude = 0.5; vec2 shift = vec2(100.0);
          mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
          for (int i = 0; i < 4; i++) { value += amplitude * noise(st); st = rot * st * 2.0 + shift; amplitude *= 0.5; }
          return value;
      }
      void main() {
          vec2 st = gl_FragCoord.xy/u_resolution.xy; st.x *= u_resolution.x/u_resolution.y;
          vec2 q = vec2(0.); q.x = fbm( st + 0.00 * u_time); q.y = fbm( st + vec2(1.0));
          vec2 r = vec2(0.);
          r.x = fbm( st + 1.0*q + vec2(1.7,9.2)+ 0.15*u_time ); r.y = fbm( st + 1.0*q + vec2(8.3,2.8)+ 0.126*u_time);
          r += (u_mouse * 0.1);
          float f = fbm(st+r);
          vec3 color = mix(vec3(0.02, 0.02, 0.03), vec3(0.08, 0.06, 0.04), clamp((f*f)*4.0,0.0,1.0));
          color = mix(color, vec3(0.12, 0.09, 0.06), clamp(length(q),0.0,1.0));
          color = mix(color, vec3(0.78, 0.66, 0.43)*0.15, clamp(length(r.x),0.0,1.0));
          float dist = length(vUv - 0.5); color *= smoothstep(0.8, 0.2, dist * 1.5);
          gl_FragColor = vec4((f*f*f+.6*f*f+.5*f)*color, 1.0);
      }
    `;

    const bgMaterial = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, depthWrite: false, depthTest: false });
    const bgPlane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMaterial);
    bgScene.add(bgPlane);

    // ==========================================
    // 2. MAIN SCENE (3D Beans)
    // ==========================================
    const mainScene = new THREE.Scene();
    const mainCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    mainCamera.position.z = 15;

    // Lights
    const ambientLight = new THREE.AmbientLight(0x2a1508, 1.5); // very dim warm fill
    mainScene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffddaa, 5.0); // reduced key light
    dirLight.position.set(5, 5, 4);
    mainScene.add(dirLight);
    const rimLight = new THREE.DirectionalLight(0xc8a96e, 2.5); // subtle gold rim
    rimLight.position.set(-4, 2, -3);
    mainScene.add(rimLight);

    // Procedural Coffee Bean Geometry — use higher segments for smooth crease
    const beanGeo = new THREE.SphereGeometry(1, 48, 48);
    beanGeo.scale(0.75, 1.35, 0.65); // taller, flatter ellipsoid
    
    // Carve the crease deeply on the front face (z > 0)
    const pos = beanGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      if (z > 0) {
        const d = Math.abs(x);
        if (d < 0.5) {
          const depth = Math.cos(d * Math.PI / 1.0) * 0.65; // deeper crease
          const taper = 1.0 - Math.pow(Math.abs(y) / 1.35, 2.0);
          pos.setZ(i, z - (depth * Math.max(0, taper)));
        }
      }
    }
    beanGeo.computeVertexNormals();

    // Procedural roasted coffee bean texture via canvas
    const texSize = 256;
    const texCanvas = document.createElement('canvas');
    texCanvas.width = texSize; texCanvas.height = texSize;
    const tc = texCanvas.getContext('2d');

    // Deep roast base gradient
    const baseGrad = tc.createRadialGradient(texSize*0.5, texSize*0.45, 0, texSize*0.5, texSize*0.5, texSize*0.6);
    baseGrad.addColorStop(0,   '#5c3118');
    baseGrad.addColorStop(0.4, '#3d1f0d');
    baseGrad.addColorStop(1,   '#1a0a04');
    tc.fillStyle = baseGrad;
    tc.fillRect(0, 0, texSize, texSize);

    // Surface streaks / grain
    for (let i = 0; i < 18; i++) {
      const x = Math.random() * texSize;
      const len = 30 + Math.random() * 80;
      const grad = tc.createLinearGradient(x, texSize*0.2, x + (Math.random()-0.5)*20, texSize*0.8);
      grad.addColorStop(0,   'rgba(120,65,25,0)');
      grad.addColorStop(0.5, `rgba(110,55,20,${0.15 + Math.random()*0.25})`);
      grad.addColorStop(1,   'rgba(120,65,25,0)');
      tc.strokeStyle = grad;
      tc.lineWidth = 1 + Math.random() * 2.5;
      tc.beginPath();
      tc.moveTo(x, texSize*0.1);
      tc.bezierCurveTo(x + (Math.random()-0.5)*30, texSize*0.4, x + (Math.random()-0.5)*30, texSize*0.6, x + (Math.random()-0.5)*20, texSize*0.9);
      tc.stroke();
    }

    // Specular highlight spot
    const hiGrad = tc.createRadialGradient(texSize*0.35, texSize*0.3, 0, texSize*0.35, texSize*0.3, texSize*0.22);
    hiGrad.addColorStop(0,   'rgba(220,160,80,0.18)');
    hiGrad.addColorStop(1,   'rgba(220,160,80,0)');
    tc.fillStyle = hiGrad;
    tc.fillRect(0, 0, texSize, texSize);

    // *** CENTER SEAM / CREASE LINE ***
    // Dark vertical line down the center matching the 3D geometry crease
    const seamGrad = tc.createLinearGradient(texSize*0.5, texSize*0.05, texSize*0.5, texSize*0.95);
    seamGrad.addColorStop(0,   'rgba(5,2,1,0)');
    seamGrad.addColorStop(0.15,'rgba(5,2,1,0.9)');
    seamGrad.addColorStop(0.5, 'rgba(5,2,1,0.95)');
    seamGrad.addColorStop(0.85,'rgba(5,2,1,0.9)');
    seamGrad.addColorStop(1,   'rgba(5,2,1,0)');
    // Wide soft shadow on each side of seam
    const seamShadowL = tc.createLinearGradient(texSize*0.3, 0, texSize*0.5, 0);
    seamShadowL.addColorStop(0, 'rgba(0,0,0,0)');
    seamShadowL.addColorStop(1, 'rgba(0,0,0,0.45)');
    tc.fillStyle = seamShadowL;
    tc.fillRect(texSize*0.3, 0, texSize*0.2, texSize);
    const seamShadowR = tc.createLinearGradient(texSize*0.5, 0, texSize*0.7, 0);
    seamShadowR.addColorStop(0, 'rgba(0,0,0,0.45)');
    seamShadowR.addColorStop(1, 'rgba(0,0,0,0)');
    tc.fillStyle = seamShadowR;
    tc.fillRect(texSize*0.5, 0, texSize*0.2, texSize);
    // Narrow sharp dark seam line
    tc.strokeStyle = seamGrad;
    tc.lineWidth = 3;
    tc.beginPath();
    tc.moveTo(texSize*0.5, texSize*0.05);
    tc.bezierCurveTo(texSize*0.51, texSize*0.3, texSize*0.49, texSize*0.7, texSize*0.5, texSize*0.95);
    tc.stroke();
    // Thin bright edge highlight right of seam
    const seamHighlight = tc.createLinearGradient(texSize*0.5, texSize*0.1, texSize*0.5, texSize*0.9);
    seamHighlight.addColorStop(0,   'rgba(160,90,30,0)');
    seamHighlight.addColorStop(0.5, 'rgba(160,90,30,0.5)');
    seamHighlight.addColorStop(1,   'rgba(160,90,30,0)');
    tc.strokeStyle = seamHighlight;
    tc.lineWidth = 1.5;
    tc.beginPath();
    tc.moveTo(texSize*0.52, texSize*0.08);
    tc.bezierCurveTo(texSize*0.53, texSize*0.3, texSize*0.51, texSize*0.7, texSize*0.52, texSize*0.92);
    tc.stroke();

    const beanTexture = new THREE.CanvasTexture(texCanvas);

    // Roughness map (lighter = rougher = less sheen in that area)
    const roughCanvas = document.createElement('canvas');
    roughCanvas.width = texSize; roughCanvas.height = texSize;
    const rc = roughCanvas.getContext('2d');
    rc.fillStyle = '#888'; // mid roughness base
    rc.fillRect(0, 0, texSize, texSize);
    // Glossy highlight zone
    const rGrad = rc.createRadialGradient(texSize*0.35, texSize*0.3, 0, texSize*0.35, texSize*0.3, texSize*0.25);
    rGrad.addColorStop(0, '#222'); // very smooth (dark = low roughness)
    rGrad.addColorStop(1, '#999');
    rc.fillStyle = rGrad;
    rc.fillRect(0, 0, texSize, texSize);
    const roughTexture = new THREE.CanvasTexture(roughCanvas);

    const beanMat = new THREE.MeshStandardMaterial({
      map:          beanTexture,
      roughnessMap: roughTexture,
      roughness:    0.55,
      metalness:    0.08,
    });

    const BEAN_COUNT = 15;
    const instancedBeans = new THREE.InstancedMesh(beanGeo, beanMat, BEAN_COUNT);
    instancedBeans.frustumCulled = false;
    
    // Check if mobile
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    
    const dummy = new THREE.Object3D();
    const beanData = [];
    for(let i = 0; i < BEAN_COUNT; i++) {
      // Tighter spread on mobile
      const spreadX = isMobile ? 12 : 35;
      const spreadY = isMobile ? 15 : 20;
      
      const x = (Math.random() - 0.5) * spreadX;
      const y = (Math.random() - 0.5) * spreadY;
      const z = (Math.random() - 0.5) * 8 - 2;
      const rx = Math.random() * Math.PI * 2;
      const ry = Math.random() * Math.PI * 2;
      
      // Smaller beans on mobile
      const s = isMobile ? (0.08 + Math.random() * 0.1) : (0.15 + Math.random() * 0.2);
      
      beanData.push({
        baseX: x, baseY: y, baseZ: z,
        rx, ry, rz: Math.random() * Math.PI * 2,
        rotSpeedX: (Math.random() - 0.5) * 0.5,
        rotSpeedY: (Math.random() - 0.5) * 0.5,
        floatSpeed: 0.2 + Math.random() * 0.5,
        floatOffset: Math.random() * Math.PI * 2,
        scale: s
      });
    }
    mainScene.add(instancedBeans);

    // Mouse tracking
    let mouseX = 0; let mouseY = 0;
    let targetX = 0; let targetY = 0;

    const handleMouseMove = (e) => {
      targetX = (e.clientX / window.innerWidth) * 2 - 1;
      targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      const w = document.documentElement.clientWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      uniforms.u_resolution.value.set(w, h);
      mainCamera.aspect = w / h;
      mainCamera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    const clock = new THREE.Clock();

    const render = () => {
      let delta = clock.getDelta();
      if (delta > 0.1) delta = 0.1; // Prevent physics explosion on lag/refresh
      
      const time = clock.getElapsedTime();
      
      // Safe lerp for mouse
      const lerpFactor = 1.0 - Math.exp(-5.0 * delta);
      mouseX += (targetX - mouseX) * lerpFactor;
      mouseY += (targetY - mouseY) * lerpFactor;
      
      uniforms.u_time.value += delta * 0.5;
      uniforms.u_mouse.value.set(mouseX, mouseY);
      
      // Animate beans
      for(let i = 0; i < BEAN_COUNT; i++) {
        const bd = beanData[i];
        const floatY = Math.sin(time * bd.floatSpeed + bd.floatOffset) * 1.5;
        
        // Gentle parallax
        const mouseOffsetX = mouseX * 3.0 * (1.0 + bd.scale);
        const mouseOffsetY = mouseY * 3.0 * (1.0 + bd.scale);

        dummy.position.set(bd.baseX + mouseOffsetX, bd.baseY + floatY + mouseOffsetY, bd.baseZ);
        
        bd.rx += bd.rotSpeedX * delta;
        bd.ry += bd.rotSpeedY * delta;
        
        dummy.rotation.set(bd.rx + mouseY * 0.5, bd.ry + mouseX * 0.5, bd.rz);
        dummy.scale.set(bd.scale, bd.scale, bd.scale);
        
        dummy.updateMatrix();
        instancedBeans.setMatrixAt(i, dummy.matrix);
      }
      instancedBeans.instanceMatrix.needsUpdate = true;
      
      renderer.clear();
      // renderer.render(bgScene, bgCamera); // Removed so CSS backgrounds (like hero image) show through
      renderer.render(mainScene, mainCamera);
      
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      currentMount.removeChild(renderer.domElement);
      bgPlane.geometry.dispose(); bgMaterial.dispose();
      beanGeo.dispose(); beanMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        maxWidth: '100%',
        overflow: 'hidden',
        zIndex: 0,          /* Sit above body bg, below page content */
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  );
}
