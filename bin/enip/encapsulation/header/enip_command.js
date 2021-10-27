"use strict";
/* eslint-disable no-unused-vars */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnipCommand = void 0;
var EnipCommand;
(function (EnipCommand) {
    EnipCommand[EnipCommand["NOP"] = 0] = "NOP";
    EnipCommand[EnipCommand["ListServices"] = 4] = "ListServices";
    EnipCommand[EnipCommand["ListIdentity"] = 99] = "ListIdentity";
    EnipCommand[EnipCommand["ListInterfaces"] = 100] = "ListInterfaces";
    EnipCommand[EnipCommand["RegisterSession"] = 101] = "RegisterSession";
    EnipCommand[EnipCommand["UnregisterSession"] = 102] = "UnregisterSession";
    EnipCommand[EnipCommand["SendRRData"] = 111] = "SendRRData";
    EnipCommand[EnipCommand["SendUnitData"] = 112] = "SendUnitData";
    EnipCommand[EnipCommand["IndicateStatus"] = 114] = "IndicateStatus";
    EnipCommand[EnipCommand["Cancel"] = 115] = "Cancel";
})(EnipCommand = exports.EnipCommand || (exports.EnipCommand = {}));
