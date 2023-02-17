const dooplicateItem = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "dooplicationAddress",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "tokenAddress",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "dooplicatorId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "bytes8",
        "name": "addressOnTheOtherSide",
        "type": "bytes8"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "dooplicateItem",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];

const dooplicate = [
  {
    "inputs": [
        {
            "internalType": "uint256",
            "name": "dooplicatorId",
            "type": "uint256"
        },
        {
            "internalType": "address",
            "name": "dooplicatorVault",
            "type": "address"
        },
        {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
        },
        {
            "internalType": "address",
            "name": "tokenContract",
            "type": "address"
        },
        {
            "internalType": "address",
            "name": "tokenVault",
            "type": "address"
        },
        {
            "internalType": "bytes8",
            "name": "addressOnTheOtherSide",
            "type": "bytes8"
        },
        {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
        }
    ],
    "name": "dooplicate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const DOOPMARKET_ADDRESS = '0xcdef9b7949869cbeddcaeb398445e5972d8f564c';
const DOOPLICATOR_ADDRESS = '0x36c3ec16da484240f74d05c0213186a3248e0e48';
const DOPLICATION_BLOCK = 16508485;
const doopContracts = {
  [DOOPMARKET_ADDRESS]: dooplicateItem,
  [DOOPLICATOR_ADDRESS]: dooplicate
};

module.exports = {
  DOOPMARKET_ADDRESS,
  DOOPLICATOR_ADDRESS,
  DOPLICATION_BLOCK,
  doopContracts
};
