const screenWidth = 256;
const screenHeight = 192;
const screenCount = 2;
const frameBytes = screenWidth * screenHeight * 4 * screenCount;
const mountRoot = "/pilas";
const saveRoot = `${mountRoot}/saves`;
const stateRoot = `${mountRoot}/states`;
const systemRoot = `${mountRoot}/system`;
const firmwarePath = `${systemRoot}/firmware.bin`;
const bios9Path = `${systemRoot}/bios9.bin`;
const bios7Path = `${systemRoot}/bios7.bin`;
const dsiFirmwarePath = `${systemRoot}/dsi-firmware.bin`;
const dsiBios9Path = `${systemRoot}/dsi-bios9i.bin`;
const dsiBios7Path = `${systemRoot}/dsi-bios7i.bin`;
const dsiNandPath = `${systemRoot}/dsi-nand.bin`;
const dsiSdPath = `${systemRoot}/dsi-sd.img`;
const dldiSdPath = `${systemRoot}/dldi-sd.img`;

const $ = (id) => document.getElementById(id);
const statusText = $("statusText");
const fpsValue = $("fpsValue");
const speedValue = $("speedValue");
const saveValue = $("saveValue");
const coreValue = $("coreValue");
const rendererValue = $("rendererValue");
const sessionValue = $("sessionValue");
const romInput = $("romInput");
const ciaInput = $("ciaInput");
const bootMenuBtn = $("bootMenuBtn");
const bios9Input = $("bios9Input");
const bios7Input = $("bios7Input");
const firmwareInput = $("firmwareInput");
const consoleModeSelect = $("consoleModeSelect");
const bootModeSelect = $("bootModeSelect");
const dsiDspHleInput = $("dsiDspHleInput");
const dsiSdEnableInput = $("dsiSdEnableInput");
const dsiSdSizeSelect = $("dsiSdSizeSelect");
const dsiBios9Input = $("dsiBios9Input");
const dsiBios7Input = $("dsiBios7Input");
const dsiFirmwareInput = $("dsiFirmwareInput");
const dsiNandInput = $("dsiNandInput");
const dsiSdInput = $("dsiSdInput");
const dldiSdInput = $("dldiSdInput");
const dsiwareInstallTargetSelect = $("dsiwareInstallTargetSelect");
const ciaCommonKeyInput = $("ciaCommonKeyInput");
const nandInfoValue = $("nandInfoValue");
const sdInfoValue = $("sdInfoValue");
const dldiSdInfoValue = $("dldiSdInfoValue");
const dsiNandDownloadBtn = $("dsiNandDownloadBtn");
const dsiSdDownloadBtn = $("dsiSdDownloadBtn");
const dldiSdDownloadBtn = $("dldiSdDownloadBtn");
const dldiSdEnableInput = $("dldiSdEnableInput");
const dldiSdSizeSelect = $("dldiSdSizeSelect");
const manifestInput = $("manifestInput");
const manifestUrlInput = $("manifestUrlInput");
const manifestLoadBtn = $("manifestLoadBtn");
const cameraSelect = $("cameraSelect");
const cameraEnableBtn = $("cameraEnableBtn");
const micEnableBtn = $("micEnableBtn");
const wifiModeSelect = $("wifiModeSelect");
const wifiBridgeUrlInput = $("wifiBridgeUrlInput");
const wifiBridgeBtn = $("wifiBridgeBtn");
const mediaValue = $("mediaValue");
const wifiValue = $("wifiValue");
const pauseBtn = $("pauseBtn");
const resetBtn = $("resetBtn");
const audioBtn = $("audioBtn");
const fullscreenBtn = $("fullscreenBtn");
const fullscreenExitBtn = $("fullscreenExitBtn");
const advancedToggleBtn = $("advancedToggleBtn");
const advancedContent = $("advancedContent");
const rendererSelect = $("rendererSelect");
const accentSelect = $("accentSelect");
const canvasSizeSelect = $("canvasSizeSelect");
const resetBindingsBtn = $("resetBindingsBtn");
const bindingsPanel = $("bindingsPanel");
const stage = document.querySelector(".stage");
const stateSaveFileBtn = $("stateSaveFileBtn");
const stateFileInput = $("stateFileInput");
const stateSaveBrowserBtn = $("stateSaveBrowserBtn");
const stateLoadBrowserBtn = $("stateLoadBrowserBtn");
const stateModal = $("stateModal");
const stateModalTitle = $("stateModalTitle");
const stateModalCloseBtn = $("stateModalCloseBtn");
const stateSlotList = $("stateSlotList");
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const rendererStorageKey = "pilas.renderer";
const bindingsStorageKey = "pilas.keyBindings";
const accentStorageKey = "pilas.accent";
const canvasSizeStorageKey = "pilas.canvasSize";
const consoleModeStorageKey = "pilas.consoleMode";
const bootModeStorageKey = "pilas.bootMode";
const dsiDspHleStorageKey = "pilas.dsiDspHle";
const dsiSdEnableStorageKey = "pilas.dsiSdEnable";
const dsiSdSizeStorageKey = "pilas.dsiSdSize";
const dsiSdAutoStorageKey = "pilas.dsiSdAuto";
const dsiwareInstallTargetStorageKey = "pilas.dsiwareInstallTarget";
const dldiSdEnableStorageKey = "pilas.dldiSdEnable";
const dldiSdSizeStorageKey = "pilas.dldiSdSize";
const dldiSdAutoStorageKey = "pilas.dldiSdAuto";
const wifiModeStorageKey = "pilas.wifiMode";
const wifiBridgeUrlStorageKey = "pilas.wifiBridgeUrl";
const wifiBrowserMigrationKey = "pilas.wifiBrowserDefault.v1";
const ndsFrameRate = 59.8261;
const frameIntervalMs = 1000 / ndsFrameRate;
const maxFramesPerTick = 3;
const savePollIntervalMs = 500;
const storageSyncIntervalMs = 5000;
const browserStateSlots = 6;
const cameraWidth = 640;
const cameraHeight = 480;
const cameraYuvWords = cameraWidth * cameraHeight / 2;
const wifiHeaderBytes = 16;

let canvas = $("screenCanvas");
let videoRenderer = null;
let Module = null;
let instance = 0;
let romLoaded = false;
let paused = true;
let loopStarted = false;
let savePath = "";
let stateStem = "";
let romDisplayName = "";
let saveDirty = false;
let firmwareDirty = false;
let syncInFlight = false;
let keyboardMask = 0xFFF;
let padMask = 0xFFF;
let touchButtonMask = 0xFFF;
let lastFpsTime = performance.now();
let lastTickTime = performance.now();
let lastSavePollTime = 0;
let lastStorageSyncTime = 0;
let emulationAccumulator = 0;
let framesSinceFps = 0;
let lastRtcUpdate = 0;
let captureBindingBit = null;
let stateModalMode = "load";
let manualFullscreen = false;
let lastCameraPollTime = 0;

const controls = [
  { bit: 0, label: "A", code: "KeyX" },
  { bit: 1, label: "B", code: "KeyZ" },
  { bit: 2, label: "Select", code: "Backspace" },
  { bit: 3, label: "Start", code: "Enter" },
  { bit: 4, label: "Right", code: "ArrowRight" },
  { bit: 5, label: "Left", code: "ArrowLeft" },
  { bit: 6, label: "Up", code: "ArrowUp" },
  { bit: 7, label: "Down", code: "ArrowDown" },
  { bit: 8, label: "R", code: "KeyW" },
  { bit: 9, label: "L", code: "KeyQ" },
  { bit: 10, label: "X", code: "KeyS" },
  { bit: 11, label: "Y", code: "KeyA" },
];

const controlByBit = new Map(controls.map((control) => [control.bit, control]));
let keyBindings = loadKeyBindings();
let keyMap = buildKeyMap(keyBindings);

const systemFileDefs = {
  bios9: { label: "DS BIOS9", path: bios9Path, size: 0x1000 },
  bios7: { label: "DS BIOS7", path: bios7Path, size: 0x4000 },
  firmware: { label: "Firmware", path: firmwarePath },
  dsiBios9: { label: "DSi BIOS9i", path: dsiBios9Path, size: 0x10000 },
  dsiBios7: { label: "DSi BIOS7i", path: dsiBios7Path, size: 0x10000 },
  dsiFirmware: { label: "DSi Firmware", path: dsiFirmwarePath },
  dsiNand: { label: "DSi NAND", path: dsiNandPath },
  dsiSd: { label: "DSi SD image", path: dsiSdPath },
  dldiSd: { label: "Homebrew DLDI SD image", path: dldiSdPath },
};

const dsiManifestAliases = {
  dsiBios9: ["bios9", "bios9i", "arm9i", "dsiBios9"],
  dsiBios7: ["bios7", "bios7i", "arm7i", "dsiBios7"],
  dsiFirmware: ["firmware", "dsiFirmware"],
  dsiNand: ["nand", "dsiNand"],
  dsiSd: ["sd", "sdcard", "sdImage", "dsiSd"],
  dldiSd: ["dldi", "dldiSd", "homebrewSd", "homebrewSD", "homebrewSdImage"],
};

const manifestPathAliases = {
  bios9: [["ds", "bios9"], ["ds", "boot9"], ["ds", "arm9"], ["nds", "bios9"], ["nds", "boot9"], ["bios", "ds", "bios9"], ["bios", "bios9"], ["system", "ds", "bios9"], ["files", "ds", "bios9"]],
  bios7: [["ds", "bios7"], ["ds", "boot7"], ["ds", "arm7"], ["nds", "bios7"], ["nds", "boot7"], ["bios", "ds", "bios7"], ["bios", "bios7"], ["system", "ds", "bios7"], ["files", "ds", "bios7"]],
  firmware: [["ds", "firmware"], ["nds", "firmware"], ["system", "ds", "firmware"], ["files", "ds", "firmware"]],
  dsiBios9: [["dsi", "bios9"], ["dsi", "bios9i"], ["dsi", "boot9"], ["dsi", "arm9i"], ["dsi", "bios", "bios9"], ["dsi", "bios", "bios9i"], ["dsi", "bios", "boot9"], ["system", "dsi", "bios9"], ["files", "dsi", "bios9"]],
  dsiBios7: [["dsi", "bios7"], ["dsi", "bios7i"], ["dsi", "boot7"], ["dsi", "arm7i"], ["dsi", "bios", "bios7"], ["dsi", "bios", "bios7i"], ["dsi", "bios", "boot7"], ["system", "dsi", "bios7"], ["files", "dsi", "bios7"]],
  dsiFirmware: [["dsi", "firmware"], ["system", "dsi", "firmware"], ["files", "dsi", "firmware"]],
  dsiNand: [["dsi", "nand"], ["dsi", "internal"], ["dsi", "storage"], ["system", "dsi", "nand"], ["files", "dsi", "nand"]],
  dsiSd: [["dsi", "sd"], ["dsi", "sdcard"], ["dsi", "sdImage"], ["system", "dsi", "sd"], ["files", "dsi", "sd"]],
  dldiSd: [["dldi", "sd"], ["dldi", "sdcard"], ["dldi", "sdImage"], ["homebrew", "sd"], ["homebrew", "dldiSd"], ["system", "dldi", "sd"], ["files", "dldiSd"]],
};

const wifiPacketLabels = new Map([
  [1, "mp"],
  [2, "mp-cmd"],
  [3, "mp-reply"],
  [4, "mp-ack"],
  [5, "mp-host"],
  [6, "mp-replies"],
  [20, "net"],
]);

const rendererLabels = new Map([
  ["canvas2d", "Canvas"],
  ["webgl2", "WebGL 2"],
  ["webgpu", "WebGPU"],
]);

class Canvas2DRenderer {
  constructor(targetCanvas) {
    this.canvas = targetCanvas;
    this.ctx = targetCanvas.getContext("2d", { alpha: false });
    if (!this.ctx) throw new Error("Canvas 2D is unavailable");
    this.imageData = this.ctx.createImageData(screenWidth, screenHeight * screenCount);
    this.mode = "canvas2d";
    this.label = rendererLabels.get(this.mode);
  }

