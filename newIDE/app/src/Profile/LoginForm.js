// @flow
import { Trans } from '@lingui/macro';
import { ethers } from "ethers";
// import { useAccount, useConnect, useDisconnect } from "wagmi"

import React from 'react';
import TextField from '../UI/TextField';
import {
  type ForgotPasswordForm,
  type AuthError,
  type IdentityProvider,
} from '../Utils/GDevelopServices/Authentication';
import Text from '../UI/Text';
import { getEmailErrorText, getPasswordErrorText } from './CreateAccountDialog';
import {
  ColumnStackLayout,
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../UI/Layout';
import Link from '../UI/Link';
import ForgotPasswordDialog from './ForgotPasswordDialog';
import Form from '../UI/Form';
import { Column, Line, Spacer } from '../UI/Grid';
import FlatButton from '../UI/FlatButton';
import AlertMessage from '../UI/AlertMessage';
import Google from '../UI/CustomSvgIcons/Google';
import Apple from '../UI/CustomSvgIcons/Apple';
import GitHub from '../UI/CustomSvgIcons/GitHub';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import RaisedButton from '../UI/RaisedButton';
import ResponsiveDelimiter from './ResponsiveDelimiter';
import Metamask from '../UI/CustomSvgIcons/Metamask';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useMetaMask } from '../Hooks/useMetaMask';

const getStyles = ({ verticalDesign }) => ({
  createAccountContainer: {
    width: '100%',
  },
  panelContainer: {
    width: verticalDesign ? '100%' : '70%',
  },
  icon: {
    width: 16,
    height: 16,
  },
  backgroundText: {
    width: '100%',
    textAlign: 'start',
  },
});

export const accountsAlreadyExistsWithDifferentProviderCopy = (
  <Trans>
    You already have an account for this email address with a different provider
    (Google, Apple or GitHub). Please try with one of those.
  </Trans>
);

type Props = {|
  onLogin: () => void,
    onLoginWithProvider: (provider: IdentityProvider) => Promise < void>,
      email: string,
        onChangeEmail: string => void,
          password: string,
            onChangePassword: string => void,
              onForgotPassword: (form: ForgotPasswordForm) => Promise < void>,
                loginInProgress: boolean,
                  error: ?AuthError,
                    onGoToCreateAccount ?: () => void,
|};

