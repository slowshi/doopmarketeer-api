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
exports.leaderboard = exports.feed = exports.history = exports.doops = void 0;
const DoopTransactions_1 = require("../models/DoopTransactions");
const constants_1 = require("../utils/constants");
const ethersUtils_1 = require("../utils/ethersUtils");
const doops = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const address = ((_a = req.query['address']) === null || _a === void 0 ? void 0 : _a.toString()) || '';
    if (address === '') {
        res.json({ error: 'No address found' });
        return;
    }
    if (address.includes('.eth')) {
        const fullAddress = yield (0, ethersUtils_1.resolveENS)(address);
        if (fullAddress === null) {
            res.json({ error: 'No address found' });
            return;
        }
        const results = yield (0, DoopTransactions_1.getDoops)(fullAddress);
        res.json(results.transactions);
    }
    else {
        const results = yield (0, DoopTransactions_1.getDoops)(address);
        res.json(results.transactions);
    }
});
exports.doops = doops;
const history = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const limit = Number(req.query['limit']) || 5;
    let page = Number(req.query['page']) || 1;
    if (page < 1) {
        page = 1;
    }
    const response = yield (0, DoopTransactions_1.getHistory)();
    const results = response.transactions.slice((page - 1) * limit, limit * page);
    res.json(results);
});
exports.history = history;
const feed = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const startBlock = Number(req.query['startBlock']) || constants_1.DOOPLICATION_BLOCK;
    const response = yield (0, DoopTransactions_1.getFeed)(startBlock);
    const results = response.transactions;
    res.json(results);
});
exports.feed = feed;
const leaderboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, DoopTransactions_1.getLeaderboard)();
    res.json(response);
});
exports.leaderboard = leaderboard;