  clear() {
    this.ctx.fillStyle = "#050505";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  draw(heap, ptr) {
    this.imageData.data.set(heap.subarray(ptr, ptr + frameBytes));
    this.ctx.putImageData(this.imageData, 0, 0);
  }

  destroy() {
  }
}

class WebGL2Renderer {
  constructor(targetCanvas) {
    this.canvas = targetCanvas;
    this.gl = targetCanvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: true,
    });
    if (!this.gl) throw new Error("WebGL 2 is unavailable");
    this.mode = "webgl2";
    this.label = rendererLabels.get(this.mode);
    this.init();
  }

  init() {
    const gl = this.gl;
    const vertexSource = `#version 300 es
      in vec2 a_position;
      in vec2 a_texCoord;
      out vec2 v_texCoord;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = a_texCoord;
      }`;
    const fragmentSource = `#version 300 es
      precision mediump float;
      uniform sampler2D u_texture;
      in vec2 v_texCoord;
      out vec4 outColor;
      void main() {
        outColor = texture(u_texture, v_texCoord);
      }`;

    const program = createWebGLProgram(gl, vertexSource, fragmentSource);
    const vertices = new Float32Array([
      -1, 1, 0, 0,
      -1, -1, 0, 1,
      1, 1, 1, 0,
      1, -1, 1, 1,
    ]);

    this.program = program;
    this.vao = gl.createVertexArray();
    this.buffer = gl.createBuffer();
    this.texture = gl.createTexture();

    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "a_position");
    const texCoordLocation = gl.getAttribLocation(program, "a_texCoord");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 16, 8);

    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      screenWidth,
      screenHeight * screenCount,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null,
    );
  }

  clear() {
    const gl = this.gl;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0.02, 0.02, 0.02, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  draw(heap, ptr) {
    const gl = this.gl;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texSubImage2D(
      gl.TEXTURE_2D,
      0,
      0,
      0,
      screenWidth,
      screenHeight * screenCount,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      heap.subarray(ptr, ptr + frameBytes),
    );
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  destroy() {
    const gl = this.gl;
    gl.deleteTexture(this.texture);
    gl.deleteBuffer(this.buffer);
    gl.deleteVertexArray(this.vao);
    gl.deleteProgram(this.program);
  }
}

class WebGPURenderer {
  constructor(targetCanvas) {
    this.canvas = targetCanvas;
    this.mode = "webgpu";
    this.label = rendererLabels.get(this.mode);
  }

  async init() {
    if (!navigator.gpu) throw new Error("WebGPU is unavailable");

    this.adapter = await navigator.gpu.requestAdapter();
    if (!this.adapter) throw new Error("WebGPU adapter is unavailable");

    this.device = await this.adapter.requestDevice();
    this.context = this.canvas.getContext("webgpu");
    if (!this.context) throw new Error("WebGPU context is unavailable");

    this.format = navigator.gpu.getPreferredCanvasFormat();
    this.context.configure({
      device: this.device,
      format: this.format,
      alphaMode: "opaque",
    });

    this.texture = this.device.createTexture({
      size: [screenWidth, screenHeight * screenCount, 1],
      format: "rgba8unorm",
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
    });
    this.textureView = this.texture.createView();
    this.sampler = this.device.createSampler({
      magFilter: "nearest",
      minFilter: "nearest",
    });

    const shader = this.device.createShaderModule({
      code: `
        struct VertexOut {
          @builtin(position) position: vec4f,
          @location(0) uv: vec2f,
        };

        @vertex
        fn vs(@builtin(vertex_index) index: u32) -> VertexOut {
          var positions = array<vec2f, 6>(
            vec2f(-1.0, 1.0),
            vec2f(-1.0, -1.0),
            vec2f(1.0, 1.0),
            vec2f(1.0, 1.0),
            vec2f(-1.0, -1.0),
            vec2f(1.0, -1.0)
          );
          var uvs = array<vec2f, 6>(
            vec2f(0.0, 0.0),
            vec2f(0.0, 1.0),
            vec2f(1.0, 0.0),
            vec2f(1.0, 0.0),
            vec2f(0.0, 1.0),
            vec2f(1.0, 1.0)
          );
          var out: VertexOut;
          out.position = vec4f(positions[index], 0.0, 1.0);
          out.uv = uvs[index];
          return out;
        }

        @group(0) @binding(0) var frameSampler: sampler;
        @group(0) @binding(1) var frameTexture: texture_2d<f32>;

        @fragment
        fn fs(in: VertexOut) -> @location(0) vec4f {
          return textureSample(frameTexture, frameSampler, in.uv);
        }`,
    });

    this.pipeline = this.device.createRenderPipeline({
      layout: "auto",
      vertex: { module: shader, entryPoint: "vs" },
      fragment: {
        module: shader,
        entryPoint: "fs",
        targets: [{ format: this.format }],
      },
      primitive: { topology: "triangle-list" },
    });

    this.bindGroup = this.device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: this.sampler },
        { binding: 1, resource: this.textureView },
      ],
    });
  }

  clear() {
    this.submitPass(true);
  }

  draw(heap, ptr) {
    this.device.queue.writeTexture(
      { texture: this.texture },
      heap.subarray(ptr, ptr + frameBytes),
      { bytesPerRow: screenWidth * 4, rowsPerImage: screenHeight * screenCount },
      { width: screenWidth, height: screenHeight * screenCount, depthOrArrayLayers: 1 },
    );
    this.submitPass(false);
  }

  submitPass(clearOnly) {
    const encoder = this.device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [{
        view: this.context.getCurrentTexture().createView(),
        clearValue: { r: 0.02, g: 0.02, b: 0.02, a: 1 },
        loadOp: "clear",
        storeOp: "store",
      }],
    });
    if (!clearOnly) {
      pass.setPipeline(this.pipeline);
      pass.setBindGroup(0, this.bindGroup);
      pass.draw(6);
    }
    pass.end();
    this.device.queue.submit([encoder.finish()]);
  }

  destroy() {
    this.texture?.destroy();
    this.device?.destroy();
  }
}

function createWebGLProgram(gl, vertexSource, fragmentSource) {
  const vertexShader = createWebGLShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createWebGLShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) || "Failed to link WebGL";
    gl.deleteProgram(program);
    throw new Error(message);
  }

  return program;
}

function createWebGLShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) || "Failed to compile WebGL";
    gl.deleteShader(shader);
    throw new Error(message);
  }

  return shader;
}

class AudioEngine {
  constructor() {
    this.context = null;
    this.node = null;
    this.enabled = false;
    this.preferred = true;
    this.bufferPtr = 0;
    this.maxFrames = 2048;
  }

  async start() {
    if (!Module || !instance) return;

    if (!this.context) {
      const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextCtor) {
        audioBtn.textContent = "Audio";
        setStatus("WebAudio is unavailable");
        return;
      }

      this.context = new AudioContextCtor({ sampleRate: 48000, latencyHint: "interactive" });
      await this.context.audioWorklet.addModule("./src/audio-worklet.js");
      this.node = new AudioWorkletNode(this.context, "pilas-audio-worklet", {
        numberOfInputs: 0,
        numberOfOutputs: 1,
        outputChannelCount: [2],
      });
      this.node.connect(this.context.destination);
      this.bufferPtr = Module._malloc(this.maxFrames * 2 * 2);
    }

    try {
      await this.context.resume();
      this.enabled = true;
      this.preferred = true;
      audioBtn.textContent = "Mute";
    } catch (error) {
      this.enabled = false;
      audioBtn.textContent = "Audio";
      console.warn(error);
    }
  }

  async stop() {
    this.enabled = false;
    this.preferred = false;
    audioBtn.textContent = "Audio";
    if (this.context) await this.context.suspend();
  }

  async toggle() {
    if (this.enabled) await this.stop();
    else {
      this.preferred = true;
      await this.start();
    }
  }

  async startPreferred() {
    if (!this.preferred || this.enabled) return;
    await this.start();
  }

  pump() {
    if (!this.enabled || !this.node || !this.bufferPtr) return;
    if (this.context.state !== "running") return;

    const frames = Module._pilas_pull_audio(instance, this.bufferPtr, this.maxFrames);
    if (frames <= 0) return;

    const start = this.bufferPtr >> 1;
    const pcm = Module.HEAP16.subarray(start, start + frames * 2);
    const samples = new Float32Array(frames * 2);
    for (let i = 0; i < pcm.length; i++) {
      samples[i] = Math.max(-1, Math.min(1, pcm[i] / 32768));
    }
    this.node.port.postMessage({ type: "samples", samples }, [samples.buffer]);
  }
}

const audio = new AudioEngine();

class BrowserMediaBridge {
  constructor() {
    this.micStream = null;
    this.micContext = null;
    this.micProcessor = null;
    this.micSource = null;
    this.micMute = null;
    this.cameraStream = null;
    this.cameraVideo = null;
    this.cameraCanvas = null;
    this.cameraCtx = null;
    this.cameraFrame = new Uint32Array(cameraYuvWords);
    this.cameraLoopId = 0;
    this.lastCameraFrameTime = 0;
  }

  get micActive() {
    return !!this.micStream;
  }

  get cameraActive() {
    return !!this.cameraStream;
  }

  updateUi() {
    if (micEnableBtn) micEnableBtn.textContent = this.micActive ? "Disable microphone" : "Enable microphone";
    if (cameraEnableBtn) cameraEnableBtn.textContent = this.cameraActive ? "Disable camera" : "Enable camera";

    const parts = [];
    if (this.cameraActive) parts.push("camera");
    if (this.micActive) parts.push("mic");
    mediaValue.textContent = parts.length ? parts.join(" + ") : "off";
  }

  async toggleMic() {
    if (this.micActive) {
      await this.stopMic();
      return;
    }
    await this.startMic();
  }

  async startMic() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("Microphone is unavailable");
      return;
    }

    this.micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });

    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    this.micContext = new AudioContextCtor({ sampleRate: 48000, latencyHint: "interactive" });
    this.micSource = this.micContext.createMediaStreamSource(this.micStream);
    this.micProcessor = this.micContext.createScriptProcessor(2048, 1, 1);
    this.micMute = this.micContext.createGain();
    this.micMute.gain.value = 0;

    this.micProcessor.onaudioprocess = (event) => {
      if (!Module || !instance) return;

      const input = event.inputBuffer.getChannelData(0);
      const pcm = new Int16Array(input.length);
      for (let i = 0; i < input.length; i++) {
        const sample = Math.max(-1, Math.min(1, input[i]));
        pcm[i] = sample < 0 ? sample * 32768 : sample * 32767;
      }

      const ptr = Module._malloc(pcm.byteLength);
      Module.HEAP16.set(pcm, ptr >> 1);
      Module._pilas_push_mic_samples(instance, ptr, pcm.length);
      Module._free(ptr);
    };

    this.micSource.connect(this.micProcessor);
    this.micProcessor.connect(this.micMute);
    this.micMute.connect(this.micContext.destination);
    await this.micContext.resume();
    this.updateUi();
    setStatus("Microphone enabled");
  }

  async stopMic() {
    this.micProcessor?.disconnect();
    this.micSource?.disconnect();
    this.micMute?.disconnect();
    this.micProcessor = null;
    this.micSource = null;
    this.micMute = null;

    if (this.micContext) {
      await this.micContext.close();
      this.micContext = null;
    }

    this.micStream?.getTracks().forEach((track) => track.stop());
    this.micStream = null;
    this.updateUi();
    setStatus("Microphone off");
  }

  async toggleCamera() {
    if (this.cameraActive) {
      this.stopCamera();
      return;
    }
    await this.startCamera();
  }

  async startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("Camera is unavailable");
      return;
    }

    const facingMode = cameraSelect.value === "1" ? "user" : "environment";
    this.cameraStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: cameraWidth },
        height: { ideal: cameraHeight },
        facingMode,
      },
      audio: false,
    });

    this.cameraVideo = document.createElement("video");
    this.cameraVideo.muted = true;
    this.cameraVideo.playsInline = true;
    this.cameraVideo.srcObject = this.cameraStream;
    await this.cameraVideo.play();

    this.cameraCanvas = document.createElement("canvas");
    this.cameraCanvas.width = cameraWidth;
    this.cameraCanvas.height = cameraHeight;
    this.cameraCtx = this.cameraCanvas.getContext("2d", { alpha: false, willReadFrequently: true });
    this.updateUi();
    this.lastCameraFrameTime = 0;
    this.cameraLoopId = requestAnimationFrame((now) => this.cameraLoop(now));
    setStatus("Camera enabled");
  }

  stopCamera() {
    if (this.cameraLoopId) cancelAnimationFrame(this.cameraLoopId);
    this.cameraLoopId = 0;
    this.cameraStream?.getTracks().forEach((track) => track.stop());
    this.cameraStream = null;
    this.cameraVideo = null;
    this.cameraCanvas = null;
    this.cameraCtx = null;
    this.updateUi();
    setStatus("Camera off");
  }

  cameraLoop(now) {
    if (!this.cameraActive) return;
    if (now - this.lastCameraFrameTime >= 66) {
      this.pushCameraFrame();
      this.lastCameraFrameTime = now;
    }
    this.cameraLoopId = requestAnimationFrame((nextNow) => this.cameraLoop(nextNow));
  }

  pushCameraFrame() {
    if (!Module || !instance || !this.cameraCtx || !this.cameraVideo?.videoWidth) return;

    this.cameraCtx.drawImage(this.cameraVideo, 0, 0, cameraWidth, cameraHeight);
    const rgba = this.cameraCtx.getImageData(0, 0, cameraWidth, cameraHeight).data;
    let out = 0;
    for (let y = 0; y < cameraHeight; y++) {
      const row = y * cameraWidth * 4;
      for (let x = 0; x < cameraWidth; x += 2) {
        const p1 = row + x * 4;
        const p2 = p1 + 4;
        const r1 = rgba[p1];
        const g1 = rgba[p1 + 1];
        const b1 = rgba[p1 + 2];
        const r2 = rgba[p2];
        const g2 = rgba[p2 + 1];
        const b2 = rgba[p2 + 2];

        const y1 = clampByte(((r1 * 19595) + (g1 * 38470) + (b1 * 7471)) >> 16);
        const u1 = clampByte((((b1 - y1) * 32244) >> 16) + 128);
        const v1 = clampByte((((r1 - y1) * 57475) >> 16) + 128);
        const y2 = clampByte(((r2 * 19595) + (g2 * 38470) + (b2 * 7471)) >> 16);
        const u2 = clampByte((((b2 - y2) * 32244) >> 16) + 128);
        const v2 = clampByte((((r2 - y2) * 57475) >> 16) + 128);
        const u = (u1 + u2) >> 1;
        const v = (v1 + v2) >> 1;
        this.cameraFrame[out++] = y1 | (u << 8) | (y2 << 16) | (v << 24);
      }
    }

    const ptr = Module._malloc(this.cameraFrame.byteLength);
    Module.HEAPU32.set(this.cameraFrame, ptr >> 2);
    const selectedCamera = Number(cameraSelect.value) || 0;
    const activeMask = Module._pilas_camera_active_mask(instance);
    const targetMask = activeMask || (1 << selectedCamera);
    for (let num = 0; num < 2; num++) {
      if (targetMask & (1 << num)) {
        Module._pilas_push_camera_yuyv(instance, num, ptr, this.cameraFrame.length);
      }
    }
    Module._free(ptr);
  }

  pollCore() {
    if (!Module || !instance || !this.cameraActive) return;
    const activeMask = Module._pilas_camera_active_mask(instance);
    if (activeMask) {
      const names = [];
      if (activeMask & 1) names.push("outer");
      if (activeMask & 2) names.push("inner");
      mediaValue.textContent = `camera ${names.join("/")}${this.micActive ? " + mic" : ""}`;
    }
  }
}

