/* eslint-env browser, jquery */
(function (global) {
  const RED = global.RED;

  const nodeName = 'flux-bulb-config';

  RED.nodes.registerType(nodeName, {
    category: 'config',
    label () {
      return this.name || 'flux';
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
      function toggleIdentifyBulb () {
        if (!$bulbInput.val()) {
          console.log('Disabling #identify-bulb');
          $identifyBulb.prop('disabled', true)
            .addClass('disabled');
        } else {
          console.log('Enabling #identify-bulb');
          $identifyBulb.prop('disabled', false)
            .removeClass('disabled');
        }
      }

      const $bulbInput = $('#node-config-input-bulb')
        .change(toggleIdentifyBulb);

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
        refreshBulbs(true)
          .then(() => {
            $refreshBulbs.ladda('stop');
          });
      });
      function refreshBulbs (force = false) {
        // XXX blasts saved value
        $bulbInput.empty();
        $bulbInput.append('<option value="">Choose bulb...</option>');
        console.log(`${nodeName}: Refreshing list of bulbs...`);
        console.time('refreshBulbs');
        return $.getJSON(`/flux-bulb-config/bulbs${force ? '?force=1' : ''}`,
          bulbs => {
            console.timeEnd('refreshBulbs');
            Object.keys(bulbs)
              .forEach(id => {
                const bulb = bulbs[id];
                $bulbInput.append(
                  `<option value="${bulb.id}">${bulb.id} (${bulb.ip})</option>`);
              });
          });
      }

      toggleIdentifyBulb();
      refreshBulbs();
    }
  });
}(window));
