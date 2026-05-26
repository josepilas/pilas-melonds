# Pilas-melonDS

Pilas-melonDS is the HTML5/WebAssembly frontend for melonDS. It builds the
existing C++ emulator core to WASM with Emscripten and replaces the Qt/SDL
desktop UI with a browser frontend.

## First target

- Nintendo DS mode by default, with experimental Nintendo DSi mode
- interpreter CPU, no JIT
- software renderer copied to an HTML canvas
- WebAudio AudioWorklet output
- keyboard, Gamepad API, touch controls, and DS touchscreen input
- SRAM and firmware persistence through IndexedDB via Emscripten IDBFS
- built-in FreeBIOS fallback for normal Nintendo DS direct-boot mode
- DSi camera and microphone bridge through browser media permissions
- `.dsi` ROM loading and DSiWare `.cia` installation into browser-backed DSi
  NAND or virtual SD storage
- automatic browser internet mode with DHCP, DNS, ARP, and a basic HTTP responder,
  plus optional same-origin tab and WebSocket packet bridges
- no pthreads, no SIMD in the default build

## Build

Install and activate Emscripten, then configure from the repository root:

```sh
emcmake cmake -S . -B build-web \
  -DCMAKE_BUILD_TYPE=Release \
  -DBUILD_WEB_FRONTEND=ON \
  -DBUILD_QT_SDL=OFF \
  -DENABLE_JIT=OFF \
  -DENABLE_OGLRENDERER=OFF \
  -DENABLE_GDBSTUB=OFF
cmake --build build-web --target Pilas-melonDS -j
```

Serve the generated app from `build-web/pilas-web`:

```sh
python -m http.server 8000 --directory build-web/pilas-web
```

Then open `http://localhost:8000`.

On Windows, the repository also includes a helper:

```powershell
.\tools\run-pilas-web.ps1 -Port 8766
```

To stage a local legal ROM dump for repeatable browser testing:

```powershell
.\tools\run-pilas-web.ps1 -Port 8766 -RomPath "C:\path\to\game.nds"
```

For repeatable local testing, place a legally dumped ROM beside `index.html`
in `build-web/pilas-web` and open `http://127.0.0.1:8766/?rom=your-rom.nds`.
The ROM picker accepts `.nds`, `.dsi`, and `.srl`; `.dsi` files are treated as
DSi ROM/SRL images and are loaded through the same emulator core path as `.nds`.

## System files manifest

BIOS and firmware files can be loaded one by one through the file inputs, or
through a JSON manifest loaded from a local `.json` file, from the manifest URL
field, or from `?manifest=system-files.json`.

Example manifest:

```json
{
  "bios": {
    "bios9": "https://example.com/nds/bios9.bin",
    "bios7": "https://example.com/nds/bios7.bin"
  },
  "firmware": "https://example.com/nds/firmware.bin"
}
```

Recommended separated manifest with DS and DSi files:

```json
{
  "ds": {
    "bios9": "https://example.com/ds/bios9.bin",
    "bios7": "https://example.com/ds/bios7.bin",
    "firmware": "https://example.com/ds/firmware.bin"
  },
  "dsi": {
    "bios9": "https://example.com/dsi/bios9i.bin",
    "bios7": "https://example.com/dsi/bios7i.bin",
    "boot9": "https://example.com/dsi/bios9i.bin",
    "boot7": "https://example.com/dsi/bios7i.bin",
    "firmware": "https://example.com/dsi/firmware.bin",
    "nand": "https://example.com/dsi/nand.bin",
    "sd": "https://example.com/dsi/sd.img"
  },
  "dldi": {
    "sd": "https://example.com/homebrew/dldi-sd.img"
  }
}
```

`boot9`/`boot7`, `bios9`/`bios7`, and `arm9i`/`arm7i` aliases are accepted in
the DSi object. DS files can be placed under `ds` or `nds`. DSi files should be
kept under `dsi` so the frontend does not confuse DS BIOS9 with DSi BIOS9i. The
homebrew SD image can be supplied as `dldi.sd`, `homebrew.sd`, or flat
`dldiSd`.

The flat form is also accepted:

```json
{
  "bios9": "https://example.com/nds/bios9.bin",
  "bios7": "https://example.com/nds/bios7.bin",
  "firmware": "https://example.com/nds/firmware.bin"
}
```