class BrowserInternetBridge {
  constructor(pushPacket) {
    this.pushPacket = pushPacket;
    this.enabled = false;
    this.hostMac = new Uint8Array([0x02, 0x50, 0x4D, 0x57, 0x45, 0x42]);
    this.broadcastMac = new Uint8Array([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]);
    this.hostIp = new Uint8Array([10, 0, 2, 2]);
    this.clientIp = new Uint8Array([10, 0, 2, 15]);
    this.guestMac = null;
    this.ipId = 1;
    this.nextSyntheticIp = 20;
    this.domainToIp = new Map();
    this.ipToDomain = new Map();
    this.tcpFlows = new Map();
  }

  start() {
    this.enabled = true;
  }

  stop() {
    this.enabled = false;
    this.guestMac = null;
    this.tcpFlows.clear();
  }

  receive(type, body) {
    if (!this.enabled || type !== 20 || !(body instanceof Uint8Array) || body.length < 14) return false;
    const etherType = read16be(body, 12);
    const srcMac = body.slice(6, 12);
    if (!this.guestMac || !macEquals(srcMac, this.hostMac)) this.guestMac = srcMac;

    if (etherType === 0x0806) {
      this.handleArp(body);
      return true;
    }
    if (etherType === 0x0800) {
      this.handleIpv4(body);
      return true;
    }
    return false;
  }

  handleArp(frame) {
    if (frame.length < 42) return;
    const offset = 14;
    const opcode = read16be(frame, offset + 6);
    if (opcode !== 1) return;

    const senderMac = frame.slice(offset + 8, offset + 14);
    const senderIp = frame.slice(offset + 14, offset + 18);
    const targetIp = frame.slice(offset + 24, offset + 28);
    const payload = new Uint8Array(28);
    write16be(payload, 0, 1);
    write16be(payload, 2, 0x0800);
    payload[4] = 6;
    payload[5] = 4;
    write16be(payload, 6, 2);
    payload.set(this.hostMac, 8);
    payload.set(targetIp, 14);
    payload.set(senderMac, 18);
    payload.set(senderIp, 24);
    this.sendEthernet(senderMac, 0x0806, payload);
  }

  handleIpv4(frame) {
    const ipOffset = 14;
    if (frame.length < ipOffset + 20 || (frame[ipOffset] >> 4) !== 4) return;
    const ihl = (frame[ipOffset] & 0x0F) * 4;
    const totalLength = read16be(frame, ipOffset + 2);
    if (ihl < 20 || totalLength < ihl || frame.length < ipOffset + totalLength) return;

    const protocol = frame[ipOffset + 9];
    const srcIp = frame.slice(ipOffset + 12, ipOffset + 16);
    const dstIp = frame.slice(ipOffset + 16, ipOffset + 20);
    const payloadOffset = ipOffset + ihl;
    const payloadLength = totalLength - ihl;
    const payload = frame.slice(payloadOffset, payloadOffset + payloadLength);

    if (protocol === 17) this.handleUdp(frame.slice(6, 12), srcIp, dstIp, payload);
    else if (protocol === 6) this.handleTcp(frame.slice(6, 12), srcIp, dstIp, payload);
  }

  handleUdp(dstMac, srcIp, dstIp, packet) {
    if (packet.length < 8) return;
    const srcPort = read16be(packet, 0);
    const dstPort = read16be(packet, 2);
    const udpLength = read16be(packet, 4);
    if (udpLength < 8 || packet.length < udpLength) return;
    const payload = packet.slice(8, udpLength);

    if (srcPort === 68 && dstPort === 67) {
      this.handleDhcp(dstMac, payload);
      return;
    }
    if (dstPort === 53) {
      this.handleDns(dstMac, srcIp, srcPort, payload);
    }
  }

  handleDhcp(dstMac, payload) {
    if (payload.length < 240) return;
    const messageType = readDhcpMessageType(payload);
    if (messageType !== 1 && messageType !== 3) return;

    const responseType = messageType === 1 ? 2 : 5;
    const clientMac = payload.slice(28, 34);
    const response = new Uint8Array(300);
    response[0] = 2;
    response[1] = 1;
    response[2] = 6;
    response.set(payload.slice(4, 8), 4);
    response[10] = 0x80;
    response.set(this.clientIp, 16);
    response.set(this.hostIp, 20);
    response.set(clientMac, 28);
    response.set([99, 130, 83, 99], 236);

    let option = 240;
    option = writeDhcpOption(response, option, 53, [responseType]);
    option = writeDhcpOption(response, option, 54, this.hostIp);
    option = writeDhcpOption(response, option, 51, u32bytes(86400));
    option = writeDhcpOption(response, option, 1, [255, 255, 255, 0]);
    option = writeDhcpOption(response, option, 3, this.hostIp);
    option = writeDhcpOption(response, option, 6, this.hostIp);
    option = writeDhcpOption(response, option, 58, u32bytes(3600));
    option = writeDhcpOption(response, option, 59, u32bytes(7200));
    response[option] = 255;

    this.sendUdp(
      this.hostMac,
      this.broadcastMac,
      this.hostIp,
      new Uint8Array([255, 255, 255, 255]),
      67,
      68,
      response,
    );
  }

  handleDns(dstMac, srcIp, srcPort, payload) {
    if (payload.length < 12) return;
    const parsed = parseDnsQuestion(payload);
    if (!parsed) return;

    const isA = parsed.qtype === 1;
    const answerIp = isA ? this.syntheticIpForDomain(parsed.name || "internet.local") : null;
    const responseLength = 12 + parsed.question.length + (answerIp ? 16 : 0);
    const response = new Uint8Array(responseLength);
    response.set(payload.slice(0, 2), 0);
    write16be(response, 2, 0x8180);
    write16be(response, 4, 1);
    write16be(response, 6, answerIp ? 1 : 0);
    write16be(response, 8, 0);
    write16be(response, 10, 0);
    response.set(parsed.question, 12);

    if (answerIp) {
      const answer = 12 + parsed.question.length;
      write16be(response, answer, 0xC00C);
      write16be(response, answer + 2, 1);
      write16be(response, answer + 4, 1);
      write32be(response, answer + 6, 60);
      write16be(response, answer + 10, 4);
      response.set(answerIp, answer + 12);
    }

    this.sendUdp(this.hostMac, dstMac, this.hostIp, srcIp, 53, srcPort, response);
  }

  handleTcp(dstMac, srcIp, dstIp, packet) {
    if (packet.length < 20) return;
    const srcPort = read16be(packet, 0);
    const dstPort = read16be(packet, 2);
    const seq = read32be(packet, 4);
    const dataOffset = (packet[12] >> 4) * 4;
    const flags = packet[13];
    if (dataOffset < 20 || packet.length < dataOffset) return;

    const key = `${ipKey(srcIp)}:${srcPort}-${ipKey(dstIp)}:${dstPort}`;
    let flow = this.tcpFlows.get(key);
    if (!flow) {
      flow = {
        serverSeq: (0x50000000 + this.tcpFlows.size * 0x1000) >>> 0,
        serverNext: 0,
        clientNext: 0,
        dstMac,
        host: this.ipToDomain.get(ipKey(dstIp)) || ipKey(dstIp),
      };
      flow.serverNext = (flow.serverSeq + 1) >>> 0;
      this.tcpFlows.set(key, flow);
    }

    if (flags & 0x04) {
      this.tcpFlows.delete(key);
      return;
    }

    if (flags & 0x02) {
      flow.clientNext = (seq + 1) >>> 0;
      this.sendTcp(this.hostMac, dstMac, dstIp, srcIp, dstPort, srcPort, flow.serverSeq, flow.clientNext, 0x12, new Uint8Array());
      return;
    }

    const data = packet.slice(dataOffset);
    if (data.length > 0) {
      flow.clientNext = (seq + data.length) >>> 0;
      this.sendTcp(this.hostMac, dstMac, dstIp, srcIp, dstPort, srcPort, flow.serverNext, flow.clientNext, 0x10, new Uint8Array());
      const response = this.httpResponse(data, flow.host, dstPort);
      if (response.length) {
        this.sendTcp(this.hostMac, dstMac, dstIp, srcIp, dstPort, srcPort, flow.serverNext, flow.clientNext, 0x19, response);
        flow.serverNext = (flow.serverNext + response.length + 1) >>> 0;
      }
      return;
    }

    if (flags & 0x01) {
      flow.clientNext = (seq + 1) >>> 0;
      this.sendTcp(this.hostMac, dstMac, dstIp, srcIp, dstPort, srcPort, flow.serverNext, flow.clientNext, 0x11, new Uint8Array());
      this.tcpFlows.delete(key);
    }
  }

  httpResponse(data, host, port) {
    const text = asciiFromBytes(data);
    if (!/^(GET|POST|HEAD|PUT|OPTIONS) /i.test(text)) return new Uint8Array();
    const firstLine = text.split("\r\n", 1)[0] || "GET / HTTP/1.1";
    const hostHeader = /(?:^|\r\n)Host:\s*([^\r\n]+)/i.exec(text)?.[1]?.trim() || host;
    const method = firstLine.split(" ")[0].toUpperCase();
    const bodyText = [
      "Pilas-melonDS browser internet is online.",
      `Host: ${hostHeader}`,
      `Request: ${firstLine}`,
      `Port: ${port}`,
    ].join("\n");
    const body = method === "HEAD" ? "" : bodyText;
    return bytesFromAscii([
      "HTTP/1.1 200 OK",
      "Content-Type: text/plain; charset=utf-8",
      "Cache-Control: no-store",
      "Connection: close",
      `Content-Length: ${encoder.encode(body).length}`,
      "",
      body,
    ].join("\r\n"));
  }

  syntheticIpForDomain(domain) {
    const key = domain.toLowerCase();
    const existing = this.domainToIp.get(key);
    if (existing) return existing;

    const ip = new Uint8Array([10, 0, 2, this.nextSyntheticIp]);
    this.nextSyntheticIp++;
    if (this.nextSyntheticIp > 240) this.nextSyntheticIp = 20;
    this.domainToIp.set(key, ip);
    this.ipToDomain.set(ipKey(ip), key);
    return ip;
  }

  sendEthernet(dstMac, etherType, payload) {
    const frame = new Uint8Array(14 + payload.length);
    frame.set(dstMac, 0);
    frame.set(this.hostMac, 6);
    write16be(frame, 12, etherType);
    frame.set(payload, 14);
    this.pushPacket(20, frame);
  }

  sendUdp(srcMac, dstMac, srcIp, dstIp, srcPort, dstPort, payload) {
    const udp = new Uint8Array(8 + payload.length);
    write16be(udp, 0, srcPort);
    write16be(udp, 2, dstPort);
    write16be(udp, 4, udp.length);
    write16be(udp, 6, 0);
    udp.set(payload, 8);
    this.sendIpv4(srcMac, dstMac, srcIp, dstIp, 17, udp);
  }

