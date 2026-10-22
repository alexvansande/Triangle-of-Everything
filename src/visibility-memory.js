// Translation never changes the epoch. Keep decisions through small zoom
// reversals too; re-evaluate only after a meaningful change from the last pass.
export class VisibilityMemory {
  constructor(ratio = 1.12) {
    this.ratio = ratio;
    this.scales = null;
    this.context = null;
    this.epoch = 0;
    this.decisions = new Map();
  }
  update(scales, context) {
    const changed = !this.scales || context !== this.context || scales.some((s,i) => {
      const ratio = Math.abs(s / this.scales[i]);
      return ratio > this.ratio || ratio < 1 / this.ratio;
    });
    if (changed) {
      this.scales = [...scales]; this.context = context;
      this.decisions.clear(); this.epoch++;
    }
    return changed;
  }
}
