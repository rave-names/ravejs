"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exampleName = void 0;
const addys = `{
  "btc":""
  "eth":"0x3e522051a9b1958aa1e828ac24afba4a551df37d"
  "bch":""
  "ltc":""
  "xrp":""
  "avax":""
  "bnb":""
  "luna":""
  "near":""
}`
    .split(new RegExp('\n'))
    .join(',')
    .replace(',', '')
    .slice(0, -2)
    .concat('', '}');
exports.exampleName = {
    name: 'z.ftm',
    isOwned: true,
    owner: '0x3e522051a9b1958aa1e828ac24afba4a551df37d',
    avatar: 'https://cyber.fantoms.art/Opr.png',
    addresses: JSON.parse(addys),
};
