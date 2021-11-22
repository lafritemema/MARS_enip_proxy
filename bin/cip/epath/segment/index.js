"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Iterator = exports.logical = exports.Logical = void 0;
const segment_1 = require("./segment");
const logical_1 = __importStar(require("./logical")), logical = logical_1;
exports.Logical = logical_1.default;
exports.logical = logical;
// import {SegmentType, SegmentTypeObject, SegmentTypeKeys} from './segment_type';
const segment_iterator_1 = require("./segment_iterator");
Object.defineProperty(exports, "Iterator", { enumerable: true, get: function () { return segment_iterator_1.SegmentIterator; } });
exports.default = segment_1.Segment;
