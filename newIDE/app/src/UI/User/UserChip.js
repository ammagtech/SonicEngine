// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { getGravatarUrl } from '../GravatarUrl';
import RaisedButton from '../RaisedButton';
import { shortenString } from '../../Utils/StringHelpers';
import TextButton from '../TextButton';
import { LineStackLayout } from '../Layout';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import CircularProgress from '../CircularProgress';
import { SubscriptionSuggestionContext } from '../../Profile/Subscription/SubscriptionSuggestionContext';
import { hasValidSubscriptionPlan } from '../../Utils/GDevelopServices/Usage';
import CrownShining from '../CustomSvgIcons/CrownShining';
import UserAvatar from './UserAvatar';
import { useResponsiveWindowSize } from '../Responsive/ResponsiveWindowMeasurer';
import IconButton from '../IconButton';
import FlatButton from '../FlatButton';
import { useMetaMask } from '../../Hooks/useMetaMask';
import { WalletDisconnectButton, WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const styles = {
  buttonContainer: { flexShrink: 0 },
};

const GetPremiumButton = () => {
  const { openSubscriptionDialog } = React.useContext(
    SubscriptionSuggestionContext
  );
  return (
    <RaisedButton
      icon={<CrownShining />}
      onClick={() => {
        openSubscriptionDialog({
          analyticsMetadata: {
            reason: 'Account get premium',
            recommendedPlanId: 'gdevelop_silver',
          },
        });
      }}
      id="get-premium-button"
      label={<Trans>Get premium</Trans>}
      color="premium"
    />
  );
};

type Props = {|
  onOpenProfile: () => void,
|};

const UserChip = ({ onOpenProfile }: Props) => {
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const {
    profile,
    onOpenCreateAccountDialog,
    onOpenLoginDialog,
    loginState,
    subscription,
  } = authenticatedUser;
  const { connected, account, connect, disconnect, publicKey } = useMetaMask();

  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isPremium = hasValidSubscriptionPlan(subscription);
  const { isMobile } = useResponsiveWindowSize();

  return !profile && loginState === 'loggingIn' ? (
    <CircularProgress size={25} />
  ) : profile ? (
    <LineStackLayout noMargin>
      {!isMobile ? (
        <TextButton
          label={shortenString(profile.username || profile.email, 20)}
          onClick={onOpenProfile}
          allowBrowserAutoTranslate={false}
          icon={
            <UserAvatar
              iconUrl={getGravatarUrl(profile.email || '', { size: 50 })}
              isPremium={isPremium}
            />
          }
        />
      ) : (
        <IconButton size="small" onClick={onOpenProfile}>
          <UserAvatar
            iconUrl={getGravatarUrl(profile.email || '', { size: 50 })}
            isPremium={isPremium}
          />
        </IconButton>
      )}
      {isPremium ? null : <GetPremiumButton />}
    </LineStackLayout>
  ) : (
    <div style={styles.buttonContainer}>
      {/* hsnnaw */}
      <LineStackLayout noMargin alignItems="center">
        {/* <FlatButton
          label={
            <span>
              <Trans>Log in</Trans>
            </span>
          }
          onClick={onOpenLoginDialog}
          primary
        />
        <RaisedButton
          style={{ backgroundColor: 'rgba(237, 27, 118, 1)' }} //hsnnaw
          label={
            <span>
              <Trans>Sign up</Trans>
            </span>
          }
          onClick={onOpenCreateAccountDialog}
          primary
        /> */}
        {!connected ? (
          // <FlatButton
          //   label={<span><Trans>Connect Wallet</Trans></span>}
          //   onClick={connect}
          //   primary
          // />
          <WalletMultiButton onClick={connect} style={{ backgroundColor: 'rgba(251, 176, 66, 1)', height:28, borderRadius:8, fontFamily:'Orbitron' }}>
            {connected ? "Disconnect" : "Connect"}
          </WalletMultiButton>
          // {/* // <WalletDisconnectButton /> */}
        ) : (
          <LineStackLayout noMargin alignItems="center">
            <FlatButton
              label={<span>{truncateAddress(publicKey?.toBase58())}</span>}
              primary
              disabled
            />
            {/* <FlatButton
              label={<span><Trans>Disconnect</Trans></span>}
              onClick={disconnect}
              style={{ marginLeft: 8 }}
            /> */}
            <WalletDisconnectButton style={{ backgroundColor: 'rgba(251, 176, 66, 1)', height:28, width:175, borderRadius:8, fontFamily:'Orbitron' }} />
          </LineStackLayout>
        )}
      </LineStackLayout>
    </div>
  );
};

export default UserChip;
