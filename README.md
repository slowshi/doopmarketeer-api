# Doopmarketeer API
This has two endpoint to get all dooplication transactions whether from Doopmarket or directly from Dooplicator. I'm using Etherscan API to get transactions by account.

Requirements:
- Etherscan API Key

# .env File
This project uses dotenv for environment variables. You will need to provide these if you want it to work.
```
ETHERSCAN_API_KEY="SECRET"
```

### doops - Gets dooplications from either DoopMarket or Dooplicators

```
/doops?address=0x0000ADDRESSHERE

{
    "blockNumber": "16629503",
    "timeStamp": "1676408123",
    "hash": "xxx",
    "value": "140000000000000000",
    "gas": "167086",
    "gasPrice": "102923373860",
    "cumulativeGasUsed": "8514598",
    "functionName": "dooplicateItem",
    "dooplicatorId": "0000",
    "tokenId": "0000",
    "addressOnTheOtherSide": "xxx"
},
{
    "blockNumber": "16627462",
    "timeStamp": "1676383439",
    "hash": "xxx",
    "value": "0",
    "gas": "59777",
    "gasPrice": "22992204615",
    "cumulativeGasUsed": "7917507",
    "functionName": "dooplicate",
    "dooplicatorId": "0000",
    "tokenId": "0000",
    "addressOnTheOtherSide": "xxx"
}
```
### assets - Getting Doodle and Wearables in one call
```
/assets/7967

{
  "image": "ipfs://QmQTETeEMpgCv2e9q8kpaSS2VyZyXBh7zRQNYC9sxQokoZ",
  "name": "Doodle #7967",
  "description": "A community-driven collectibles project featuring art by Burnt Toast. Doodles come in a joyful range of colors, traits and sizes with a collection size of 10,000. Each Doodle allows its owner to vote for experiences and activations paid for by the Doodles Community Treasury. Burnt Toast is the working alias for Scott Martin, a Canadian–based illustrator, designer, animator and muralist.",
  "attributes": [
    {
      "trait_type": "face",
      "value": "grumpy"
    },
    {
      "trait_type": "hair",
      "value": "green mullet"
    },
    {
      "trait_type": "body",
      "value": "navy sweater"
    },
    {
      "trait_type": "background",
      "value": "light blue"
    },
    {
      "trait_type": "head",
      "value": "yellow"
    }
  ],
  "wearables": [
    {
      "wearable_id": "179",
      "ipfs_hash": "QmTiqtkAjNS1iqxAhQnMvM9gU4CFssYnQ91KXYPZYCeSv3",
      "name": "cargo pants",
      "trim": "brown",
      "set": "OG Wearables: Core",
      "hidden": true,
      "position": "legs",
      "plurality": true,
      "ipfs_hash_svg": "QmUoWBnApuJbv9eSBq3rkZPAqd3tZbzBsDXLLsmY8Wdgp6",
      "image_uri": "https://d1zu9f2anwwksd.cloudfront.net/QmUoWBnApuJbv9eSBq3rkZPAqd3tZbzBsDXLLsmY8Wdgp6.svg"
    },
    {
      "wearable_id": "202",
      "ipfs_hash": "QmNYxVE6BEQewUDaPAfMFz9CJUvRzWg8XZ7cE5339fVAM1",
      "name": "crew socks",
      "trim": "purple",
      "set": "OG Wearables: Core",
      "hidden": true,
      "position": "feet",
      "plurality": true,
      "ipfs_hash_svg": "QmUnYXfghwYGuBVAb5gsN5ks1dEvRJFhd8pydoHsx5EfGF",
      "image_uri": "https://d1zu9f2anwwksd.cloudfront.net/QmUnYXfghwYGuBVAb5gsN5ks1dEvRJFhd8pydoHsx5EfGF.svg"
    },
    {
      "wearable_id": "218",
      "ipfs_hash": "QmeCRtP3fFKre2LTv71ifEA9XqSeegxR3tDYY7g7EpVs1K",
      "name": "shoe",
      "trim": "sky blue",
      "set": "OG Wearables: Core",
      "hidden": true,
      "position": "feet",
      "plurality": true,
      "ipfs_hash_svg": "QmVTxxQ3irfq3E7LbwcHGa5MqEKPxcy3ppGQNa6J41Fuua",
      "image_uri": "https://d1zu9f2anwwksd.cloudfront.net/QmVTxxQ3irfq3E7LbwcHGa5MqEKPxcy3ppGQNa6J41Fuua.svg"
    },
    {
      "wearable_id": "244",
      "ipfs_hash": "QmbXfWGoc1nm4S2ARR1eUhvushS974td5vra6BkHCfN6L9",
      "name": "beta pass",
      "trim": "",
      "set": "Doodlebot: Utility",
      "hidden": false,
      "position": "none",
      "plurality": false,
      "ipfs_hash_svg": "Qmdsq27zMFJiZiertMg5nAJp9mbS9sRKhDYo1kPgfFwhdM",
      "image_uri": "https://d1zu9f2anwwksd.cloudfront.net/Qmdsq27zMFJiZiertMg5nAJp9mbS9sRKhDYo1kPgfFwhdM.svg"
    },
    {
      "wearable_id": "93",
      "ipfs_hash": "QmU75Bik2Bf6AcgpceTwa6uT8eeWfuwDVi8Ev1TxgCLscJ",
      "name": "sweater",
      "trim": "navy blue",
      "set": "OG Wearables: Core",
      "hidden": false,
      "position": "torso",
      "plurality": false,
      "ipfs_hash_svg": "QmZ6xqTAjUVvbwJUzFDBUn2mQNyUnKMTkr3FjTvaLZumqd",
      "image_uri": "https://d1zu9f2anwwksd.cloudfront.net/QmZ6xqTAjUVvbwJUzFDBUn2mQNyUnKMTkr3FjTvaLZumqd.svg"
    }
  ]
}
```