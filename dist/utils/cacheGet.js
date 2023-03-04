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
class CacheService {
    constructor() {
        this.cache = new Map();
    }
    has(key) {
        return this.cache.has(key);
    }
    set(key, value) {
        const setObj = {
            value,
            timestamp: Date.now(),
        };
        return this.cache.set(key, setObj);
    }
    get(key) {
        const item = this.cache.get(key);
        if (typeof item === 'undefined') {
            return null;
        }
        return item.value;
    }
    delete(key) {
        return this.cache.delete(key);
    }
    clear() {
        this.cache.clear();
    }
    isExpired(key, seconds) {
        const item = this.cache.get(key);
        if (typeof item === 'undefined') {
            return true;
        }
        return (Date.now() - item.timestamp) / 1000 > seconds;
    }
}
const cacheServiceInstance = new CacheService();
exports.cacheServiceInstance = cacheServiceInstance;
function cacheGet(url, params, clearCache = false) {
    return __awaiter(this, void 0, void 0, function* () {
        const paramsObject = Object.fromEntries(Array.from(Object.entries(params)));
        let key = url;
        if (typeof params !== 'undefined') {
            key = `${url}?${new URLSearchParams(paramsObject)}`;
        }
        //we bust cache
        // clearCache = true;
        if (cacheServiceInstance.has(key) &&
            !cacheServiceInstance.isExpired(key, 300) &&
            !clearCache &&
            cacheServiceInstance.get(key)) {
            return cacheServiceInstance.get(key);
        }
        const response = yield fetchWithRetry(key);
        cacheServiceInstance.set(key, response);
        return response;
    });
}
exports.cacheGet = cacheGet;
function fetchWithRetry(url, retries = 3, timeout = 50) {
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
