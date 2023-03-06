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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheGet = exports.cacheServiceInstance = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const CacheService_1 = require("./CacheService");
Object.defineProperty(exports, "cacheServiceInstance", { enumerable: true, get: function () { return CacheService_1.cacheServiceInstance; } });
function cacheGet(url, params, clearCache = false) {
    return __awaiter(this, void 0, void 0, function* () {
        let key = url;
        if (typeof params !== 'undefined' && params !== null) {
            const paramsObject = Object.fromEntries(Array.from(Object.entries(params)));
            key = `${url}?${new URLSearchParams(paramsObject)}`;
        }
        //we bust cache
        // clearCache = true;
        if (CacheService_1.cacheServiceInstance.has(key) &&
            !CacheService_1.cacheServiceInstance.isExpired(key, 300) &&
            !clearCache &&
            CacheService_1.cacheServiceInstance.get(key)) {
            return CacheService_1.cacheServiceInstance.get(key);
        }
        const response = yield fetchWithRetry(key);
        CacheService_1.cacheServiceInstance.set(key, response);
        return response;
    });
}
exports.cacheGet = cacheGet;
function fetchWithRetry(url, retries = 5, timeout = 100) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield (0, node_fetch_1.default)(url);
            return yield response.json();
        }
        catch (error) {
            if (retries > 0) {
                console.error(`Failed to fetch data: ${error.message}. Retrying...`);
                yield new Promise((resolve) => setTimeout(resolve, timeout));
                return yield fetchWithRetry(url, retries - 1);
            }
            else {
                throw error;
            }
        }
    });
}
