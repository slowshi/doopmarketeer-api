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
exports.getBlockNumber = exports.resolveENS = void 0;
const ethers_1 = require("ethers");
const constants_1 = require("./constants");
const resolveENS = (name) => __awaiter(void 0, void 0, void 0, function* () {
    const provider = new ethers_1.JsonRpcProvider(constants_1.ETHEREUM_RPC_URL);
    return yield provider.resolveName(name);
});
exports.resolveENS = resolveENS;
const getBlockNumber = () => __awaiter(void 0, void 0, void 0, function* () {
    const provider = new ethers_1.JsonRpcProvider(constants_1.ETHEREUM_RPC_URL);
    return yield provider.getBlockNumber();
});
exports.getBlockNumber = getBlockNumber;
