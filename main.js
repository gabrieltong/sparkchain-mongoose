let App = require('./models/app');
let Biz = require('./models/biz');
let Msg = require('./models/msg');
let Wallet = require('./models/wallet');
let Plugin = require('./plugins/');

let main = {App, Biz, Msg, Wallet, Plugin};
module.exports = main;