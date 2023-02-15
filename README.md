# Doopmarketeer API
This is single endpoint to get all dooplication transactions whether from Doopmarket or directly from Dooplicator. I'm using Etherscan API to get transactions by account.

Requirements:

- Etherscan API Key

### Request

```
/getDoops?address=0x0000ADDRESSHERE
```
### Response
```
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

# .env File
This project uses dotenv for environment variables. You will need to provide these if you want it to work.
```
ETHERSCAN_API_KEY="SECRET"
```