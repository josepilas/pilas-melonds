class PilasAudioWorklet extends AudioWorkletProcessor {
  constructor() {
    super();
    this.queue = [];
    this.current = null;
    this.offset = 0;
    this.port.onmessage = (event) => {
      if (event.data?.type === "samples" && event.data.samples) {
        this.queue.push(event.data.samples);
        while (this.queue.length > 8) this.queue.shift();
      }
    };
  }

  nextSample(channel) {
    if (!this.current || this.offset >= this.current.length) {
      this.current = this.queue.shift() || null;
      this.offset = 0;
    }

    if (!this.current) return 0;
    return this.current[this.offset + channel] || 0;
  }

  process(_, outputs) {
    const output = outputs[0];
    const left = output[0];
    const right = output[1] || output[0];

    for (let i = 0; i < left.length; i++) {
      left[i] = this.nextSample(0);
      right[i] = this.nextSample(1);
      this.offset += 2;
    }

    return true;
  }
}

registerProcessor("pilas-audio-worklet", PilasAudioWorklet);
