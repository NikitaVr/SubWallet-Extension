// Copyright 2019-2022 @polkadot/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import MoonpayLogo from '@subwallet/extension-koni-ui/assets/logo/125.Moonpay.png';
import MoonpayDarkLogo from '@subwallet/extension-koni-ui/assets/logo/127.MoonpayDark.png';
import Tooltip from '@subwallet/extension-koni-ui/components/Tooltip';
import { Theme, ThemeProps } from '@subwallet/extension-koni-ui/types';
import CN from 'classnames';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import styled, { ThemeContext } from 'styled-components';

interface Props extends ThemeProps{
  className?: string;
  networkKey: string;
  formattedAddress: string;
}

// const HOST = {
//   STAGING: 'https://staging-global.Moonpay.com',
//   PRODUCTION: 'https://global.Moonpay.com'
// };

const MoonpayArea = (props: Props) => {
  const { className } = props;
  const themeGroup = useContext(ThemeContext as React.Context<Theme>).group;
  const [logo, setLogo] = useState(themeGroup === 'Dark' ? MoonpayLogo : MoonpayDarkLogo);

  useEffect(() => {
    setLogo(themeGroup === 'dark' ? MoonpayLogo : MoonpayDarkLogo);
  }, [themeGroup]);

  const url = useMemo((): string => {
    return '';
    // const host = HOST.PRODUCTION;
    //
    // const _network = PREDEFINED_TRANSAK_NETWORK[networkKey];
    //
    // if (!_network) {
    //   return '';
    // }
    //
    // const networks = [..._network.networks];
    // const tokenList = [..._network.tokens];
    // const defaultToken = tokenList[0];
    //
    // const params = {
    //   apiKey: '4b3bfb00-7f7c-44b3-844f-d4504f1065be',
    //   defaultCryptoCurrency: defaultToken,
    //   cryptoCurrencyList: tokenList.join(','),
    //   networks: networkKey !== 'shiden' ? networks.join(',') : undefined,
    //   // disableWalletAddressForm: true,
    //   walletAddress: formattedAddress
    // };
    // const query = qs.stringify(params);
    //
    // return `${host}?${query}`;
  }, []);

  return (
    <div className={CN(className)}>
      {
        !url
          ? (
            <div
              data-for='moonpay-button'
              data-tip={true}
            >
              <img
                alt='Moonpay logo'
                className='img-logo disabled'
                src={logo}
              />
            </div>
          )
          : (
            <a
              href={url}
              rel='noreferrer'
              target='_blank'
            >
              <img
                alt='Moonpay logo'
                className='img-logo'
                src={logo}
              />
            </a>
          )
      }
      <Tooltip
        offset={{
          bottom: 10
        }}
        place='bottom'
        text={'Coming soon'}
        trigger={'moonpay-button'}
      />
    </div>
  );
};

export default React.memo(styled(MoonpayArea)(({ theme }: Props) => `
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .img-logo {
    width: 264px;

    &.disabled {
      opacity: ${theme.buyServiceOpacity};
    }
  }
`));
