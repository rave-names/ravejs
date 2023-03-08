"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = void 0;
const debug = false;
function log(props) {
    if (debug) {
        // tslint:disable-next-line
        console.log(props);
    }
}
exports.log = log;
