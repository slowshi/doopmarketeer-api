"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assets = void 0;
const Doodle_1 = require("../models/Doodle");
const assets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tokenId = ((_a = req.params['tokenId']) === null || _a === void 0 ? void 0 : _a.toString()) || '';
    if (tokenId === '') {
        res.json({ error: 'No tokenId found' });
        return;
    }
    const response = yield (0, Doodle_1.getDoodle)(tokenId);
    res.json(response);
});
exports.assets = assets;
