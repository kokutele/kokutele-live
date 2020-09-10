//@flow

export default class MidiHandler {
  devices: Map<Object>;

  static create() {
    return new MidiHandler()
  }

  async getDevices() {
    this.devices = await window.navigator.requestMIDIAccess({sysex: false})
    return this.devices.inputs
  }
}