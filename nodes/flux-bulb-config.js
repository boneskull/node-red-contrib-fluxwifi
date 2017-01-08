'use strict';

const deadlights = require('deadlights');

const nodeName = 'flux-bulb-config';
const editorSourcePath = require.resolve('./flux-bulb-config.editor.js');

module.exports = function (RED) {
  const bulbs = {};
  let poll;

  function onBulb (bulb) {
    bulbs[bulb.id] = bulb;
    RED.log.debug(`${nodeName}: found bulb with id ${bulb.id}`);
    // RED.comms.publish('flux-bulb-config:bulb', bulb);
  }

  function onExpired (bulb) {
    delete bulbs[bulb.id];
    RED.log.debug(`${nodeName}: bulb with id ${bulb.id} expired`);
    // RED.comms.publish('flux-bulb-config:bulb-deleted', bulb);
  }

  function beginPolling () {
    RED.log.debug(`${nodeName}: begin polling`);
    function discover () {
      RED.log.debug(`${nodeName}: discovering bulbs`);
      fluxNet.discover()
        .tap(bulbs => {
          RED.log.debug(`${nodeName}: discovered ${bulbs.length} bulbs`);
        })
        .map(bulb => bulb.refresh());
    }

    discover();
    poll = setInterval(() => discover, 60000);
  }

  function endPolling () {
    RED.log.debug(`${nodeName}: end polling`);
    clearInterval(poll);
    return fluxNet.close();
  }

  const fluxNet = new deadlights.Network({keepOpen: true})
    .on('bulb', onBulb)
    .on('expired', onExpired);

  class FluxBulbConfig {
    constructor (config) {
      this.debug(`${nodeName}: created`);
      RED.nodes.createNode(this, config);
    }

  }

  RED.httpAdmin.get('/flux-bulb-config/editor/flux-bulb-config.editor.js',
    (req, res) => {
      RED.log.debug('Sending editor source');
      res.sendFile(editorSourcePath);
    })
    .get('/flux-bulb-config/vendor/ladda/:filename', (req, res) => {
      RED.log.debug(`Attempting to send vendor file ${req.params.filename}`);
      try {
        res.sendFile(require.resolve(`ladda/dist/${req.params.filename}`));
      } catch (e) {
        RED.log.error(e);
        res.sendStatus(404);
      }
    })
    .get('/flux-bulb-config/bulbs', (req, res) => {
      RED.log.debug(`sending ${Object.keys(bulbs).length} bulbs to editor`);
      res.send(bulbs);
    })
    .put('/flux-bulb-config/bulb/:id/identify', (req, res) => {
      const id = req.params.id;
      RED.log.debug(`Identifying bulb ${id}`);
      if (bulbs[id]) {
        bulbs[req.params.id].flash()
          .then(() => {
            res.sendStatus(200);
          })
          .catch(err => {
            RED.log.error(err);
            res.status(500).send(err);
          });
      } else {
        res.sendStatus(404);
      }
    });

  RED.nodes.registerType('flux-bulb-config', FluxBulbConfig);

  beginPolling();
};
