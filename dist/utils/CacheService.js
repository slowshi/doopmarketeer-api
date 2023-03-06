"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheServiceInstance = exports.CacheService = void 0;
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
exports.CacheService = CacheService;
const cacheServiceInstance = new CacheService();
exports.cacheServiceInstance = cacheServiceInstance;
