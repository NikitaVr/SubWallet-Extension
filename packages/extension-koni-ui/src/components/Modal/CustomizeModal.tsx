// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { RootState } from '@subwallet/extension-koni-ui/stores';
import { updateShowZeroBalanceState } from '@subwallet/extension-koni-ui/stores/utils';
import { Theme, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { BackgroundIcon, SettingItem, Switch, SwModal } from '@subwallet/react-ui';
import { Wallet } from 'phosphor-react';
import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import styled, { useTheme } from 'styled-components';

const CustomizeModalContent = React.lazy(() => import('@subwallet/extension-koni-ui/components/Modal/CustomizeModalContent'));

type Props = ThemeProps & {
  id: string,
  onCancel: () => void,
}

function Component ({ className = '', id, onCancel }: Props): React.ReactElement<Props> {
  const { token } = useTheme() as Theme;
  const isShowZeroBalance = useSelector((state: RootState) => state.settings.isShowZeroBalance);

  const onChangeZeroBalance = useCallback((checked: boolean) => {
    updateShowZeroBalanceState(checked);
  }, []);

  return (
    <SwModal
      className={className}
      id={id}
      onCancel={onCancel}
      title={'Select token'} // todo: i18n this
    >
      <div className={'__group-label'}>Balance</div>
      <div className={'__group-content'}>
        <SettingItem
          className={'__setting-item'}
          leftItemIcon={
            <BackgroundIcon
              backgroundColor={token['green-6']}
              iconColor={token.colorTextLight1}
              phosphorIcon={Wallet}
              size='sm'
              type='phosphor'
              weight='fill'
            />
          }
          name={'Show zero balance'} // todo: i18n this
          rightItem={
            <Switch
              checked={isShowZeroBalance}
              onClick={onChangeZeroBalance}
              style={{ marginRight: 8 }}
            />}
        />
      </div>

      <CustomizeModalContent />
    </SwModal>
  );
}

export const CustomizeModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    '.ant-sw-modal-body': {
      padding: 0,
      display: 'flex',
      flexDirection: 'column'
    },

    '.__group-label': {
      paddingLeft: token.padding,
      paddingRight: token.padding,
      color: token.colorTextLight3,
      textTransform: 'uppercase',
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM,
      marginBottom: token.marginXS
    },

    '.__group-content': {
      paddingLeft: token.padding,
      paddingRight: token.padding,
      marginBottom: token.marginXS
    },

    '.__setting-item .ant-setting-item-content': {
      paddingTop: 0,
      paddingBottom: 0,
      height: 52,
      alignItems: 'center'
    },

    '.ant-sw-list-section': {
      flex: 1
    },

    '.ant-sw-list-wrapper': {
      overflow: 'auto'
    },

    '.network_item__container .ant-web3-block-right-item': {
      marginRight: 0
    }
  });
});
