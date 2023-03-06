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
exports.doopFloor = exports.doodleFloor = void 0;
const Undooped_1 = require("../models/Undooped");
const doopFloor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let rarity = Number(req.query['rarity']) || 0;
    if (rarity < 0) {
        rarity = 0;
    }
    else if (rarity > 2) {
        rarity = 2;
    }
    const undooped = yield (0, Undooped_1.getUndoopedDooplicator)(rarity);
    res.json(undooped);
});
exports.doopFloor = doopFloor;
const doodleFloor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const limit = Number(req.query['limit']) || 20;
    let page = Number(req.query['page']) || 1;
    if (page < 1) {
        page = 1;
    }
    const undooped = yield (0, Undooped_1.getUndoopedDoodles)(page, limit);
    res.json(undooped);
});
exports.doodleFloor = doodleFloor;
