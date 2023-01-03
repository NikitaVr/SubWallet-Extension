// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { StakingRewardJson } from '@subwallet/extension-base/background/KoniTypes';
import { EXTENSION_PREFIX } from '@subwallet/extension-base/defaults';
import SubscribableStore from '@subwallet/extension-base/stores/SubscribableStore';

export default class StakingRewardStore extends SubscribableStore<StakingRewardJson> {
  constructor () {
    super(EXTENSION_PREFIX ? `${EXTENSION_PREFIX}stakingReward` : null);
  }
}