const LoginForm = ({
  onLogin,
  onLoginWithProvider,
  email,
  onChangeEmail,
  password,
  onChangePassword,
  onForgotPassword,
  loginInProgress,
  error,
  onGoToCreateAccount,
}: Props) => {
  const [
    isForgotPasswordDialogOpen,
    setIsForgotPasswordDialogOpen,
  ] = React.useState(false);

  const { connected, account, connect, disconnect, publicKey } = useMetaMask();

  // const { address, isConnected } = useAccount()
  // const { connectors, connect, isPending } = useConnect()
  // const { disconnect } = useDisconnect()

  const accountsExistsWithOtherCredentials = error
    ? error.code === 'auth/account-exists-with-different-credential'
    : false;

  const { isMobile, isLandscape } = useResponsiveWindowSize();
  const verticalDesign = isMobile && !isLandscape;
  const styles = getStyles({ verticalDesign });

  async function connectMetaMask() {
    if (window.ethereum) {
      try {
        // Request account access
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        console.log("Connected account:", accounts[0]);

        // Create a provider
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        console.log("Wallet connected with address:", await signer.getAddress());
        return signer;
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
      }
    } else {
      console.log("MetaMask is not installed. Please install MetaMask to use this feature.");
    }
  }

  return (
    <>
      <ColumnStackLayout
        noMargin
        expand
        alignItems="stretch"
      >
        <Form onSubmit={onLogin} autoComplete="on" name="login">
          <ColumnStackLayout noMargin>
            {/* {accountsExistsWithOtherCredentials && (
              <AlertMessage kind="warning">
                {accountsAlreadyExistsWithDifferentProviderCopy}
              </AlertMessage>
            )} */}
            <ResponsiveLineStackLayout noMargin noResponsiveLandscape>
              <Column
                expand
                noMargin
                alignItems="center"
                justifyContent="center"
              >
                <div style={styles.panelContainer}>
                  <ColumnStackLayout noMargin>
                    {/* <RaisedButton
                      primary
                      fullWidth
                      label={<Trans>Continue with Google</Trans>}
                      icon={<Google style={styles.icon} />} //hsnnaw
                      onClick={() => {
                        onLoginWithProvider('google');
                      }}
                      disabled={loginInProgress}
                    /> */}
                    {/* <FlatButton
                      style={{ backgroundColor: 'white', color: 'black', width: 270, height: 35, }} //hsnaw
                      primary
                      fullWidth
                      label={<Trans>Continue with Metamask</Trans>}
                      leftIcon={<Metamask style={styles.icon} />}
                      onClick={() => {
                        connect()
                        // onLoginWithProvider('github');
                      }}
                      disabled={loginInProgress}
                    /> */}
                    <WalletMultiButton style={{ backgroundColor: 'rgba(251, 176, 66, 1)', width:'100%', height: 50, borderRadius: 8, fontFamily: 'Orbitron', alignItems:'center', justifyContent:'center', display:'flex' }}>
                      {connected ? "Disconnect" : "Connect"}
                    </WalletMultiButton>
                    {/* <div>
                      {connectors.map((connector) => (
                        <button
                          key={connector.uid}
                          onClick={() => connect({ connector })}
                          disabled={isPending}
                        >
                          {isPending ? "Connecting..." : `Connect ${connector.name}`}
                        </button>
                      ))}
                    </div> */}
                    {/* <FlatButton
                      primary
                      fullWidth
                      label={<Trans>Continue with Apple</Trans>}
                      leftIcon={<Apple style={styles.icon} />}
                      onClick={() => {
                        onLoginWithProvider('apple');
                      }}
                      disabled={loginInProgress}
                    /> */}
                  </ColumnStackLayout>
                </div>
              </Column>
              {/* <ResponsiveDelimiter text={<Trans>or</Trans>} /> */}
              {/* <Column
                expand
                noMargin
                alignItems="center"
                justifyContent="center"
              >
                <div style={styles.panelContainer}>
                  <ColumnStackLayout noMargin>
                    <TextField
                      autoFocus="desktop"
                      value={email}
                      floatingLabelText={<Trans>Email</Trans>}
                      errorText={getEmailErrorText(error)}
                      onChange={(e, value) => {
                        onChangeEmail(value);
                      }}
                      onBlur={event => {
                        onChangeEmail(event.currentTarget.value.trim());
                      }}
                      fullWidth
                      type="email"
                      disabled={loginInProgress}
                    />
                    <TextField
                      value={password}
                      floatingLabelText={<Trans>Password</Trans>}
                      errorText={getPasswordErrorText(error)}
                      type="password"
                      onChange={(e, value) => {
                        onChangePassword(value);
                      }}
                      fullWidth
                      disabled={loginInProgress}
                    />
                    {onGoToCreateAccount && (
                      <div style={styles.createAccountContainer}>
                        <LineStackLayout noMargin>
                          <Text size="body2" noMargin>
                            <Trans>Don't have an account yet?</Trans>
                          </Text>
                          <Link
                            href=""
                            onClick={onGoToCreateAccount}
                            disabled={loginInProgress}
                          >
                            <Text size="body2" noMargin color="inherit">
                              <Trans>Create an account</Trans>
                            </Text>
                          </Link>
                        </LineStackLayout>
                      </div>
                    )}
                  </ColumnStackLayout>
                </div>
              </Column> */}
            </ResponsiveLineStackLayout>
          </ColumnStackLayout>
        </Form>
        {/* <Spacer />
        <Line noMargin justifyContent="center">
          <Link
            href=""
            onClick={() => setIsForgotPasswordDialogOpen(true)}
            disabled={loginInProgress}
          >
            <Text size="body2" noMargin color="inherit">
              <Trans>Did you forget your password?</Trans>
            </Text>
          </Link>
        </Line> */}
      </ColumnStackLayout>
      {/* {isForgotPasswordDialogOpen && (
        <ForgotPasswordDialog
          onClose={() => setIsForgotPasswordDialogOpen(false)}
          onForgotPassword={onForgotPassword}
        />
      )} */}
    </>
  );
};

export default LoginForm;
