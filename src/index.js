"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contracts = exports.Rave = exports.exampleName = void 0;
const exampleName_1 = require("./utils/exampleName");
Object.defineProperty(exports, "exampleName", { enumerable: true, get: function () { return exampleName_1.exampleName; } });
const class_1 = require("./utils/class");
Object.defineProperty(exports, "Rave", { enumerable: true, get: function () { return class_1.Rave; } });
const logging_1 = require("./utils/logging");
const contracts_1 = require("./utils/contracts");
Object.defineProperty(exports, "contracts", { enumerable: true, get: function () { return contracts_1.contracts; } });
const r = new class_1.Rave();
const c = async () => {
    (0, logging_1.log)(await r.reverse("0x3e522051A9B1958Aa1e828AC24Afba4a551DF37d", 0));
};
c();
