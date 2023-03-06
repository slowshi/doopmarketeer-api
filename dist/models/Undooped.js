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
exports.getUndoopedDooplicator = exports.getUndoopedDoodles = void 0;
const cacheGet_1 = require("../utils/cacheGet");
const constants_1 = require("../utils/constants");
const Gem_1 = require("./Gem");
const getUndoopedDoodles = (page, limit = 20) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = {
        slug: 'doodles-official',
    };
    const response = yield (0, Gem_1.getGemAssets)(filters, page, limit);
    let undooped = [];
    for (let i = 0; i < response.length; i++) {
        const { tokenId, marketUrl, currentBasePrice, supportsWyvern } = response[i];
        const wearablesResponse = (yield (0, cacheGet_1.cacheGet)(`${constants_1.DOOPLICATOR_WEARABLES_URL}/${tokenId}`));
        const isDooplicated = wearablesResponse.wearables.filter((wearable) => typeof wearable.wearable_id === 'undefined').length ===
            0;
        if (!isDooplicated) {
            undooped = [...undooped, { tokenId, marketUrl, currentBasePrice, supportsWyvern }];
        }
    }
    return undooped;
});
exports.getUndoopedDoodles = getUndoopedDoodles;
const getUndoopedDooplicator = (rarity) => __awaiter(void 0, void 0, void 0, function* () {
    const rarityMap = ['very common', 'common', 'rare'];
    const filters = {
        slug: 'the-dooplicator',
        traits: {
            Rarity: [`${rarityMap[rarity]}`],
            'OG Wearables charge': ['available'],
        },
    };
    const response = yield (0, Gem_1.getGemAssets)(filters);
    return response;
});
exports.getUndoopedDooplicator = getUndoopedDooplicator;