Remote URLs must be readable by the browser, so cross-origin hosts need the
appropriate CORS headers. BIOS9 is validated as 4096 bytes, BIOS7 as 16384
bytes, and DSi BIOS9i/BIOS7i as 65536 bytes before being persisted to IDBFS.

Normal Nintendo DS direct-boot mode works without official DS BIOS files by
using melonDS' built-in FreeBIOS fallback. The DS BIOS9/BIOS7 upload fields are
there for users who want to replace that fallback with their own dumps. DSi mode
does not use FreeBIOS as a replacement for DSi boot files; DSi BIOS9i, DSi
BIOS7i, and a valid writable DSi NAND are still required for DSi menu boot.

## DSi, camera, microphone, and Wi-Fi

DSi mode is selected in advanced options. It requires legally dumped DSi ARM9i
BIOS, ARM7i BIOS, and a writable NAND dump with a no$gba footer. A DSi firmware
dump can also be supplied and is used instead of the DS-mode firmware while DSi
mode is active.

The DSi NAND is the real internal storage and is required for DSi menu boot.
Pilas-melonDS also creates a persistent virtual DSi SD card in IndexedDB
(`/pilas/system/dsi-sd.img`) when the DSi SD option is enabled. The SD card can
be generated at 64, 128, 256, or 512 MB, or replaced with an uploaded `.img`.
This gives DSi software a browser-backed storage device even when the user only
needs removable SD-style storage.

Homebrew and flashcart-style software use a separate persistent DLDI SD image at
`/pilas/system/dldi-sd.img`. It is enabled by default and is passed into
melonDS' built-in DLDI driver when a homebrew ROM asks for FAT storage. This is
the path that fixes common `FAT init fail` errors in libfat-based applications.

Advanced options include an **Internal storage and SD card** panel. It shows
whether the DSi NAND, DSi SD, and DLDI SD images are currently stored in the
browser, their sizes, and whether each SD device is enabled. The NAND can be
exported as `pilas-dsi-internal.nand`; the DSi SD card can be exported as
`pilas-dsi-sd.img`; the DLDI/homebrew SD card can be exported as
`pilas-dldi-sd.img`. All downloads are raw disk images so they can be archived,
inspected, mounted, or replaced later by uploading another image.

DSiWare CIA installation is available from the top bar with **Install .cia
file**. The **DSiWare install target** selector in advanced options chooses
whether the title is installed into the DSi NAND or into the virtual SD image.
NAND installs use melonDS' DSi NAND importer and are the mode expected by the
stock DSi menu. The installer closes any currently running emulated console
before mounting NAND/SD so the browser frontend never writes to a disk image
that the core still has open. SD installs write a NAND-like/hiyaCFW-style title
layout to the virtual SD image (`ticket/...` and `title/...`); this is useful
for SD-oriented setups, but a stock DSi menu normally will not list those titles
without a compatible SD redirection environment.

CIA files may contain encrypted title content. Pilas-melonDS never embeds
Nintendo keys. If an encrypted CIA is uploaded, paste your legally obtained
16-byte CIA common key as 32 hexadecimal characters in **CIA common key** before
installing. Decrypted CIA content installs without that key.

The `Boot` selector controls whether a ROM direct-boots or starts through the
firmware/menu path. The top-level `Boot menu` button starts the DS/DSi firmware
without loading a ROM. Firmware/menu boot requires real bootable BIOS and
firmware files; generated firmware and FreeBIOS are intentionally rejected for
that path.

Camera and microphone use `navigator.mediaDevices.getUserMedia()`. They work on
`localhost` or HTTPS origins and require browser permission. Camera frames are
converted to the YUYV format expected by the melonDS DSi camera core; microphone
samples are pushed into the core as signed 16-bit PCM.

Wi-Fi defaults to **Browser internet**. Browsers cannot expose raw 802.11 or TAP
devices to WebAssembly, so this mode runs a small frontend network shim that
answers ARP, DHCP, and DNS from the emulated DS/DSi and accepts basic TCP/HTTP
connections. It is intentionally a compatibility shim: it can satisfy network
setup and plain HTTP-style requests, but it cannot provide arbitrary raw UDP/TCP
internet or decrypt HTTPS traffic from inside the browser sandbox.

