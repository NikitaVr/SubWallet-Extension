// Copyright 2019-2022 @subwallet/extension-koni-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ScProvider } from '@polkadot/rpc-provider';
import { ProviderInterface, ProviderInterfaceCallback, ProviderInterfaceEmitCb, ProviderInterfaceEmitted } from '@polkadot/rpc-provider/types';

export const relayChainSpecs: Record<string, string> = {
  kusama: ScProvider.WellKnownChain.ksmcc3,
  polkadot: ScProvider.WellKnownChain.polkadot,
  rococo: ScProvider.WellKnownChain.rococo_v2_2,
  westend: ScProvider.WellKnownChain.westend2
};

// Direct get spec data from @polkadot/react-api repository
const sourceFolderUrl = 'https://raw.githubusercontent.com/polkadot-js/apps/master/packages/react-api/src/light/';

export const paraChainSpecs: Record<string, string> = {
  'kusama/shiden': `${sourceFolderUrl}kusama/shiden.json`,
  'kusama/tinkernet': `${sourceFolderUrl}kusama/tinkernet.json`,
  'polkadot/astar': `${sourceFolderUrl}polkadot/astar.json`
};

class ProviderPlaceholder implements ProviderInterface {
  private readonly providerPromise: Promise<ScProvider>;

  private provider?: ScProvider;

  constructor (providerPromise: Promise<ScProvider>) {
    this.providerPromise = providerPromise;

    providerPromise
      .then((provider) => {
        this.provider = provider;
      })
      .catch(console.error);
  }

  get hasSubscriptions () {
    return true;
  }

  get isClonable () {
    if (this.provider) {
      return this.provider.isClonable;
    } else {
      return false;
    }
  }

  get isConnected () {
    if (this.provider) {
      return this.provider.isConnected;
    } else {
      return false;
    }
  }

  clone (): ProviderInterface {
    // @ts-ignore
    return this.provider?.clone();
  }

  async connect () {
    await this.providerPromise;
    await this.provider?.connect();
  }

  async disconnect () {
    await this.providerPromise;
    await this.provider?.disconnect();
  }

  on (type: ProviderInterfaceEmitted, sub: ProviderInterfaceEmitCb): () => void {
    let cancel = false;

    let unsub = () => {
      cancel = false;
    };

    this.providerPromise.then((provider: ProviderInterface) => {
      if (!cancel) {
        unsub = provider.on(type, sub);
      }
    }).catch(console.error);

    return () => {
      unsub();
    };
  }

  send<T = any> (method: string, params: unknown[], isCacheable?: boolean): Promise<T> {
    if (this.provider) {
      return this.provider.send<T>(method, params);
    }

    return this.providerPromise.then((provider) => {
      return provider.send<T>(method, params);
    });
  }

  subscribe (type: string, method: string, params: unknown[], cb: ProviderInterfaceCallback): Promise<number | string> {
    if (this.provider) {
      return this.provider.subscribe(type, method, params, cb);
    }

    return this.providerPromise.then((provider) => {
      return provider.subscribe(type, method, params, cb);
    });
  }

  unsubscribe (type: string, method: string, id: number | string): Promise<boolean> {
    if (this.provider) {
      return this.provider.unsubscribe(type, method, id);
    }

    return this.providerPromise.then((provider) => {
      return provider.unsubscribe(type, method, id);
    });
  }
}

export function getSubstrateConnectProvider (specLink: string): ProviderInterface {
  const [relayName, paraName] = specLink.split('/');
  const relaySpec: string = relayChainSpecs[relayName];

  const relayProvider = new ScProvider(relaySpec);

  if (!paraName) {
    return relayProvider;
  }

  const paraChainData = paraChainSpecs[specLink];
  let scProvider: ScProvider | undefined;
  const scPromise = fetch(paraChainData).then((rs) => rs.text()).then((spec) => {
    scProvider = new ScProvider(spec, relayProvider);

    return scProvider;
  }).catch(console.error) as Promise<ScProvider>;

  return new ProviderPlaceholder(scPromise);
}
