// js/config.js

export const SEPOLIA_CHAIN_ID = 11155111; 
export const SEPOLIA_CHAIN_ID_HEX = '0xaa36a7';

export const CONTRACT_ADDRESS = "0x6d8BE3FD24d9c1c8623EfA5f1669c62181F62D12";

export const CONTRACT_ABI =[
  { "inputs": [], "name": "ECDSAInvalidSignature", "type": "error" },
  {
    "inputs": [
      { "internalType": "uint256", "name": "length", "type": "uint256" }
    ],
    "name": "ECDSAInvalidSignatureLength",
    "type": "error"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "s", "type": "bytes32" }],
    "name": "ECDSAInvalidSignatureS",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "string",
        "name": "ipfsHash",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "signerAttempted",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "recoveredAddr",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "ethSignedMessageHashCalculated",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "currentChainId",
        "type": "uint256"
      }
    ],
    "name": "DebugSignatureVerification",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "string",
        "name": "docHash",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "signer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "partyType",
        "type": "string"
      }
    ],
    "name": "DocumentSigned",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "uploader",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "hash",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "originalFileName",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "partyA",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "partyAAddress",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "partyB",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "partyBAddress",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "contractType",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "contractDate",
        "type": "string"
      }
    ],
    "name": "DocumentUploaded",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_ipfsHash", "type": "string" },
      { "internalType": "bytes", "name": "_signature", "type": "bytes" }
    ],
    "name": "signAsPartyA",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_ipfsHash", "type": "string" },
      { "internalType": "bytes", "name": "_signature", "type": "bytes" }
    ],
    "name": "signAsPartyB",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_ipfsHash", "type": "string" },
      {
        "internalType": "string",
        "name": "_originalFileName",
        "type": "string"
      },
      { "internalType": "string", "name": "_partyA", "type": "string" },
      {
        "internalType": "address",
        "name": "_partyAAddress",
        "type": "address"
      },
      { "internalType": "string", "name": "_partyB", "type": "string" },
      {
        "internalType": "address",
        "name": "_partyBAddress",
        "type": "address"
      },
      { "internalType": "string", "name": "_contractType", "type": "string" },
      { "internalType": "string", "name": "_contractDate", "type": "string" }
    ],
    "name": "uploadDocument",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_ipfsHash", "type": "string" }
    ],
    "name": "getDocumentDetail",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "ipfsHash", "type": "string" },
          { "internalType": "string", "name": "fileName", "type": "string" },
          { "internalType": "string", "name": "partyA", "type": "string" },
          {
            "internalType": "address",
            "name": "partyAAddress",
            "type": "address"
          },
          { "internalType": "string", "name": "partyB", "type": "string" },
          {
            "internalType": "address",
            "name": "partyBAddress",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "contractType",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "contractDate",
            "type": "string"
          },
          { "internalType": "address", "name": "uploader", "type": "address" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "bool", "name": "isPartyASigned", "type": "bool" },
          { "internalType": "bool", "name": "isPartyBSigned", "type": "bool" }
        ],
        "internalType": "struct DocumentVerification.DocumentDisplayInfo",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_ipfsHash", "type": "string" }
    ],
    "name": "getDocumentMetadata",
    "outputs": [
      { "internalType": "string", "name": "partyA", "type": "string" },
      { "internalType": "address", "name": "partyAAddress", "type": "address" },
      { "internalType": "string", "name": "partyB", "type": "string" },
      { "internalType": "address", "name": "partyBAddress", "type": "address" },
      { "internalType": "string", "name": "contractType", "type": "string" },
      { "internalType": "string", "name": "contractDate", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_user", "type": "address" }
    ],
    "name": "getUserDocumentDetails",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "ipfsHash", "type": "string" },
          { "internalType": "string", "name": "fileName", "type": "string" },
          { "internalType": "string", "name": "partyA", "type": "string" },
          {
            "internalType": "address",
            "name": "partyAAddress",
            "type": "address"
          },
          { "internalType": "string", "name": "partyB", "type": "string" },
          {
            "internalType": "address",
            "name": "partyBAddress",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "contractType",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "contractDate",
            "type": "string"
          },
          { "internalType": "address", "name": "uploader", "type": "address" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "bool", "name": "isPartyASigned", "type": "bool" },
          { "internalType": "bool", "name": "isPartyBSigned", "type": "bool" }
        ],
        "internalType": "struct DocumentVerification.DocumentDisplayInfo[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_user", "type": "address" }
    ],
    "name": "getUserDocuments",
    "outputs": [{ "internalType": "string[]", "name": "", "type": "string[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_ipfsHash", "type": "string" }
    ],
    "name": "isPartyASigned",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_ipfsHash", "type": "string" }
    ],
    "name": "isPartyBSigned",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_ipfsHash", "type": "string" }
    ],
    "name": "verifyDocument",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" },
      { "internalType": "address", "name": "", "type": "address" },
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]
