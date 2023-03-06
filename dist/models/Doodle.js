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
exports.getDoodle = void 0;
const graphql_request_1 = require("graphql-request");
const cacheGet_1 = require("../utils/cacheGet");
const constants_1 = require("../utils/constants");
const getDoodle = (tokenId) => __awaiter(void 0, void 0, void 0, function* () {
    const doodleResponse = (yield (0, cacheGet_1.cacheGet)(`${constants_1.DOODLE_METADATA_URL}/${tokenId}`));
    const wearablesResponse = (yield (0, cacheGet_1.cacheGet)(`${constants_1.DOOPLICATOR_WEARABLES_URL}/${tokenId}`));
    const assumed = doodleResponse.attributes.reduce((acc, item) => {
        let ids = constants_1.assumedWearablesMap[item.value];
        if (typeof ids === 'undefined')
            ids = [];
        return [...acc, ...ids];
    }, []);
    let assumedIndex = 0;
    const wearables = wearablesResponse.wearables.map((wearable) => {
        if (typeof wearable.wearable_id === 'undefined') {
            if (assumedIndex < assumed.length) {
                const assumedWearable = assumed[assumedIndex];
                assumedIndex++;
                return Object.assign({}, assumedWearable);
            }
            else {
                return {
                    image_uri: constants_1.UNKNOWN_WEARABLE,
                };
            }
        }
        return wearable;
    });
    const query = (0, graphql_request_1.gql) `
    query SearchMarketplaceNFTs($input: SearchMarketplaceNFTsInputV2!) {
      searchMarketplaceNFTsV2(input: $input) {
        marketplaceNFTs {
          editionID
          name
          description
          activeListing {
            vaultType
            price
          }
        }
        totalResults
      }
    }
  `;
    const costPromises = wearables
        .filter((item) => typeof item.wearable_id !== 'undefined')
        .map((item) => {
        const collectionId = item.wearable_id !== '244' ? 'doodleswearables' : 'doodlesbetapass';
        const variables = {
            input: {
                collectionID: collectionId,
                editionID: item.wearable_id,
                forSale: true,
                limit: 1,
                orderBy: 'price_asc',
            },
        };
        return (0, graphql_request_1.request)('https://api-v2.ongaia.com/graphql/', query, variables);
    });
    const costs = yield Promise.all(costPromises);
    const costResponse = costs.map((cost) => cost['searchMarketplaceNFTsV2']['marketplaceNFTs'][0]);
    return Object.assign(Object.assign({}, doodleResponse), { wearables, costs: costResponse });
});
exports.getDoodle = getDoodle;
