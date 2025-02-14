// Copyright 2019-2022 @subwallet/extension-koni-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CustomTokenJson, CustomTokenType, NetworkJson } from '@subwallet/extension-base/background/KoniTypes';
import { isEqualContractAddress } from '@subwallet/extension-koni-base/api/tokens';
import { DEFAULT_WASM_TOKENS } from '@subwallet/extension-koni-base/api/tokens/wasm/defaultWasmToken';
import { PSP22Contract, PSP34Contract, ShidenPSP34Contract } from '@subwallet/extension-koni-base/api/tokens/wasm/helper';

import { ApiPromise } from '@polkadot/api';
import { Abi, ContractPromise } from '@polkadot/api-contract';

export const CHAINS_WITH_WEIGHT_V2 = ['shiden', 'astar', 'shibuya'];

export function getWasmContractGasLimit (chain: string, apiPromise: ApiPromise) {
  return { gasLimit: CHAINS_WITH_WEIGHT_V2.includes(chain) ? getWeightV2(apiPromise) : -1 };
}

export function getWeightV2 (apiPromise: ApiPromise) {
  const proofSize = 3407872;
  const refTime = 32490000000;

  return apiPromise.registry.createType('WeightV2', {
    refTime,
    proofSize
  });
}

export async function validateWasmToken (chain: string, contractAddress: string, tokenType: CustomTokenType.psp22 | CustomTokenType.psp34, apiPromise: ApiPromise, contractCaller?: string) {
  let tokenContract: ContractPromise;
  let name = '';
  let decimals: number | undefined = -1;
  let symbol = '';
  let contractError = false;

  try {
    if (tokenType === CustomTokenType.psp22) {
      tokenContract = new ContractPromise(apiPromise, PSP22Contract, contractAddress);

      const [nameResp, symbolResp, decimalsResp] = await Promise.all([
        tokenContract.query['psp22Metadata::tokenName'](contractCaller || contractAddress, { gasLimit: -1 }), // read-only operation so no gas limit
        tokenContract.query['psp22Metadata::tokenSymbol'](contractCaller || contractAddress, { gasLimit: -1 }),
        tokenContract.query['psp22Metadata::tokenDecimals'](contractCaller || contractAddress, { gasLimit: -1 })
      ]);

      if (!(nameResp.result.isOk && symbolResp.result.isOk && decimalsResp.result.isOk) || !nameResp.output || !decimalsResp.output || !symbolResp.output) {
        console.error('Error response while validating WASM contract');

        return {
          name: '',
          decimals: -1,
          symbol: '',
          contractError: true
        };
      } else {
        name = symbolResp.output?.toHuman() as string;
        decimals = parseInt(decimalsResp.output?.toHuman() as string);
        symbol = symbolResp.output?.toHuman() as string;

        if (name === '' || symbol === '') {
          contractError = true;
        }
      }
    } else {
      if (['astar', 'shiden', 'shibuya'].includes(chain)) {
        const abi = new Abi(ShidenPSP34Contract, apiPromise.registry.getChainProperties());

        tokenContract = new ContractPromise(apiPromise, abi, contractAddress);
      } else {
        tokenContract = new ContractPromise(apiPromise, PSP34Contract, contractAddress);
      }

      // @ts-ignore
      const collectionIdResp = await tokenContract.query['psp34::collectionId'](contractCaller || contractAddress, getWasmContractGasLimit(chain, apiPromise)); // read-only operation so no gas limit

      if (!collectionIdResp.result.isOk || !collectionIdResp.output) {
        console.error('Error response while validating WASM contract');

        return {
          name: '',
          decimals: -1,
          symbol: '',
          contractError: true
        };
      } else {
        const collectionIdDict = collectionIdResp.output?.toHuman() as Record<string, string>;

        if (collectionIdDict.Bytes === '') {
          contractError = true;
        } else {
          name = ''; // no function to get collection name, let user manually put in the name
        }
      }
    }

    return {
      name,
      decimals,
      symbol,
      contractError
    };
  } catch (e) {
    console.error('Error validating WASM contract', e);

    return {
      name: '',
      decimals: -1,
      symbol: '',
      contractError: true
    };
  }
}

export function initWasmTokenState (customTokenState: CustomTokenJson, networkMap: Record<string, NetworkJson>) {
  const wasmTokenState = { psp22: customTokenState.psp22 || [], psp34: customTokenState.psp34 || [] };

  for (const defaultToken of DEFAULT_WASM_TOKENS.psp22) {
    let exist = false;

    for (const storedToken of wasmTokenState.psp22) {
      if (isEqualContractAddress(defaultToken.smartContract, storedToken.smartContract) && defaultToken.chain === storedToken.chain) {
        if (storedToken.isCustom) {
          // if existed, migrate the custom token -> default token
          delete storedToken.isCustom;
        }

        exist = true;
        break;
      }
    }

    if (!exist) {
      wasmTokenState.psp22.push(defaultToken);
    }
  }

  for (const defaultToken of DEFAULT_WASM_TOKENS.psp34) {
    let exist = false;

    for (const storedToken of wasmTokenState.psp34) {
      if (isEqualContractAddress(defaultToken.smartContract, storedToken.smartContract) && defaultToken.chain === storedToken.chain) {
        if (storedToken.isCustom) {
          // if existed, migrate the custom token -> default token
          delete storedToken.isCustom;
        }

        exist = true;
        break;
      }
    }

    if (!exist) {
      wasmTokenState.psp34.push(defaultToken);
    }
  }

  // Update networkKey in case networkMap change
  for (const token of wasmTokenState.psp22) {
    if (!(token.chain in networkMap) && token.chain.startsWith('custom_')) {
      let newKey = '';
      const genesisHash = token.chain.split('custom_')[1]; // token from custom network has key with prefix custom_

      for (const [key, network] of Object.entries(networkMap)) {
        if (network.genesisHash.toLowerCase() === genesisHash.toLowerCase()) {
          newKey = key;
          break;
        }
      }

      token.chain = newKey;
    }
  }

  for (const token of wasmTokenState.psp34) {
    if (!(token.chain in networkMap) && token.chain.startsWith('custom_')) {
      let newKey = '';
      const genesisHash = token.chain.split('custom_')[1]; // token from custom network has key with prefix custom_

      for (const [key, network] of Object.entries(networkMap)) {
        if (network.genesisHash.toLowerCase() === genesisHash.toLowerCase()) {
          newKey = key;
          break;
        }
      }

      token.chain = newKey;
    }
  }

  return wasmTokenState;
}
