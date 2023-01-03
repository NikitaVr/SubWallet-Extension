// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset } from '@subwallet/chain/types';
import BaseStore from '@subwallet/extension-koni-base/db-stores/BaseStore';

export default class AssetStore extends BaseStore<_ChainAsset> {
  async getAll () {
    return this.table.toArray();
  }

  async removeAssets (keys: string[]) {
    return this.table.where('slug').anyOfIgnoreCase(keys).delete();
  }
}
