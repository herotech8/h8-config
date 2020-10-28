const path = require('path');
const fs = require('fs');

const ConfigSymbol = Symbol('Config');

class _config {
  constructor() {
    if(global[ConfigSymbol] !== undefined && global[ConfigSymbol] !== null) {
      this.config = global[ConfigSymbol];

      return;
    }

    this.config = null;
    this.configPath = null;

    var fullpath = path.normalize(__dirname).replace(/\\/g, "/");

    var parts = fullpath.split('/');

    while(parts.length > 0 && this.config === null) {
      var thispath = parts.join('/') + '/config.json';

      if(fs.existsSync(thispath)) {
        var thisfile = fs.readFileSync(thispath, { encoding:'utf8' });

        try {
          this.config = JSON.parse(thisfile);
          this.configPath = thispath;
        } catch(err) {
          console.error('[CONFIG]', 'Config file found, error parsing', thispath, err);

          parts.pop();
        }
      } else {
        parts.pop();
      }
    }

    if(this.config === null) {
      throw "Config file not found";
    }

    var parent = this;

    fs.watchFile(parent.configPath, (curr, prev) => {
      try {
        var content = fs.readFileSync(parent.configPath, { encoding:'utf8' });

        parent.config = JSON.parse(content);

        console.log('[CONFIG]', 'Config file dynamically reloaded');
      } catch(err) {
        console.error('[CONFIG]', 'Config file changed, error parsing');
      }
    });
  }

  get(key) {
    function index(obj,i) { return obj[i]; }

    try {
      return key.split('.').reduce(index, this.config);
    } catch(err) {
      throw "Unable to retrieve config key '" + key + "'";
    }
  }
}

module.exports = new _config;