  sendTcp(srcMac, dstMac, srcIp, dstIp, srcPort, dstPort, seq, ack, flags, payload) {
    const tcp = new Uint8Array(20 + payload.length);
    write16be(tcp, 0, srcPort);
    write16be(tcp, 2, dstPort);
    write32be(tcp, 4, seq);
    write32be(tcp, 8, ack);
    tcp[12] = 5 << 4;
    tcp[13] = flags;
    write16be(tcp, 14, 4096);
    tcp.set(payload, 20);
    write16be(tcp, 16, tcpChecksum(srcIp, dstIp, tcp));
    this.sendIpv4(srcMac, dstMac, srcIp, dstIp, 6, tcp);
  }

  sendIpv4(srcMac, dstMac, srcIp, dstIp, protocol, payload) {
    const ip = new Uint8Array(20 + payload.length);
    ip[0] = 0x45;
    write16be(ip, 2, ip.length);
    write16be(ip, 4, this.ipId++ & 0xFFFF);
    write16be(ip, 6, 0x4000);
    ip[8] = 64;
    ip[9] = protocol;
    ip.set(srcIp, 12);
    ip.set(dstIp, 16);
    write16be(ip, 10, checksum16(ip));
    ip.set(payload, 20);

    const frame = new Uint8Array(14 + ip.length);
    frame.set(dstMac, 0);
    frame.set(srcMac, 6);
    write16be(frame, 12, 0x0800);
    frame.set(ip, 14);
    this.pushPacket(20, frame);
  }
}

class WifiBridge {
  constructor() {
    this.socket = null;
    this.channel = null;
    this.internet = new BrowserInternetBridge((type, body, tsLow = 0, tsHigh = 0, aid = 0) => {
      this.pushToCore(type, body, tsLow, tsHigh, aid);
    });
    this.peerId = crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
  }

  get connected() {
    return this.internet.enabled || this.channel || this.socket?.readyState === WebSocket.OPEN;
  }

  updateUi(text = "") {
    const mode = wifiModeSelect.value;
    if (mode === "browser") {
      wifiBridgeBtn.textContent = this.internet.enabled ? "Restart internet" : "Start internet";
      wifiValue.textContent = text || (this.internet.enabled ? "browser internet" : "off");
      return;
    }
    wifiBridgeBtn.textContent = this.connected ? "Disconnect Wi-Fi" : (mode === "off" ? "Wi-Fi off" : "Connect Wi-Fi");
    wifiValue.textContent = text || (this.connected ? mode : "off");
  }

  async toggle() {
    if (wifiModeSelect.value === "browser") {
      this.connectBrowser(false);
      return;
    }

    if (this.connected || (this.socket && this.socket.readyState !== WebSocket.CLOSED)) {
      this.disconnect();
      return;
    }

    const mode = wifiModeSelect.value;
    storageSet(wifiModeStorageKey, mode);
    if (mode === "off") {
      this.disconnect();
      return;
    }
    if (mode === "local") {
      this.connectLocal();
      return;
    }
    this.connect(wifiBridgeUrlInput.value.trim());
  }

  disconnect() {
    if (this.socket && this.socket.readyState !== WebSocket.CLOSED) this.socket.close();
    this.socket = null;
    this.channel?.close();
    this.channel = null;
    this.internet.stop();
    if (Module && instance) Module._pilas_set_wifi_bridge_enabled(instance, 0);
    this.updateUi("off");
  }

  autoStart() {
    if (!Module || !instance || wifiModeSelect.value !== "browser") return;
    this.connectBrowser(true);
  }

  connectBrowser(quiet = false) {
    if (this.socket && this.socket.readyState !== WebSocket.CLOSED) this.socket.close();
    this.socket = null;
    this.channel?.close();
    this.channel = null;
    this.internet.start();
    if (Module && instance) Module._pilas_set_wifi_bridge_enabled(instance, 1);
    this.updateUi("browser internet");
    if (!quiet) setStatus("Browser internet enabled");
  }

  connectLocal() {
    this.disconnect();
    this.channel = new BroadcastChannel("pilas-melonds-wifi");
    this.channel.addEventListener("message", (event) => {
      if (!event.data || event.data.peerId === this.peerId) return;
      this.receive(event.data.packet);
    });
    if (Module && instance) Module._pilas_set_wifi_bridge_enabled(instance, 1);
    this.updateUi("local");
    setStatus("Local tab Wi-Fi enabled");
  }

  connect(url) {
    if (!url) {
      setStatus("Enter a Wi-Fi WebSocket URL");
      return;
    }

    this.disconnect();
    storageSet(wifiBridgeUrlStorageKey, url);
    const socket = new WebSocket(url);
    socket.binaryType = "arraybuffer";
    this.socket = socket;
    this.updateUi("connecting");

    socket.addEventListener("open", () => {
      if (this.socket !== socket) return;
      if (Module && instance) Module._pilas_set_wifi_bridge_enabled(instance, 1);
      this.updateUi("bridge");
      setStatus("Wi-Fi bridge connected");
    });

    socket.addEventListener("close", () => {
      if (this.socket !== socket) return;
      this.socket = null;
      if (Module && instance) Module._pilas_set_wifi_bridge_enabled(instance, 0);
      this.updateUi("off");
    });

    socket.addEventListener("error", () => {
      if (this.socket !== socket) return;
      this.updateUi("error");
      setStatus("Wi-Fi bridge failed");
    });

    socket.addEventListener("message", async (event) => {
      if (this.socket !== socket) return;
      const buffer = event.data instanceof Blob ? await event.data.arrayBuffer() : event.data;
      this.receive(buffer);
    });
  }

  receive(buffer) {
    if (!Module || !instance || !(buffer instanceof ArrayBuffer) || buffer.byteLength < wifiHeaderBytes) return;

    const view = new DataView(buffer);
    const type = view.getUint8(0);
    const aid = view.getUint16(2, true);
    const tsLow = view.getUint32(4, true);
    const tsHigh = view.getUint32(8, true);
    const len = Math.min(view.getUint32(12, true), buffer.byteLength - wifiHeaderBytes);
    const body = new Uint8Array(buffer, wifiHeaderBytes, len);
    this.pushToCore(type, body, tsLow, tsHigh, aid);
  }

  pushToCore(type, body, tsLow = 0, tsHigh = 0, aid = 0) {
    if (!Module || !instance || !(body instanceof Uint8Array)) return;
    const ptr = allocBytes(body);
    Module._pilas_push_wifi_rx(instance, type, ptr, body.length, tsLow, tsHigh, aid);
    freePtr(ptr);
  }

  pump() {
    if (!Module || !instance || !this.connected) return;

    let sent = 0;
    while (Module._pilas_wifi_tx_pending(instance) > 0 && sent < 8) {
      const type = Module._pilas_wifi_tx_type(instance);
      const len = Module._pilas_wifi_tx_len(instance);
      const ptr = Module._pilas_wifi_tx_ptr(instance);
      const tsLow = Module._pilas_wifi_tx_timestamp_low(instance) >>> 0;
      const tsHigh = Module._pilas_wifi_tx_timestamp_high(instance) >>> 0;
      const aid = Module._pilas_wifi_tx_aid(instance) & 0xFFFF;
      const body = ptr && len > 0 ? Module.HEAPU8.slice(ptr, ptr + len) : new Uint8Array();
      const packet = new Uint8Array(wifiHeaderBytes + body.length);
      const view = new DataView(packet.buffer);
      view.setUint8(0, type & 0xFF);
      view.setUint8(1, 0);
      view.setUint16(2, aid, true);
      view.setUint32(4, tsLow, true);
      view.setUint32(8, tsHigh, true);
      view.setUint32(12, body.length, true);
      packet.set(body, wifiHeaderBytes);
      let label = "";
      if (this.internet.enabled && type === 20) {
        this.internet.receive(type, body);
        label = "browser internet";
      } else if (this.channel) {
        this.channel.postMessage({ peerId: this.peerId, packet: packet.buffer });
        label = "local";
      } else if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(packet);
        label = wifiPacketLabels.get(type) || "bridge";
      }
      Module._pilas_wifi_tx_drop(instance);
      sent++;
      if (label) this.updateUi(label);
    }
  }
}

function read16be(bytes, offset) {
  return ((bytes[offset] << 8) | bytes[offset + 1]) >>> 0;
}

function read32be(bytes, offset) {
  return (((bytes[offset] << 24) >>> 0) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]) >>> 0;
}

function write16be(bytes, offset, value) {
  bytes[offset] = (value >>> 8) & 0xFF;
  bytes[offset + 1] = value & 0xFF;
}

function write32be(bytes, offset, value) {
  bytes[offset] = (value >>> 24) & 0xFF;
  bytes[offset + 1] = (value >>> 16) & 0xFF;
  bytes[offset + 2] = (value >>> 8) & 0xFF;
  bytes[offset + 3] = value & 0xFF;
}

function checksum16(bytes, offset = 0, length = bytes.length - offset) {
  let sum = 0;
  let index = offset;
  while (length > 1) {
    sum += (bytes[index] << 8) + bytes[index + 1];
    index += 2;
    length -= 2;
  }
  if (length > 0) sum += bytes[index] << 8;
  while (sum > 0xFFFF) sum = (sum & 0xFFFF) + (sum >>> 16);
  return (~sum) & 0xFFFF;
}

function tcpChecksum(srcIp, dstIp, tcp) {
  const pseudo = new Uint8Array(12 + tcp.length + (tcp.length & 1));
  pseudo.set(srcIp, 0);
  pseudo.set(dstIp, 4);
  pseudo[9] = 6;
  write16be(pseudo, 10, tcp.length);
  pseudo.set(tcp, 12);
  return checksum16(pseudo);
}

function macEquals(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function ipKey(ip) {
  return `${ip[0]}.${ip[1]}.${ip[2]}.${ip[3]}`;
}

function u32bytes(value) {
  return new Uint8Array([(value >>> 24) & 0xFF, (value >>> 16) & 0xFF, (value >>> 8) & 0xFF, value & 0xFF]);
}

function writeDhcpOption(bytes, offset, code, value) {
  const data = value instanceof Uint8Array ? value : new Uint8Array(value);
  bytes[offset++] = code;
  bytes[offset++] = data.length;
  bytes.set(data, offset);
  return offset + data.length;
}

function readDhcpMessageType(payload) {
  let offset = 240;
  while (offset < payload.length) {
    const code = payload[offset++];
    if (code === 255) break;
    if (code === 0) continue;
    const length = payload[offset++];
    if (offset + length > payload.length) break;
    if (code === 53 && length > 0) return payload[offset];
    offset += length;
  }
  return 0;
}

function parseDnsQuestion(payload) {
  const qdCount = read16be(payload, 4);
  if (qdCount < 1) return null;
  let offset = 12;
  const labels = [];
  while (offset < payload.length) {
    const length = payload[offset++];
    if (length === 0) break;
    if ((length & 0xC0) !== 0 || offset + length > payload.length) return null;
    labels.push(asciiFromBytes(payload.slice(offset, offset + length)));
    offset += length;
  }
  if (offset + 4 > payload.length) return null;
  const end = offset + 4;
  return {
    name: labels.join("."),
    qtype: read16be(payload, offset),
    qclass: read16be(payload, offset + 2),
    question: payload.slice(12, end),
  };
}

function asciiFromBytes(bytes) {
  let result = "";
  for (let i = 0; i < bytes.length; i++) result += String.fromCharCode(bytes[i] & 0x7F);
  return result;
}

function bytesFromAscii(text) {
  const bytes = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i++) bytes[i] = text.charCodeAt(i) & 0xFF;
  return bytes;
}

function clampByte(value) {
  return value < 0 ? 0 : value > 255 ? 255 : value;
}

const mediaBridge = new BrowserMediaBridge();
const wifiBridge = new WifiBridge();

function setStatus(text) {
  statusText.textContent = text;
  if (sessionValue) sessionValue.textContent = text;
}

function storageGet(key, fallback) {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

function storageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
  }
}

function applyAccent(value) {
  const accent = ["mint", "blue", "gold", "rose"].includes(value) ? value : "mint";
  document.documentElement.dataset.accent = accent;
  accentSelect.value = accent;
  storageSet(accentStorageKey, accent);
}

function applyCanvasSize(value) {
  const size = ["compact", "normal", "large"].includes(value) ? value : "normal";
  document.documentElement.dataset.canvasSize = size;
  canvasSizeSelect.value = size;
  storageSet(canvasSizeStorageKey, size);
}

