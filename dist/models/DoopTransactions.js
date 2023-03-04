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
exports.getLeaderboard = exports.getFeed = exports.getHistory = exports.getDoops = void 0;
const constants_1 = require("../utils/constants");
const ts_abi_decoder_1 = require("ts-abi-decoder");
const Etherscan_1 = require("./Etherscan");
const blockSortDesc = (a, b) => {
    if (a['blockNumber'] > b['blockNumber']) {
        return -1;
    }
    if (a['blockNumber'] < b['blockNumber']) {
        return 1;
    }
    return 0;
};
const formatTransactionResponse = (transactions) => {
    return transactions
        .filter((transaction) => {
        return ([constants_1.DOOPMARKET_ADDRESS, constants_1.DOOPLICATOR_ADDRESS].indexOf(transaction.to) > -1 &&
            transaction.functionName.substring(0, 10) === 'dooplicate' &&
            transaction.isError === '0');
    })
        .map((transaction) => {
        ts_abi_decoder_1.Decoder.addABI(constants_1.doopContracts[transaction.to]);
        const decodedData = ts_abi_decoder_1.Decoder.decodeData(transaction.input);
        const info = [...decodedData.params].reduce((acc, param) => {
            const names = ['tokenId', 'dooplicatorId', 'addressOnTheOtherSide'];
            if (names.indexOf(param.name) > -1) {
                acc = Object.assign(Object.assign({}, acc), { [param.name]: param.value });
            }
            return acc;
        }, {});
        return {
            blockNumber: Number(transaction.blockNumber),
            timeStamp: Number(transaction.timeStamp),
            from: transaction.from,
            hash: transaction.hash,
            value: transaction.value,
            gas: transaction.gas,
            to: transaction.to,
            gasPrice: transaction.gasPrice,
            cumulativeGasUsed: transaction.cumulativeGasUsed,
            functionName: decodedData === null || decodedData === void 0 ? void 0 : decodedData.name,
            tokenId: info.tokenId,
            dooplicatorId: info.dooplicatorId,
            addressOnTheOtherSide: info.addressOnTheOtherSide,
        };
    })
        .sort(blockSortDesc);
};
const formatLeaderboard = (transactions) => {
    const leaderboard = transactions.reduce((acc, item) => {
        let user = {
            timeStamp: 0,
            address: '',
            dooplicate: 0,
            dooplicateItem: 0,
            value: 0,
        };
        if (typeof acc[item.from] === 'undefined') {
            user = {
                timeStamp: Number(item.timeStamp),
                address: item.from,
                dooplicate: item.functionName.substring(0, 10) === 'dooplicate' ? 1 : 0,
                dooplicateItem: item.functionName.substring(0, 10) === 'dooplicateItem' ? 1 : 0,
                value: Number(item.value),
            };
        }
        else {
            const existingUser = acc[item.from];
            const itemTimestamp = Number(item.timeStamp);
            user = Object.assign(Object.assign({}, existingUser), { timeStamp: existingUser.timeStamp >= itemTimestamp ? existingUser.timeStamp : itemTimestamp, value: Number(existingUser.value) + Number(item.value), dooplicate: item.functionName.substring(0, 10) === 'dooplicate' ? existingUser.dooplicate + 1 : existingUser.dooplicate, dooplicateItem: item.functionName.substring(0, 10) === 'dooplicateItem'
                    ? existingUser.dooplicateItem + 1
                    : existingUser.dooplicateItem });
        }
        acc = Object.assign(Object.assign({}, acc), { [item.from]: user });
        return acc;
    }, {});
    return Object.values(leaderboard);
};
const getDoops = (address) => __awaiter(void 0, void 0, void 0, function* () {
    let allResults = [];
    let newResults = [];
    let page = 1;
    while (newResults.length > 0 || page === 1) {
        const res = yield (0, Etherscan_1.userTransactions)(address, page);
        newResults = res.result;
        allResults = [...allResults, ...newResults];
        page++;
    }
    const transactions = formatTransactionResponse(allResults);
    return { transactions };
});
exports.getDoops = getDoops;
const getHistory = () => __awaiter(void 0, void 0, void 0, function* () {
    const doopResponse = yield (0, Etherscan_1.contractTransactions)(constants_1.DOOPLICATOR_ADDRESS);
    const marketResponse = yield (0, Etherscan_1.contractTransactions)(constants_1.DOOPMARKET_ADDRESS);
    const doopResults = doopResponse.result;
    const marketResults = marketResponse.result;
    const transactions = formatTransactionResponse([...doopResults, ...marketResults]);
    return { transactions };
});
exports.getHistory = getHistory;
const getFeed = (startBlock) => __awaiter(void 0, void 0, void 0, function* () {
    const doopResponse = yield (0, Etherscan_1.contractTransactions)(constants_1.DOOPLICATOR_ADDRESS, true, 1, 100, startBlock + 1);
    const marketResponse = yield (0, Etherscan_1.contractTransactions)(constants_1.DOOPMARKET_ADDRESS, true, 1, 100, startBlock + 1);
    const doopResults = doopResponse.result;
    const marketResults = marketResponse.result;
    const transactions = formatTransactionResponse([...doopResults, ...marketResults]);
    return { transactions };
});
exports.getFeed = getFeed;
const getLeaderboard = () => __awaiter(void 0, void 0, void 0, function* () {
    const doopResponse = yield (0, Etherscan_1.contractTransactions)(constants_1.DOOPLICATOR_ADDRESS, true);
    const marketResponse = yield (0, Etherscan_1.contractTransactions)(constants_1.DOOPMARKET_ADDRESS, true);
    const doopResults = doopResponse.result;
    const marketResults = marketResponse.result;
    const transactions = formatLeaderboard([...doopResults, ...marketResults]);
    return transactions;
});
exports.getLeaderboard = getLeaderboard;
