/* eslint-env browser, jquery */
(function (global) {
  const RED = global.RED;

  RED.nodes.registerType('flux-bulb-config', {
    category: 'config',
    label () {
      return this.name || 'Flux WiFi Bulb';
    },
    defaults: {
      bulb: {
        value: null,
        required: true
      },
      'name': {
        value: ''
      }
    },
    oneditprepare () {
      function refreshBulbs () {
        return $.getJSON('/flux-bulb-config/bulbs', bulbs => {
          $bulbInput.empty();
          Object.keys(bulbs)
            .forEach(id => {
              const bulb = bulbs[id];
              $bulbInput.append(
                `<option value="${bulb.id}">${bulb.id} (${bulb.ip})</option>`);
            });
        });
      }

      refreshBulbs();

      const $bulbInput = $('#node-config-input-bulb');

      const $identifyBulb = $('#identify-bulb')
        .ladda();
      $identifyBulb.click(() => {
        $identifyBulb.ladda('start');
        const id = $bulbInput.val();
        if (id) {
          $.ajax({
            method: 'PUT',
            url: `/flux-bulb-config/bulb/${id}/identify`
          })
            .then(() => {
              $identifyBulb.ladda('stop');
            });
        }
      });

      const $refreshBulbs = $('#refresh-bulbs')
        .ladda();
      $refreshBulbs.click(() => {
        $refreshBulbs.ladda('start');
        refreshBulbs()
          .then(() => {
            $refreshBulbs.ladda('stop');
          });
      });
    }
  });
}(window));
