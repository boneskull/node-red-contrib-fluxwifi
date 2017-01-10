/* eslint-env browser, jquery */
(function (global) {
  'use strict';

  const RED = global.RED;

  RED.nodes.registerType('flux-bulb', {
    category: 'flux lighting',
    icon: 'light.png',
    color: '#39b04b',
    align: 'right',
    inputs: 1,
    outputs: 1,
    paletteLabel: 'flux',
    label () {
      return this.name || 'flux';
    },
    defaults: {
      bulb: {
        type: 'flux-bulb-config',
        required: true
      }
    }
  });
}(window));
