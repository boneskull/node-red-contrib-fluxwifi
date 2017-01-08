'use strict';
const path = require('path');

module.exports = function (RED) {
  class FluxBulb {
    constructor (config) {
      RED.nodes.createNode(this, config);
    }
  }

  RED.httpAdmin.get('/flux-bulb/editor/js', (req, res) => {
    res.sendFile(path.join(__dirname, 'flux-bulb.editor.js'));
  });

  RED.nodes.registerType('flux-bulb', FluxBulb);
};
