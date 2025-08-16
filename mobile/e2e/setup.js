const detox = require('detox');
const config = require('../detox.config.js');

beforeAll(async () => { await detox.init(config); }, 120000);
afterAll(async () => { await detox.cleanup(); }, 120000);