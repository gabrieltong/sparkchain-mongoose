let App = require('./models/app');
let Biz = require('./models/biz');
let Msg = require('./models/msg');
let Wallet = require('./models/wallet');
let Plugin = require('./plugins/');
let I18n = require('./i18n/');

let main = {App, Biz, Msg, Wallet, Plugin, I18n};
module.exports = main;