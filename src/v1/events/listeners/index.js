import fs from 'fs';
import path from 'path';
import events from '../events';

export default function(emitter) {
  const loadListeners = (dir = '') => {
    fs
      .readdirSync(path.join(__dirname, dir))
      .filter(file => file !== 'index.js')
      .forEach(file => {
        const stats = fs.lstatSync(path.join(__dirname, dir, file));
        if (stats.isDirectory()) {
          loadListeners(path.join(dir, file));
        } else {
          const listener = require(path.join(__dirname, dir, file));
          listener.default(emitter, events);
        }
      });
  };
  loadListeners();
}
