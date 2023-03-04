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
exports.contractTransactions = exports.userTransactions = void 0;
const ethersUtils_1 = require("../utils/ethersUtils");
const constants_1 = require("../utils/constants");
const cacheGet_1 = require("../utils/cacheGet");
const userTransactions = (address, page = 1) => __awaiter(void 0, void 0, void 0, function* () {
    const blockNumber = yield (0, ethersUtils_1.getBlockNumber)();
    const res = yield (0, cacheGet_1.cacheGet)('https://api.etherscan.io/api', {
        module: 'account',
        action: 'txlist',
        address,
        startblock: constants_1.DOOPLICATION_BLOCK,
        endblock: blockNumber,
        page,
        offset: 100,
        apikey: process.env.ETHERSCAN_API_KEY,
    });
    return res;
});
exports.userTransactions = userTransactions;
const contractTransactions = (address, clearCahce = false, page = 1, offset = 10000, startBlock = constants_1.DOOPLICATION_BLOCK) => __awaiter(void 0, void 0, void 0, function* () {
    const blockNumber = yield (0, ethersUtils_1.getBlockNumber)();
    const res = yield (0, cacheGet_1.cacheGet)('https://api.etherscan.io/api', {
        module: 'account',
        action: 'txlist',
        address,
        startblock: startBlock,
        endblock: blockNumber,
        page,
        offset,
        apikey: process.env.ETHERSCAN_API_KEY,
    }, clearCahce);
    return res;
});
exports.contractTransactions = contractTransactions;
