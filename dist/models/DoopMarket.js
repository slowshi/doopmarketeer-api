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
exports.getDoopmarket = void 0;
const constants_1 = require("../utils/constants");
const DoopmarketABI_json_1 = require("../abis/DoopmarketABI.json");
const ethersUtils_1 = require("../utils/ethersUtils");
const getDoopmarket = () => __awaiter(void 0, void 0, void 0, function* () {
    const doopmarketContract = yield (0, ethersUtils_1.getContrat)(constants_1.DOOPMARKET_ADDRESS, DoopmarketABI_json_1.abi);
    const listing = yield doopmarketContract.getListings(constants_1.DOOPLICATOR_ADDRESS, constants_1.DOODLE_ADDRESS);
    const jsonStringify = JSON.stringify(listing, (key, value) => (typeof value === 'bigint' ? value.toString() : value));
    const jsonParse = JSON.parse(jsonStringify);
    const result = jsonParse
        .filter((item) => item[2] === true)
        .map((item) => {
        return {
            tokenId: item[0],
            value: Number(item[1][0]),
            timeStamp: Number(item[1][1]),
            from: '',
            dooplicatorId: '',
            to: item[1][2],
            functionName: 'dooplicateItem',
        };
    })
        .sort((a, b) => {
        if (a['value'] < b['value']) {
            return -1;
        }
        if (a['value'] > b['value']) {
            return 1;
        }
        return 0;
    });
    return result;
});
exports.getDoopmarket = getDoopmarket;