For multiplayer experiments or a native host backend, advanced options still
offer `Local tabs` mode (`BroadcastChannel`, same browser origin) and a
WebSocket endpoint. The WebSocket bridge packet format is binary:

```text
byte 0      packet type
byte 1      reserved
bytes 2-3   aid, little-endian
bytes 4-7   timestamp low, little-endian
bytes 8-11  timestamp high, little-endian
bytes 12-15 payload length, little-endian
bytes 16..  payload
```

Packet types are `1` MP packet, `2` MP command, `3` MP reply, `4` MP ack, `5`
MP host packet, `6` MP replies, and `20` DSi network packet. A separate local
WebSocket relay can map these packets to another emulator instance or a host
network backend.

## Browser options

- The renderer selector switches the software framebuffer upload between Canvas
  2D, WebGL 2, and WebGPU. WebGPU falls back to Canvas when the browser does not
  expose a WebGPU adapter. New browser profiles try WebGL 2 first and fall back
  to Canvas when unavailable.
- Keyboard inputs can be rebound in the Inputs panel. Bindings are saved in
  localStorage and can be reset from the UI.
- Audio is the default preference. Browsers can still require a user gesture
  before WebAudio starts, so the frontend retries when the user clicks, taps, or
  presses a control.
- DSi SD, DLDI SD, boot mode, camera, microphone, and Wi-Fi controls live in
  advanced options. `Browser internet` is automatic; `Local tabs` and WebSocket
  are alternatives for packet-bridge experiments.
- Advanced options contain renderer, system files, UI color, canvas size,
  input bindings, FPS, speed, save, save state, and core status.
- Fullscreen presents only the game stage. On mobile/coarse-pointer devices the
  virtual touchscreen controls are overlaid in fullscreen.

## Saves and save states

Nintendo DS cartridge saves are managed automatically by the browser frontend.
They are persisted in IndexedDB through Emscripten IDBFS and are not exposed in
the UI as files.

Save states are separate snapshots of the running emulator. In advanced options
they can be exported to a `.pilasav` file or imported from one. A `.pilasav`
file is the regular melonDS savestate binary produced by the core, with a
Pilas-melonDS-specific extension for browser users.

The browser save-state mode stores up to 6 slots per ROM in IndexedDB. Choosing
save or load opens an in-page slot dialog that works with mouse or touch.

## Performance notes

The browser loop is paced against Nintendo DS refresh timing instead of the
monitor refresh rate. This prevents 120 Hz and 144 Hz displays from running the
emulated game too fast. The frontend also uploads one final framebuffer per
browser tick and polls save dirtiness at a short interval instead of every draw.

Good next optimization points:

- Move emulation to a Web Worker with OffscreenCanvas presentation so UI events
  and frame execution do not compete on the main thread.
- Add pthreads and SharedArrayBuffer builds for browsers served with COOP/COEP
  headers.
- Add SIMD builds for the software renderer and CPU hot paths where Emscripten
  can vectorize safely.
- Avoid the per-frame BGRA-to-RGBA CPU conversion by using a WebGL/WebGPU swizzle
  path or producing browser-native RGBA directly from the software renderer.
- Use a lock-free audio ring buffer between the emulator and AudioWorklet to
  smooth audio under frame spikes.
- Batch IDBFS syncs more aggressively for games that write saves often.

## Architecture

- `web_api.cpp` owns the `melonDS::NDS` or `melonDS::DSi` instance and exposes
  a compact C ABI to JavaScript.
- `web_platform.cpp` implements the `Platform` hooks required by the melonDS
  core using browser-compatible filesystem, timing, save, audio, mic, camera,
  network, and addon stubs.
- `public/src/app.js` owns ROM loading, IDBFS save files, Canvas upload,
  keyboard/gamepad/touch input, frame pacing, RTC sync, audio pumping, browser
  media capture, and the WebSocket Wi-Fi bridge.
- `public/src/audio-worklet.js` drains queued PCM from the main JS thread into
  WebAudio.

Future optimization points are isolated behind the same API: pthreads for core
execution, SIMD builds, WebGL texture upload or accelerated rendering, and a
more complete Wi-Fi relay/backend.