function applyStoredUiOptions() {
  applyAccent(storageGet(accentStorageKey, "mint"));
  applyCanvasSize(storageGet(canvasSizeStorageKey, "normal"));
  consoleModeSelect.value = storageGet(consoleModeStorageKey, "nds") === "dsi" ? "dsi" : "nds";
  bootModeSelect.value = storageGet(bootModeStorageKey, "direct") === "firmware" ? "firmware" : "direct";
  dsiDspHleInput.checked = storageGet(dsiDspHleStorageKey, "1") !== "0";
  dsiSdEnableInput.checked = storageGet(dsiSdEnableStorageKey, "1") !== "0";
  dsiSdSizeSelect.value = ["64", "128", "256", "512"].includes(storageGet(dsiSdSizeStorageKey, "128"))
    ? storageGet(dsiSdSizeStorageKey, "128")
    : "128";
  dsiwareInstallTargetSelect.value = storageGet(dsiwareInstallTargetStorageKey, "nand") === "sd" ? "sd" : "nand";
  dldiSdEnableInput.checked = storageGet(dldiSdEnableStorageKey, "1") !== "0";
  dldiSdSizeSelect.value = ["64", "128", "256", "512"].includes(storageGet(dldiSdSizeStorageKey, "128"))
    ? storageGet(dldiSdSizeStorageKey, "128")
    : "128";
  const storedWifiMode = storageGet(wifiModeStorageKey, "");
  wifiModeSelect.value = ["browser", "off", "local", "websocket"].includes(storedWifiMode) ? storedWifiMode : "browser";
  if (wifiModeSelect.value === "local" && storageGet(wifiBrowserMigrationKey, "0") !== "1") {
    wifiModeSelect.value = "browser";
    storageSet(wifiModeStorageKey, "browser");
    storageSet(wifiBrowserMigrationKey, "1");
  }
  wifiBridgeUrlInput.value = storageGet(wifiBridgeUrlStorageKey, "ws://localhost:8767/pilas-wifi");
  mediaBridge.updateUi();
  wifiBridge.updateUi();
}

function setAdvancedOpen(open) {
  advancedContent.hidden = !open;
  advancedToggleBtn.setAttribute("aria-expanded", open ? "true" : "false");
}

function updateDeviceClass() {
  const coarsePointer = matchMedia("(pointer: coarse)").matches;
  const narrow = matchMedia("(max-width: 760px)").matches;
  const mobile = coarsePointer || narrow;
  document.body.classList.toggle("is-mobile", mobile);
  document.body.classList.toggle("is-desktop", !mobile);
}

async function toggleFullscreen() {
  try {
    if (!document.fullscreenElement && manualFullscreen) {
      manualFullscreen = false;
      syncFullscreenClass();
      return;
    }

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await stage.requestFullscreen({ navigationUI: "hide" });
  } catch (error) {
    console.warn(error);
    manualFullscreen = !manualFullscreen;
    syncFullscreenClass();
  }
}

function syncFullscreenClass() {
  const active = document.fullscreenElement === stage || manualFullscreen;
  document.body.classList.toggle("fullscreen-active", active);
  fullscreenBtn.textContent = active ? "Exit fullscreen" : "Fullscreen";
}

function loadKeyBindings() {
  const defaults = Object.fromEntries(controls.map((control) => [control.bit, control.code]));

  try {
    const saved = JSON.parse(localStorage.getItem(bindingsStorageKey) || "{}");
    for (const control of controls) {
      if (typeof saved[control.bit] === "string") defaults[control.bit] = saved[control.bit];
    }
  } catch {
  }

  return defaults;
}

function saveKeyBindings() {
  storageSet(bindingsStorageKey, JSON.stringify(keyBindings));
}

function buildKeyMap(bindings) {
  const map = new Map();
  for (const control of controls) {
    const code = bindings[control.bit];
    if (code) map.set(code, control.bit);
  }
  return map;
}

function keyCodeLabel(code) {
  const labels = {
    ArrowUp: "Up",
    ArrowDown: "Down",
    ArrowLeft: "Left",
    ArrowRight: "Right",
    Backspace: "Backspace",
    Enter: "Enter",
    Space: "Space",
  };
  if (labels[code]) return labels[code];
  if (code.startsWith("Key")) return code.slice(3);
  if (code.startsWith("Digit")) return code.slice(5);
  return code;
}

function renderBindingsPanel() {
  bindingsPanel.replaceChildren();

  const heading = document.createElement("div");
  heading.className = "panel-heading";
  heading.textContent = "Inputs";
  bindingsPanel.append(heading);

  for (const control of controls) {
    const row = document.createElement("div");
    row.className = "binding-row";

    const label = document.createElement("span");
    label.textContent = control.label;

    const button = document.createElement("button");
    button.type = "button";
    button.dataset.bindBit = String(control.bit);
    button.textContent = captureBindingBit === control.bit ? "Press a key" : keyCodeLabel(keyBindings[control.bit]);
    if (captureBindingBit === control.bit) button.classList.add("listening");

    row.append(label, button);
    bindingsPanel.append(row);
  }
}

function setKeyBinding(bit, code) {
  for (const control of controls) {
    if (Number(control.bit) !== Number(bit) && keyBindings[control.bit] === code) {
      keyBindings[control.bit] = control.code;
    }
  }

  keyBindings[bit] = code;
  keyMap = buildKeyMap(keyBindings);
  saveKeyBindings();
  renderBindingsPanel();
}

function resetKeyBindings() {
  keyBindings = Object.fromEntries(controls.map((control) => [control.bit, control.code]));
  keyMap = buildKeyMap(keyBindings);
  saveKeyBindings();
  renderBindingsPanel();
  setStatus("Inputs reset");
}

function isEditableTarget(target) {
  return target instanceof HTMLElement && !!target.closest("input, textarea, select");
}

function recreateCanvas() {
  const replacement = canvas.cloneNode(false);
  replacement.width = screenWidth;
  replacement.height = screenHeight * screenCount;
  replacement.id = "screenCanvas";
  replacement.tabIndex = 0;
  replacement.setAttribute("aria-label", "Nintendo DS video");
  canvas.replaceWith(replacement);
  canvas = replacement;
  attachCanvasEvents();
  return canvas;
}

function createRenderer(mode, targetCanvas) {
  if (mode === "webgl2") return new WebGL2Renderer(targetCanvas);
  if (mode === "webgpu") return new WebGPURenderer(targetCanvas);
  return new Canvas2DRenderer(targetCanvas);
}

async function setRenderer(mode, persist = true) {
  const requestedMode = rendererLabels.has(mode) ? mode : "canvas2d";

  try {
    videoRenderer?.destroy();
  } catch (error) {
    console.warn(error);
  }
  videoRenderer = null;

  try {
    const targetCanvas = recreateCanvas();
    const renderer = createRenderer(requestedMode, targetCanvas);
    if (renderer.init instanceof Function && renderer instanceof WebGPURenderer) {
      await renderer.init();
    }

    videoRenderer = renderer;
    videoRenderer.clear();
    rendererSelect.value = videoRenderer.mode;
    rendererValue.textContent = videoRenderer.label;
    if (persist) storageSet(rendererStorageKey, videoRenderer.mode);
    renderFrame();
  } catch (error) {
    console.warn(error);
    if (requestedMode !== "canvas2d") {
      setStatus(`${rendererLabels.get(requestedMode)} unavailable; using Canvas`);
      await setRenderer("canvas2d", true);
      return;
    }

    rendererValue.textContent = "error";
    setStatus("Renderer is unavailable");
  }
}

function getPreferredRendererMode() {
  const mode = storageGet(rendererStorageKey, "webgl2");
  return rendererLabels.has(mode) ? mode : "canvas2d";
}

function cString(ptr) {
  if (!ptr) return "";
  const heap = Module.HEAPU8;
  let end = ptr;
  while (heap[end] !== 0) end++;
  return decoder.decode(heap.subarray(ptr, end));
}

function allocBytes(bytes) {
  if (!bytes || bytes.length === 0) return 0;
  const ptr = Module._malloc(bytes.length);
  Module.HEAPU8.set(bytes, ptr);
  return ptr;
}

function allocString(value) {
  const bytes = encoder.encode(`${value}\0`);
  return allocBytes(bytes);
}

function freePtr(ptr) {
  if (ptr) Module._free(ptr);
}

function mkdir(path) {
  try {
    Module.FS.mkdir(path);
  } catch {
  }
}

function fileExists(path) {
  try {
    Module.FS.lookupPath(path);
    return true;
  } catch {
    return false;
  }
}

function readFile(path) {
  if (!fileExists(path)) return new Uint8Array();
  return Module.FS.readFile(path);
}

function fileSize(path) {
  if (!fileExists(path)) return 0;
  try {
    return Module.FS.stat(path).size || 0;
  } catch {
    return readFile(path).length;
  }
}

