"use strict";
/* eslint-disable no-unused-vars */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceState = void 0;
var DeviceState;
(function (DeviceState) {
    DeviceState[DeviceState["NonExistent"] = 0] = "NonExistent";
    DeviceState[DeviceState["DeviceSelfTesting"] = 1] = "DeviceSelfTesting";
    DeviceState[DeviceState["Standby"] = 2] = "Standby";
    DeviceState[DeviceState["Operational"] = 3] = "Operational";
    DeviceState[DeviceState["MajorRecoverableFault"] = 4] = "MajorRecoverableFault";
    DeviceState[DeviceState["MajorUnrecoverableFault"] = 5] = "MajorUnrecoverableFault";
    DeviceState[DeviceState["DefaultGetAttributesAll"] = 255] = "DefaultGetAttributesAll";
})(DeviceState = exports.DeviceState || (exports.DeviceState = {}));