function formatBytes(bytes) {
  if (!bytes) return "Not stored";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value >= 10 || unit === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[unit]}`;
}

function syncfs(populate) {
  return new Promise((resolve, reject) => {
    Module.FS.syncfs(populate, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

async function initStorage() {
  mkdir(mountRoot);
  Module.FS.mount(Module.IDBFS, {}, mountRoot);
  await syncfs(true);
  mkdir(saveRoot);
  mkdir(stateRoot);
  mkdir(systemRoot);
  await syncfs(false);
}

async function configurePersistedSystemFiles() {
  applyStoredBioses();
  applyStoredDsiBioses();

  const firmware = readFile(firmwarePath);
  if (firmware.length > 0) {
    setFirmware(firmware);
  }

  const dsiFirmware = readFile(dsiFirmwarePath);
  if (dsiFirmware.length > 0) {
    setDsiFirmware(dsiFirmware);
  }

  if (fileExists(dsiNandPath)) {
    setDsiNandPath(dsiNandPath);
  }

  applyDsiStorageOptions(false);
  applyDldiStorageOptions(false);
  applyConsoleMode(false);
  applyBootOptions(false);
  updateStorageInfo();
}

function setBioses(bios9, bios7) {
  const p9 = allocBytes(bios9);
  const p7 = allocBytes(bios7);
  const ok = Module._pilas_set_bioses(instance, p9, bios9.length, p7, bios7.length);
  freePtr(p9);
  freePtr(p7);
  if (!ok) setStatus(cString(Module._pilas_last_error(instance)));
  return ok;
}

function applyStoredBioses() {
  const bios9 = readFile(bios9Path);
  const bios7 = readFile(bios7Path);
  if (bios9.length === systemFileDefs.bios9.size && bios7.length === systemFileDefs.bios7.size) {
    return setBioses(bios9, bios7);
  }
  return false;
}

function setFirmware(bytes) {
  const ptr = allocBytes(bytes);
  const ok = Module._pilas_set_firmware_image(instance, ptr, bytes.length);
  freePtr(ptr);
  if (!ok) setStatus(cString(Module._pilas_last_error(instance)));
  return ok;
}

function setDsiBioses(bios9, bios7) {
  const p9 = allocBytes(bios9);
  const p7 = allocBytes(bios7);
  const ok = Module._pilas_set_dsi_bioses(instance, p9, bios9.length, p7, bios7.length);
  freePtr(p9);
  freePtr(p7);
  if (!ok) setStatus(cString(Module._pilas_last_error(instance)));
  return ok;
}

function applyStoredDsiBioses() {
  const bios9 = readFile(dsiBios9Path);
  const bios7 = readFile(dsiBios7Path);
  if (bios9.length === systemFileDefs.dsiBios9.size && bios7.length === systemFileDefs.dsiBios7.size) {
    return setDsiBioses(bios9, bios7);
  }
  return false;
}

function setDsiFirmware(bytes) {
  const ptr = allocBytes(bytes);
  const ok = Module._pilas_set_dsi_firmware_image(instance, ptr, bytes.length);
  freePtr(ptr);
  if (!ok) setStatus(cString(Module._pilas_last_error(instance)));
  return ok;
}

function setDsiNandPath(path) {
  const ptr = allocString(path);
  const ok = Module._pilas_set_dsi_nand_path(instance, ptr);
  freePtr(ptr);
  if (!ok) setStatus(cString(Module._pilas_last_error(instance)));
  return ok;
}

function setDsiSdCard(enabled, path = dsiSdPath, sizeMb = Number(dsiSdSizeSelect.value) || 128, readOnly = false) {
  const ptr = allocString(path);
  const ok = Module._pilas_set_dsi_sd_card(instance, enabled ? 1 : 0, ptr, sizeMb, readOnly ? 1 : 0);
  freePtr(ptr);
  if (!ok) setStatus(cString(Module._pilas_last_error(instance)));
  return ok;
}

function setDldiSdCard(enabled, path = dldiSdPath, sizeMb = Number(dldiSdSizeSelect.value) || 128, readOnly = false) {
  const ptr = allocString(path);
  const ok = Module._pilas_set_dldi_sd_card(instance, enabled ? 1 : 0, ptr, sizeMb, readOnly ? 1 : 0);
  freePtr(ptr);
  if (!ok) setStatus(cString(Module._pilas_last_error(instance)));
  return ok;
}

function updateStorageInfo() {
  if (!Module) return;

  const nandSize = fileSize(dsiNandPath);
  const sdSize = fileSize(dsiSdPath);
  const dldiSize = fileSize(dldiSdPath);
  const sdEnabled = dsiSdEnableInput.checked;
  const dldiEnabled = dldiSdEnableInput.checked;
  const sdSetting = storageGet(dsiSdAutoStorageKey, "0") === "1" ? "uploaded image" : `${dsiSdSizeSelect.value} MB virtual image`;
  const dldiSetting = storageGet(dldiSdAutoStorageKey, "0") === "1" ? "uploaded image" : `${dldiSdSizeSelect.value} MB virtual image`;

  nandInfoValue.textContent = nandSize
    ? `Stored in browser - ${formatBytes(nandSize)}`
    : "Not stored in browser";
  sdInfoValue.textContent = sdSize
    ? `Stored in browser - ${formatBytes(sdSize)}${sdEnabled ? "" : " - disabled"}`
    : `${sdEnabled ? "Will be created on boot" : "Disabled"} - ${sdSetting}`;
  dldiSdInfoValue.textContent = dldiSize
    ? `Stored in browser - ${formatBytes(dldiSize)}${dldiEnabled ? "" : " - disabled"}`
    : `${dldiEnabled ? "Will be created when homebrew needs FAT" : "Disabled"} - ${dldiSetting}`;

  dsiNandDownloadBtn.disabled = !nandSize;
  dsiSdDownloadBtn.disabled = !sdSize;
  dldiSdDownloadBtn.disabled = !dldiSize;
}

function downloadBytes(bytes, filename) {
  const blob = new Blob([bytes], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function downloadStorageImage(kind) {
  try {
    await syncStorageSnapshot();
    const path = kind === "nand" ? dsiNandPath : (kind === "dldi" ? dldiSdPath : dsiSdPath);
    const label = kind === "nand" ? "NAND" : (kind === "dldi" ? "DLDI SD image" : "SD image");
    const filename = kind === "nand" ? "pilas-dsi-internal.nand" : (kind === "dldi" ? "pilas-dldi-sd.img" : "pilas-dsi-sd.img");
    const bytes = readFile(path);
    if (!bytes.length) throw new Error(`${label} is not stored in the browser yet`);
    downloadBytes(bytes, filename);
    setStatus(`${label} exported`);
  } catch (error) {
    console.error(error);
    setStatus(error.message);
  }
}

function ciaCommonKeyBytes() {
  const raw = ciaCommonKeyInput.value.trim();
  if (!raw) return new Uint8Array();

  const hex = raw.replace(/[\s:-]/g, "");
  if (!/^[0-9a-fA-F]{32}$/.test(hex)) {
    throw new Error("CIA common key must be 32 hex characters");
  }

  const bytes = new Uint8Array(16);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

async function installCiaFile(file) {
  if (!Module || !instance || !file) return;

  const wasPaused = paused;
  const shouldRebootMenu = romLoaded && stateStem === "dsi-firmware-menu";
  let consoleWasClosed = false;
  try {
    await flushSaves(true);
    paused = true;
    pauseBtn.textContent = "Resume";
    setStatus("Installing DSiWare");

    const target = dsiwareInstallTargetSelect.value === "sd" ? "sd" : "nand";
    if (target === "sd" && !dsiSdEnableInput.checked) {
      dsiSdEnableInput.checked = true;
      applyDsiStorageOptions();
    } else {
      applyDsiStorageOptions(false);
    }

    const ciaBytes = new Uint8Array(await file.arrayBuffer());
    const keyBytes = ciaCommonKeyBytes();
    const ciaPtr = allocBytes(ciaBytes);
    const keyPtr = keyBytes.length ? allocBytes(keyBytes) : 0;
    let ok = 0;
    try {
      ok = Module._pilas_install_dsiware_cia(
        instance,
        ciaPtr,
        ciaBytes.length,
        target === "sd" ? 1 : 0,
        keyPtr,
        keyBytes.length,
      );
    } finally {
      freePtr(ciaPtr);
      freePtr(keyPtr);
    }

    if (!ok) {
      throw new Error(cString(Module._pilas_last_error(instance)) || "Failed to install CIA");
    }

    await syncfs(false);
    updateStorageInfo();
    consoleWasClosed = true;
    if (target === "sd") {
      setStatus("DSiWare installed to virtual SD image");
    } else {
      setStatus("DSiWare installed to NAND");
    }

    if (shouldRebootMenu) {
      await bootFirmwareMenu();
      return;
    }

    romLoaded = false;
    savePath = "";
    saveDirty = false;
    firmwareDirty = false;
    pauseBtn.disabled = true;
    resetBtn.disabled = true;
    pauseBtn.textContent = "Pause";
    saveValue.textContent = "-";
  } catch (error) {
    console.error(error);
    setStatus(error.message || "Failed to install CIA");
  } finally {
    ciaInput.value = "";
    if (!shouldRebootMenu && !consoleWasClosed) {
      paused = wasPaused;
      pauseBtn.textContent = romLoaded && paused ? "Resume" : "Pause";
      if (!paused) {
        emulationAccumulator = 0;
        lastTickTime = performance.now();
      }
    }
  }
}

function applyConsoleMode(persist = true) {
  if (!Module || !instance) return;
  const mode = consoleModeSelect.value === "dsi" ? "dsi" : "nds";
  const dspHle = dsiDspHleInput.checked;
  Module._pilas_set_console_mode(instance, mode === "dsi" ? 1 : 0, dspHle ? 1 : 0);
  coreValue.textContent = mode === "dsi" ? "WASM DSi" : "WASM";
  if (persist) {
    storageSet(consoleModeStorageKey, mode);
    storageSet(dsiDspHleStorageKey, dspHle ? "1" : "0");
  }
}

function applyBootOptions(persist = true) {
  if (!Module || !instance) return;
  const directBoot = bootModeSelect.value !== "firmware";
  Module._pilas_set_direct_boot(instance, directBoot ? 1 : 0);
  if (persist) storageSet(bootModeStorageKey, directBoot ? "direct" : "firmware");
}

function applyDsiStorageOptions(persist = true) {
  if (!Module || !instance) return;
  const enabled = dsiSdEnableInput.checked;
  const size = Number(dsiSdSizeSelect.value) || 128;
  const autoSize = storageGet(dsiSdAutoStorageKey, "0") === "1";
  setDsiSdCard(enabled, dsiSdPath, autoSize ? 0 : size, false);
  if (persist) {
    storageSet(dsiSdEnableStorageKey, enabled ? "1" : "0");
    storageSet(dsiSdSizeStorageKey, String(size));
  }
  updateStorageInfo();
}

function applyDldiStorageOptions(persist = true) {
  if (!Module || !instance) return;
  const enabled = dldiSdEnableInput.checked;
  const size = Number(dldiSdSizeSelect.value) || 128;
  const autoSize = storageGet(dldiSdAutoStorageKey, "0") === "1";
  setDldiSdCard(enabled, dldiSdPath, autoSize ? 0 : size, false);
  if (persist) {
    storageSet(dldiSdEnableStorageKey, enabled ? "1" : "0");
    storageSet(dldiSdSizeStorageKey, String(size));
  }
  updateStorageInfo();
}

function validateSystemFile(key, bytes) {
  const def = systemFileDefs[key];
  if (!def) throw new Error(`Unknown file: ${key}`);
  if (!bytes?.length) throw new Error(`${def.label} is empty`);
  if (def.size && bytes.length !== def.size) {
    throw new Error(`${def.label} must be ${def.size} bytes`);
  }
}

async function saveSystemBytes(key, bytes, options = {}) {
  const { sync = true, status = true } = options;
  const def = systemFileDefs[key];
  validateSystemFile(key, bytes);

  Module.FS.writeFile(def.path, bytes);
  if (key === "firmware") setFirmware(bytes);
  else if (key === "dsiFirmware") setDsiFirmware(bytes);
  else if (key === "dsiNand") setDsiNandPath(def.path);
  else if (key === "dsiSd") {
    dsiSdEnableInput.checked = true;
    storageSet(dsiSdAutoStorageKey, "1");
    setDsiSdCard(true, dsiSdPath, 0, false);
  }
  else if (key === "dldiSd") {
    dldiSdEnableInput.checked = true;
    storageSet(dldiSdAutoStorageKey, "1");
    setDldiSdCard(true, dldiSdPath, 0, false);
  }
  else if (key === "dsiBios9" || key === "dsiBios7") applyStoredDsiBioses();
  else applyStoredBioses();

  if (sync) await syncfs(false);
  updateStorageInfo();
  if (status) setStatus(`${def.label} saved`);
}

function manifestPathValue(manifest, path) {
  let cursor = manifest;
  for (const part of path) {
    if (!cursor || typeof cursor !== "object") return undefined;
    cursor = cursor[part];
  }
  return cursor;
}

function manifestEntry(manifest, key) {
  const dsiAliases = dsiManifestAliases[key] || [];
  const pathAliases = manifestPathAliases[key] || [];
  const candidates = [
    ...pathAliases.map((path) => manifestPathValue(manifest, path)),
    manifest?.[key],
    manifest?.bios?.[key],
    manifest?.system?.[key],
    manifest?.files?.[key],
    manifest?.dsi?.[key],
    ...dsiAliases.map((alias) => manifest?.dsi?.[alias]),
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string") return candidate;
    if (candidate && typeof candidate === "object") {
      if (typeof candidate.url === "string") return candidate.url;
      if (typeof candidate.href === "string") return candidate.href;
      if (typeof candidate.link === "string") return candidate.link;
    }
  }

  return "";
}

async function fetchBytes(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return new Uint8Array(await response.arrayBuffer());
}

async function applySystemManifest(manifest, baseUrl = location.href) {
  if (!Module) return [];

  const loaded = [];
  for (const key of Object.keys(systemFileDefs)) {
    const link = manifestEntry(manifest, key);
    if (!link) continue;

    const url = new URL(link, baseUrl).href;
    setStatus(`Downloading ${systemFileDefs[key].label}`);
    const bytes = await fetchBytes(url);
    await saveSystemBytes(key, bytes, { sync: false, status: false });
    loaded.push(systemFileDefs[key].label);
  }

  if (loaded.length === 0) throw new Error("Manifest has no recognized system files");
  await syncfs(false);
  setStatus(`System files saved: ${loaded.join(", ")}`);
  return loaded;
}

async function loadSystemManifestText(text, baseUrl = location.href) {
  const manifest = JSON.parse(text);
  return applySystemManifest(manifest, baseUrl);
}

async function loadSystemManifestUrl(value) {
  const url = new URL(value, location.href);
  setStatus("Downloading manifest");
  const response = await fetch(url.href);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  const manifest = await response.json();
  return applySystemManifest(manifest, url.href);
}

async function autoloadSystemManifestFromQuery() {
  const params = new URL(location.href).searchParams;
  const manifestParam = params.get("manifest") || params.get("system");
  if (!manifestParam) return;

  try {
    await loadSystemManifestUrl(manifestParam);
  } catch (error) {
    console.error(error);
    setStatus("Manifest failed");
  }
}

async function bootCore() {
  try {
    const coreUrl = new URL("../pilas-melonds-core.js", import.meta.url).href;
    const factory = (await import(coreUrl)).default;
    Module = await factory({
      locateFile: (path) => new URL(`../${path}`, import.meta.url).href,
      print: (text) => console.log(text),
      printErr: (text) => console.warn(text),
    });

    await initStorage();
    instance = Module._pilas_create(48000);
    await configurePersistedSystemFiles();
    await autoloadSystemManifestFromQuery();
    applyConsoleMode(false);

    coreValue.textContent = "WASM";
    applyConsoleMode(false);
    setStatus("Ready");
    romInput.disabled = false;
    ciaInput.disabled = false;
    bootMenuBtn.disabled = false;
    audioBtn.disabled = false;
    wifiBridge.autoStart();
    startLoop();
    await autoloadRomFromQuery();
  } catch (error) {
    coreValue.textContent = "missing";
    setStatus("WASM core not found");
    console.error(error);
  }
}

async function hashRom(bytes, name) {
  if (crypto?.subtle) {
    const digest = await crypto.subtle.digest("SHA-1", bytes);
    const view = new Uint8Array(digest);
    return [...view].map((x) => x.toString(16).padStart(2, "0")).join("").slice(0, 16);
  }

  let hash = 2166136261;
  for (let i = 0; i < bytes.length; i++) {
    hash ^= bytes[i];
    hash = Math.imul(hash, 16777619);
  }
  return `${name.length.toString(16)}${(hash >>> 0).toString(16)}`;
}

function safeName(name) {
  return name.replace(/\.[^.]+$/, "").replace(/[^a-z0-9_-]+/gi, "_").slice(0, 48) || "game";
}

function statePath(slot) {
  return `${stateRoot}/${stateStem}-slot${slot}.pilasav`;
}

function stateMetaPath(slot) {
  return `${stateRoot}/${stateStem}-slot${slot}.json`;
}

function stateFileName() {
  return `${stateStem || "pilas-state"}.pilasav`;
}

function readStateMeta(slot) {
  try {
    const bytes = readFile(stateMetaPath(slot));
    if (!bytes.length) return null;
    return JSON.parse(decoder.decode(bytes));
  } catch {
    return null;
  }
}

function writeStateMeta(slot, meta) {
  Module.FS.writeFile(stateMetaPath(slot), encoder.encode(JSON.stringify(meta, null, 2)));
}

function stateSlotInfo(slot) {
  const path = statePath(slot);
  const exists = fileExists(path);
  const meta = exists ? readStateMeta(slot) : null;
  return {
    slot,
    exists,
    path,
    size: exists ? fileSize(path) : 0,
    createdAt: meta?.createdAt || "",
    romName: meta?.romName || "",
  };
}

function createSavestateBytes() {
  if (!Module || !instance || !romLoaded) throw new Error("Carregue uma ROM primeiro");
  if (!Module._pilas_save_state(instance)) {
    throw new Error(cString(Module._pilas_last_error(instance)) || "Failed to save state");
  }

  const ptr = Module._pilas_get_state_ptr(instance);
  const len = Module._pilas_get_state_length(instance);
  if (!ptr || len <= 0) throw new Error("Save state is empty");
  return Uint8Array.from(Module.HEAPU8.subarray(ptr, ptr + len));
}

function loadSavestateBytes(bytes) {
  if (!Module || !instance || !romLoaded) throw new Error("Carregue uma ROM primeiro");
  if (!bytes?.length) throw new Error("Save state file is empty");

  const ptr = allocBytes(bytes);
  const ok = Module._pilas_load_state(instance, ptr, bytes.length);
  freePtr(ptr);

  if (!ok) throw new Error(cString(Module._pilas_last_error(instance)) || "Failed to load state");

  emulationAccumulator = 0;
  lastTickTime = performance.now();
  renderFrame();
}

async function saveStateToFile() {
  try {
    const bytes = createSavestateBytes();
    const blob = new Blob([bytes], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = stateFileName();
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatus("Save state exported");
  } catch (error) {
    console.error(error);
    setStatus(error.message);
  }
}

async function loadStateFile(file) {
  if (!file) return;
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    loadSavestateBytes(bytes);
    setStatus("Save state loaded");
  } catch (error) {
    console.error(error);
    setStatus(error.message);
  } finally {
    stateFileInput.value = "";
  }
}

async function saveBrowserState(slot) {
  try {
    const bytes = createSavestateBytes();
    Module.FS.writeFile(statePath(slot), bytes);
    writeStateMeta(slot, {
      slot,
      romName: romDisplayName,
      createdAt: new Date().toISOString(),
      size: bytes.length,
    });
    await syncfs(false);
    setStatus(`State saved to slot ${slot}`);
    hideStateModal();
  } catch (error) {
    console.error(error);
    setStatus(error.message);
  }
}

async function loadBrowserState(slot) {
  try {
    const bytes = readFile(statePath(slot));
    loadSavestateBytes(bytes);
    setStatus(`State loaded from slot ${slot}`);
    hideStateModal();
  } catch (error) {
    console.error(error);
    setStatus(error.message);
  }
}

function formatStateSlot(info) {
  if (!info.exists) return "Empty";
  const date = info.createdAt ? new Date(info.createdAt).toLocaleString() : "No date";
  const sizeMb = info.size ? `${(info.size / (1024 * 1024)).toFixed(1)} MB` : "";
  return `${date}${sizeMb ? ` - ${sizeMb}` : ""}`;
}

function showStateModal(mode) {
  stateModalMode = mode;
  stateModalTitle.textContent = mode === "save" ? "Save to browser" : "Load from browser";
  renderStateSlots();
  stateModal.hidden = false;
}

function hideStateModal() {
  stateModal.hidden = true;
}

function renderStateSlots() {
  stateSlotList.replaceChildren();
  for (let slot = 1; slot <= browserStateSlots; slot++) {
    const info = stateSlotInfo(slot);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "slot-button";
    button.dataset.slot = String(slot);
    button.disabled = stateModalMode === "load" && !info.exists;

    const main = document.createElement("span");
    main.textContent = `Slot ${slot}`;
    const detail = document.createElement("small");
    detail.textContent = formatStateSlot(info);
    button.append(main, detail);
    stateSlotList.append(button);
  }
}

async function loadRom(file) {
  if (!Module || !instance || !file) return;

  const romBytes = new Uint8Array(await file.arrayBuffer());
  await loadRomBytes(romBytes, file.name);
}

async function loadRomBytes(romBytes, romName = "game.nds") {
  if (!Module || !instance || !romBytes?.length) return;

  await flushSaves(true);
  applyConsoleMode();
  applyBootOptions();
  applyDsiStorageOptions(false);
  applyDldiStorageOptions(false);
  setStatus("Loading ROM");
  const romHash = await hashRom(romBytes, romName);
  savePath = `${saveRoot}/${safeName(romName)}-${romHash}.sav`;
  stateStem = `${safeName(romName)}-${romHash}`;
  romDisplayName = romName;
  const saveBytes = readFile(savePath);

  const romPtr = allocBytes(romBytes);
  const savePtr = allocBytes(saveBytes);
  const namePtr = allocString(romName);
  const ok = Module._pilas_load_rom(instance, romPtr, romBytes.length, savePtr, saveBytes.length, namePtr);
  freePtr(romPtr);
  freePtr(savePtr);
  freePtr(namePtr);

  if (!ok) {
    setStatus(cString(Module._pilas_last_error(instance)) || "Failed to load ROM");
    return;
  }

  romLoaded = true;
  paused = false;
  emulationAccumulator = 0;
  lastTickTime = performance.now();
  lastFpsTime = lastTickTime;
  framesSinceFps = 0;
  saveDirty = false;
  pauseBtn.disabled = false;
  resetBtn.disabled = false;
  pauseBtn.textContent = "Pause";
  saveValue.textContent = saveBytes.length ? "ok" : "new";
  canvas.focus();
  setRtcFromHost();
  renderFrame();
  audio.startPreferred();
  wifiBridge.autoStart();
  setStatus(romName);
}

async function bootFirmwareMenu() {
  if (!Module || !instance) return;

  try {
    await flushSaves(true);
    applyConsoleMode();
    applyBootOptions();
    applyDsiStorageOptions(false);
    applyDldiStorageOptions(false);
    setStatus("Starting menu");

    const ok = Module._pilas_boot_firmware(instance);
    if (!ok) throw new Error(cString(Module._pilas_last_error(instance)) || "Failed to start firmware");

    romLoaded = true;
    paused = false;
    savePath = "";
    const mode = consoleModeSelect.value === "dsi" ? "dsi" : "ds";
    stateStem = `${mode}-firmware-menu`;
    romDisplayName = mode === "dsi" ? "DSi firmware menu" : "DS firmware menu";
    emulationAccumulator = 0;
    lastTickTime = performance.now();
    lastFpsTime = lastTickTime;
    framesSinceFps = 0;
    saveDirty = false;
    pauseBtn.disabled = false;
    resetBtn.disabled = false;
    pauseBtn.textContent = "Pause";
    saveValue.textContent = "menu";
    setRtcFromHost();
    renderFrame();
    audio.startPreferred();
    wifiBridge.autoStart();
    setStatus(romDisplayName);
  } catch (error) {
    console.error(error);
    setStatus(error.message);
  }
}

async function autoloadRomFromQuery() {
  const romParam = new URL(location.href).searchParams.get("rom");
  if (!romParam) return;

  try {
    const romUrl = new URL(romParam, location.href);
    if (romUrl.origin !== location.origin) {
      throw new Error("ROM URL must use the same origin as the app");
    }

    setStatus("Downloading test ROM");
    const response = await fetch(romUrl);
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    const bytes = new Uint8Array(await response.arrayBuffer());
    const fallbackName = romUrl.pathname.split("/").pop() || "autoload.nds";
    await loadRomBytes(bytes, decodeURIComponent(fallbackName));
  } catch (error) {
    console.error(error);
    setStatus("ROM autoload failed");
  }
}

function setRtcFromHost() {
  if (!Module || !instance) return;
  const now = new Date();
  Module._pilas_set_rtc(
    instance,
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate(),
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
  );
}

function renderFrame() {
  if (!Module || !instance || !videoRenderer) return;
  const ptr = Module._pilas_get_framebuffer_ptr(instance);
  const size = Module._pilas_get_framebuffer_size(instance);
  if (!ptr || size < frameBytes) return;
  videoRenderer.draw(Module.HEAPU8, ptr);
}

function combinedMask() {
  return keyboardMask & padMask & touchButtonMask;
}

function applyInputMask() {
  if (!Module || !instance) return;
  Module._pilas_set_key_mask(instance, combinedMask());
}

function setMaskBit(source, bit, pressed) {
  const clear = ~(1 << bit);
  if (source === "keyboard") keyboardMask = pressed ? (keyboardMask & clear) : (keyboardMask | (1 << bit));
  if (source === "touch") touchButtonMask = pressed ? (touchButtonMask & clear) : (touchButtonMask | (1 << bit));
  applyInputMask();
}

function pollGamepad() {
  const pads = navigator.getGamepads ? navigator.getGamepads() : [];
  const pad = [...pads].find(Boolean);
  if (!pad) {
    padMask = 0xFFF;
    applyInputMask();
    return;
  }

  let mask = 0xFFF;
  const press = (bit) => { mask &= ~(1 << bit); };
  if (pad.buttons[1]?.pressed) press(0);
  if (pad.buttons[0]?.pressed) press(1);
  if (pad.buttons[8]?.pressed) press(2);
  if (pad.buttons[9]?.pressed) press(3);
  if (pad.buttons[15]?.pressed || pad.axes[0] > 0.5) press(4);
  if (pad.buttons[14]?.pressed || pad.axes[0] < -0.5) press(5);
  if (pad.buttons[12]?.pressed || pad.axes[1] < -0.5) press(6);
  if (pad.buttons[13]?.pressed || pad.axes[1] > 0.5) press(7);
  if (pad.buttons[5]?.pressed) press(8);
  if (pad.buttons[4]?.pressed) press(9);
  if (pad.buttons[3]?.pressed) press(10);
  if (pad.buttons[2]?.pressed) press(11);
  padMask = mask;
  applyInputMask();
}

function setTouchFromPointer(event, active) {
  if (!Module || !instance) return;
  if (!active) {
    Module._pilas_set_touch(instance, 0, 0, 0);
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((event.clientX - rect.left) * (screenWidth / rect.width));
  const y = Math.floor((event.clientY - rect.top) * ((screenHeight * screenCount) / rect.height));

  if (x < 0 || x >= screenWidth || y < screenHeight || y >= screenHeight * screenCount) {
    Module._pilas_set_touch(instance, 0, 0, 0);
    return;
  }

  Module._pilas_set_touch(instance, x, y - screenHeight, 1);
}

async function flushSaves(force = false) {
  if (!Module || !instance || syncInFlight) return;
  if (!romLoaded) {
    if (force) await syncStorageSnapshot();
    return;
  }

  if (Module._pilas_take_nds_save_dirty(instance)) saveDirty = true;
  if (Module._pilas_take_firmware_dirty(instance)) firmwareDirty = true;
  if (!force && !saveDirty && !firmwareDirty) return;

  syncInFlight = true;
  try {
    if (saveDirty && savePath) {
      const ptr = Module._pilas_get_nds_save_ptr(instance);
      const len = Module._pilas_get_nds_save_length(instance);
      if (ptr && len > 0) {
        const bytes = Uint8Array.from(Module.HEAPU8.subarray(ptr, ptr + len));
        Module.FS.writeFile(savePath, bytes);
        saveValue.textContent = "sync";
      }
      saveDirty = false;
    }

    if (firmwareDirty) {
      const ptr = Module._pilas_get_firmware_ptr(instance);
      const len = Module._pilas_get_firmware_length(instance);
      if (ptr && len > 0) {
        const bytes = Uint8Array.from(Module.HEAPU8.subarray(ptr, ptr + len));
        const targetFirmwarePath = consoleModeSelect.value === "dsi" && fileExists(dsiFirmwarePath)
          ? dsiFirmwarePath
          : firmwarePath;
        Module.FS.writeFile(targetFirmwarePath, bytes);
      }
      firmwareDirty = false;
    }

    await syncfs(false);
    updateStorageInfo();
    saveValue.textContent = "ok";
  } catch (error) {
    saveValue.textContent = "error";
    console.error(error);
  } finally {
    syncInFlight = false;
  }
}

async function syncStorageSnapshot() {
  if (!Module || syncInFlight) return;
  syncInFlight = true;
  try {
    await syncfs(false);
    updateStorageInfo();
  } catch (error) {
    console.error(error);
  } finally {
    syncInFlight = false;
  }
}

function startLoop() {
  if (loopStarted) return;
  loopStarted = true;
  requestAnimationFrame(tick);
}

function tick(now) {
  if (romLoaded && !paused) {
    pollGamepad();

    const elapsed = Math.min(now - lastTickTime, 250);
    lastTickTime = now;
    emulationAccumulator += elapsed;

    let framesThisTick = 0;
    while (emulationAccumulator >= frameIntervalMs && framesThisTick < maxFramesPerTick) {
      Module._pilas_run_frame(instance);
      audio.pump();
      wifiBridge.pump();
      emulationAccumulator -= frameIntervalMs;
      framesThisTick++;
    }

    if (framesThisTick > 0) {
      renderFrame();
      framesSinceFps += framesThisTick;
    }

    if (now - lastSavePollTime >= savePollIntervalMs) {
      flushSaves(false);
      lastSavePollTime = now;
    }

    if (now - lastStorageSyncTime >= storageSyncIntervalMs) {
      syncStorageSnapshot();
      lastStorageSyncTime = now;
    }

    if (now - lastFpsTime >= 1000) {
      const measuredFps = (framesSinceFps * 1000) / (now - lastFpsTime);
      fpsValue.textContent = Math.round(measuredFps).toString();
      speedValue.textContent = `${Math.round((measuredFps / ndsFrameRate) * 100)}%`;
      framesSinceFps = 0;
      lastFpsTime = now;
    }

    if (now - lastRtcUpdate > 1000) {
      setRtcFromHost();
      lastRtcUpdate = now;
    }

    if (now - lastCameraPollTime > 500) {
      mediaBridge.pollCore();
      lastCameraPollTime = now;
    }
  } else {
    lastTickTime = now;
    emulationAccumulator = 0;
  }

  requestAnimationFrame(tick);
}

romInput.addEventListener("change", () => loadRom(romInput.files[0]));

ciaInput.addEventListener("change", () => {
  installCiaFile(ciaInput.files[0]);
});

bootMenuBtn.addEventListener("click", () => {
  bootFirmwareMenu();
});

pauseBtn.addEventListener("click", async () => {
  paused = !paused;
  pauseBtn.textContent = paused ? "Resume" : "Pause";
  if (paused) await flushSaves(true);
  else {
    emulationAccumulator = 0;
    lastTickTime = performance.now();
    canvas.focus();
  }
});

resetBtn.addEventListener("click", () => {
  if (!Module || !instance) return;
  if (!Module._pilas_reset(instance)) {
    setStatus(cString(Module._pilas_last_error(instance)) || "Reset failed");
    return;
  }
  paused = false;
  emulationAccumulator = 0;
  lastTickTime = performance.now();
  framesSinceFps = 0;
  lastFpsTime = lastTickTime;
  pauseBtn.textContent = "Pause";
  setRtcFromHost();
  canvas.focus();
});

audioBtn.addEventListener("click", () => audio.toggle());

fullscreenBtn.addEventListener("click", () => {
  toggleFullscreen();
});

fullscreenExitBtn.addEventListener("click", () => {
  toggleFullscreen();
});

bios9Input.addEventListener("change", async () => {
  const file = bios9Input.files[0];
  if (!file || !Module) return;
  const bytes = new Uint8Array(await file.arrayBuffer());
  try {
    await saveSystemBytes("bios9", bytes);
  } catch (error) {
    console.error(error);
    setStatus(error.message);
  }
});

bios7Input.addEventListener("change", async () => {
  const file = bios7Input.files[0];
  if (!file || !Module) return;
  const bytes = new Uint8Array(await file.arrayBuffer());
  try {
    await saveSystemBytes("bios7", bytes);
  } catch (error) {
    console.error(error);
    setStatus(error.message);
  }
});

firmwareInput.addEventListener("change", async () => {
  const file = firmwareInput.files[0];
  if (!file || !Module) return;
  const bytes = new Uint8Array(await file.arrayBuffer());
  try {
    await saveSystemBytes("firmware", bytes);
  } catch (error) {
    console.error(error);
    setStatus(error.message);
  }
});

dsiBios9Input.addEventListener("change", async () => {
  const file = dsiBios9Input.files[0];
  if (!file || !Module) return;
  const bytes = new Uint8Array(await file.arrayBuffer());
  try {
    await saveSystemBytes("dsiBios9", bytes);
  } catch (error) {
    console.error(error);
    setStatus(error.message);
  }
});

dsiBios7Input.addEventListener("change", async () => {
  const file = dsiBios7Input.files[0];
  if (!file || !Module) return;
  const bytes = new Uint8Array(await file.arrayBuffer());
  try {
    await saveSystemBytes("dsiBios7", bytes);
  } catch (error) {
    console.error(error);
    setStatus(error.message);
  }
});

dsiFirmwareInput.addEventListener("change", async () => {
  const file = dsiFirmwareInput.files[0];
  if (!file || !Module) return;
  const bytes = new Uint8Array(await file.arrayBuffer());
  try {
    await saveSystemBytes("dsiFirmware", bytes);
  } catch (error) {
    console.error(error);
    setStatus(error.message);
  }
});

dsiNandInput.addEventListener("change", async () => {
  const file = dsiNandInput.files[0];
  if (!file || !Module) return;
  const bytes = new Uint8Array(await file.arrayBuffer());
  try {
    await saveSystemBytes("dsiNand", bytes);
  } catch (error) {
    console.error(error);
    setStatus(error.message);
  }
});

dsiSdInput.addEventListener("change", async () => {
  const file = dsiSdInput.files[0];
  if (!file || !Module) return;
  const bytes = new Uint8Array(await file.arrayBuffer());
  try {
    await saveSystemBytes("dsiSd", bytes);
  } catch (error) {
    console.error(error);
    setStatus(error.message);
  }
});

dldiSdInput.addEventListener("change", async () => {
  const file = dldiSdInput.files[0];
  if (!file || !Module) return;
  const bytes = new Uint8Array(await file.arrayBuffer());
  try {
    await saveSystemBytes("dldiSd", bytes);
  } catch (error) {
    console.error(error);
    setStatus(error.message);
  }
});

dsiNandDownloadBtn.addEventListener("click", () => {
  downloadStorageImage("nand");
});

dsiSdDownloadBtn.addEventListener("click", () => {
  downloadStorageImage("sd");
});

dldiSdDownloadBtn.addEventListener("click", () => {
  downloadStorageImage("dldi");
});

manifestInput.addEventListener("change", async () => {
  const file = manifestInput.files[0];
  if (!file || !Module) return;

  try {
    await loadSystemManifestText(await file.text(), location.href);
  } catch (error) {
    console.error(error);
    setStatus(error.message || "Manifest failed");
  }
});

manifestLoadBtn.addEventListener("click", async () => {
  if (!manifestUrlInput.value.trim() || !Module) return;

  try {
    await loadSystemManifestUrl(manifestUrlInput.value.trim());
  } catch (error) {
    console.error(error);
    setStatus(error.message || "Manifest failed");
  }
});

rendererSelect.addEventListener("change", async () => {
  await setRenderer(rendererSelect.value);
});

consoleModeSelect.addEventListener("change", () => {
  applyConsoleMode();
  setStatus(consoleModeSelect.value === "dsi" ? "DSi mode selected" : "DS mode selected");
});

dsiDspHleInput.addEventListener("change", () => {
  applyConsoleMode();
});

bootModeSelect.addEventListener("change", () => {
  applyBootOptions();
  setStatus(bootModeSelect.value === "firmware" ? "Firmware menu boot selected" : "Direct boot selected");
});

dsiSdEnableInput.addEventListener("change", () => {
  applyDsiStorageOptions();
});

dsiSdSizeSelect.addEventListener("change", () => {
  storageSet(dsiSdAutoStorageKey, "0");
  applyDsiStorageOptions();
});

dsiwareInstallTargetSelect.addEventListener("change", () => {
  storageSet(dsiwareInstallTargetStorageKey, dsiwareInstallTargetSelect.value === "sd" ? "sd" : "nand");
});

dldiSdEnableInput.addEventListener("change", () => {
  applyDldiStorageOptions();
});

dldiSdSizeSelect.addEventListener("change", () => {
  storageSet(dldiSdAutoStorageKey, "0");
  applyDldiStorageOptions();
});

accentSelect.addEventListener("change", () => {
  applyAccent(accentSelect.value);
});

canvasSizeSelect.addEventListener("change", () => {
  applyCanvasSize(canvasSizeSelect.value);
});

advancedToggleBtn.addEventListener("click", () => {
  setAdvancedOpen(advancedContent.hidden);
});

stateSaveFileBtn.addEventListener("click", () => {
  saveStateToFile();
});

stateFileInput.addEventListener("change", () => {
  loadStateFile(stateFileInput.files[0]);
});

stateSaveBrowserBtn.addEventListener("click", () => {
  showStateModal("save");
});

stateLoadBrowserBtn.addEventListener("click", () => {
  showStateModal("load");
});

stateModalCloseBtn.addEventListener("click", hideStateModal);

stateModal.addEventListener("click", (event) => {
  if (event.target === stateModal) hideStateModal();
});

stateSlotList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-slot]");
  if (!button || button.disabled) return;
  const slot = Number(button.dataset.slot);
  if (stateModalMode === "save") saveBrowserState(slot);
  else loadBrowserState(slot);
});

bindingsPanel.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-bind-bit]");
  if (!button) return;
  captureBindingBit = Number(button.dataset.bindBit);
  renderBindingsPanel();
});

resetBindingsBtn.addEventListener("click", resetKeyBindings);

cameraEnableBtn.addEventListener("click", async () => {
  try {
    await mediaBridge.toggleCamera();
  } catch (error) {
    console.error(error);
    setStatus("Failed to enable camera");
  }
});

micEnableBtn.addEventListener("click", async () => {
  try {
    await mediaBridge.toggleMic();
  } catch (error) {
    console.error(error);
    setStatus("Failed to enable microphone");
  }
});

wifiBridgeBtn.addEventListener("click", () => {
  wifiBridge.toggle();
});

wifiModeSelect.addEventListener("change", () => {
  storageSet(wifiModeStorageKey, wifiModeSelect.value);
  wifiBridge.disconnect();
  wifiBridge.updateUi();
  wifiBridge.autoStart();
});

window.addEventListener("pointerdown", () => {
  audio.startPreferred();
}, { passive: true });

window.addEventListener("touchstart", () => {
  audio.startPreferred();
}, { passive: true });

window.addEventListener("click", () => {
  audio.startPreferred();
}, { passive: true });

window.addEventListener("resize", updateDeviceClass);

document.addEventListener("fullscreenchange", syncFullscreenClass);

window.addEventListener("keydown", (event) => {
  if (event.code === "Escape" && !stateModal.hidden) {
    hideStateModal();
    return;
  }

  if (captureBindingBit !== null) {
    event.preventDefault();
    if (event.code !== "Escape") setKeyBinding(captureBindingBit, event.code);
    captureBindingBit = null;
    renderBindingsPanel();
    return;
  }

  if (isEditableTarget(event.target)) return;

  const bit = keyMap.get(event.code);
  if (bit === undefined) return;
  event.preventDefault();
  if (!event.repeat) setMaskBit("keyboard", bit, true);
});

window.addEventListener("keyup", (event) => {
  if (isEditableTarget(event.target)) return;

  const bit = keyMap.get(event.code);
  if (bit === undefined) return;
  event.preventDefault();
  setMaskBit("keyboard", bit, false);
});

function handleCanvasPointerDown(event) {
  canvas.setPointerCapture(event.pointerId);
  setTouchFromPointer(event, true);
  canvas.focus();
}

function handleCanvasPointerMove(event) {
  if (event.buttons) setTouchFromPointer(event, true);
}

function handleCanvasPointerUp(event) {
  canvas.releasePointerCapture(event.pointerId);
  setTouchFromPointer(event, false);
}

function handleCanvasPointerCancel(event) {
  canvas.releasePointerCapture(event.pointerId);
  setTouchFromPointer(event, false);
}

function attachCanvasEvents() {
  canvas.addEventListener("pointerdown", handleCanvasPointerDown);
  canvas.addEventListener("pointermove", handleCanvasPointerMove);
  canvas.addEventListener("pointerup", handleCanvasPointerUp);
  canvas.addEventListener("pointercancel", handleCanvasPointerCancel);
}

document.querySelectorAll(".touch-controls button[data-bit]").forEach((button) => {
  const bit = Number(button.dataset.bit);
  const press = (event) => {
    event.preventDefault();
    button.classList.add("active");
    button.setPointerCapture(event.pointerId);
    setMaskBit("touch", bit, true);
  };
  const release = (event) => {
    event.preventDefault();
    button.classList.remove("active");
    if (button.hasPointerCapture(event.pointerId)) button.releasePointerCapture(event.pointerId);
    setMaskBit("touch", bit, false);
  };
  button.addEventListener("pointerdown", press);
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
});

window.addEventListener("pagehide", () => {
  flushSaves(true);
});

globalThis.PilasMelonDS = {
  loadRomBytes,
  loadRomFile: loadRom,
  installCiaFile,
  loadSystemManifestUrl,
  setRenderer,
  mediaBridge,
  wifiBridge,
  get instance() { return instance; },
  get module() { return Module; },
  get renderer() { return videoRenderer?.mode || ""; },
};

async function startApp() {
  romInput.disabled = true;
  ciaInput.disabled = true;
  bootMenuBtn.disabled = true;
  audioBtn.disabled = true;
  audioBtn.textContent = "Audio";
  setAdvancedOpen(false);
  updateDeviceClass();
  syncFullscreenClass();
  applyStoredUiOptions();
  renderBindingsPanel();
  await setRenderer(getPreferredRendererMode());
  bootCore();
}

startApp();
