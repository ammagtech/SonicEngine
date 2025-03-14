// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Text from '../../UI/Text';
import { ProjectApi } from '../../Utils/GDevelopServices/ApiConfigs';
import { Column, Line, Spacer } from '../../UI/Grid';
import AlertMessage from '../../UI/AlertMessage';
// import { useResponsiveWindowSize } from '../../UI/Responsive/ResponsiveWindowMeasurer';
import { ColumnStackLayout } from '../../UI/Layout';
import Check from '../../UI/CustomSvgIcons/Check';
import RaisedButton from '../../UI/RaisedButton';
import { type ExportFlowProps } from '../ExportPipeline.flow';
import Axios from 'axios';
import Link from '../../UI/Link';
import TextField from '../../UI/TextField';
import { useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { Connection, PublicKey, SystemProgram } from '@solana/web3.js';
import { type GameManager } from './gameManager';

// const getIconStyle = ({ isMobile }: {| isMobile: boolean |}) => {
//   return {
//     height: isMobile ? 30 : 48,
//     width: isMobile ? 30 : 48,
//     margin: 10,
//   };
// };

const PROGRAM_ID = new PublicKey(
  'BcjPFT8JtRywB6R68PiTZowaaz1b9runSR9U2o16jJyN'
);
const IDL = {
  address: 'BcjPFT8JtRywB6R68PiTZowaaz1b9runSR9U2o16jJyN',
  metadata: {
    name: 'game_manager',
    version: '0.1.0',
    spec: '0.1.0',
    description: 'Created with Anchor',
  },
  instructions: [
    {
      name: 'deploy_game',
      discriminator: [105, 217, 28, 20, 150, 155, 121, 119],
      accounts: [
        {
          name: 'game',
          writable: true,
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [103, 97, 109, 101],
              },
              {
                kind: 'arg',
                path: 'title',
              },
              {
                kind: 'account',
                path: 'user',
              },
            ],
          },
        },
        {
          name: 'user',
          writable: true,
          signer: true,
        },
        {
          name: 'system_program',
          address: '11111111111111111111111111111111',
        },
      ],
      args: [
        {
          name: 'title',
          type: 'string',
        },
        {
          name: 'description',
          type: 'string',
        },
      ],
    },
  ],
  accounts: [
    {
      name: 'Game',
      discriminator: [27, 90, 166, 125, 74, 100, 121, 18],
    },
  ],
  types: [
    {
      name: 'Game',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'title',
            type: 'string',
          },
          {
            name: 'description',
            type: 'string',
          },
          {
            name: 'authority',
            type: 'pubkey',
          },
        ],
      },
    },
  ],
};
export const ExplanationHeader = () => {
  // const { isMobile } = useResponsiveWindowSize();
  // const iconStyle = getIconStyle({ isMobile });
  return (
    <Column noMargin>
      <Line>
        <Text align="center">
          <Trans>This will export and deploy your game to Sonic SVM.</Trans>
        </Text>
      </Line>
    </Column>
  );
};

type HTML5ExportFlowProps = {|
  ...ExportFlowProps,
  exportPipelineName: string,
|};

export const ExportFlow = ({
  disabled,
  launchExport,
  isExporting,
  exportPipelineName,
  exportStep,
}: HTML5ExportFlowProps) =>
  exportStep !== 'done' ? (
    <Line justifyContent="center">
      <RaisedButton
        label={
          !isExporting ? <Trans>Build game</Trans> : <Trans>Building...</Trans>
        }
        primary
        id={`launch-export-${exportPipelineName}-button`}
        onClick={launchExport}
        disabled={disabled || isExporting}
      />
    </Line>
  ) : null;

export const DoneFooter = ({
  renderGameButton,
  gameLink,
}: {|
  renderGameButton: () => React.Node,
|}) => {
  const [gameName, setGameName] = React.useState('');
  const [gameDescription, setGameDescription] = React.useState('');
  const [gameThumbnail, setGameThumbnail] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [success, setSuccess] = React.useState(false);
  const [txSignature, setTxSignature] = React.useState(null);
  const wallet = useWallet();

  const handleThumbnailChange = event => {
    setGameThumbnail(event.target.files[0]);
  };

  const deployGameToSolana = async () => {
    try {
      if (!wallet.publicKey || !wallet.signTransaction) {
        throw new Error('Wallet not connected');
      }

      const connection = new Connection(
        'https://api.testnet.sonic.game',
        'confirmed'
      );
      const provider = new AnchorProvider(connection, wallet, {
        commitment: 'confirmed',
      });

      const program = new Program(IDL, provider);

      const [gamePda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('game'),
          Buffer.from(gameName),
          wallet.publicKey.toBuffer(),
        ],
        PROGRAM_ID
      );
      const tx = await program.methods
        .deployGame(gameName, gameDescription)
        .accounts({
          game: gamePda,
          user: wallet.publicKey,
        })
        .rpc();

      setTxSignature(tx);
      console.log('Game deployed to Solana successfully!', tx);
    } catch (err) {
      console.error('Error deploying game to Solana:', err);
      throw err;
    }
  };

  const uploadGameDetails = async () => {
    setError(null);
    setLoading(true);

    if (!wallet.connected) {
      setError('Please connect your wallet first');
      setLoading(false);
      return;
    }

    if (!gameName || !gameDescription || !gameThumbnail) {
      setError('Please complete all fields');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('GameName', gameName);
    formData.append('GameDescription', gameDescription);
    formData.append('GameThumbnail', gameThumbnail);
    formData.append('GameURL', gameLink);

    try {
      await deployGameToSolana();
      await Axios.post(`${ProjectApi.baseUrl}/publish`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setLoading(false);
      setSuccess(true);
    } catch (error) {
      if (
        error.response &&
        (error.response.status === 400 || error.response.status === 500)
      ) {
        setError('Please check your input fields, ensure they are correct');
      } else {
        setError(error.message);
      }
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <Column noMargin alignItems="center">
      {/* <ColumnStackLayout noMargin justifyContent="center" alignItems="center">
       <Text>
          <Trans>Done!</Trans>
        </Text>
        <Spacer />
        <Link href={gameLink} onClick={() => window.open(gameLink, '_blank')}>
          <Text>
            <Trans>Click here to test game</Trans>
          </Text>
        </Link>
      </ColumnStackLayout> */}
      {!success && (
        <>
          <Text>
            <Trans>Please complete this form to complete Publishing.</Trans>
          </Text>
          <Spacer />
          <Text>
            <Trans>Game Name</Trans>
          </Text>
          <TextField
            placeholder={<Trans>Game Name</Trans>}
            onChange={(_, value) => setGameName(value)}
            style={{ width: 300 }}
            value={gameName}
          />
          <Spacer />
          <Text>
            <Trans>Game Description</Trans>
          </Text>
          <TextField
            placeholder={<Trans>Game Description</Trans>}
            onChange={(_, value) => setGameDescription(value)}
            value={gameDescription}
            style={{ width: 300 }}
            multiline
          />
          <Spacer />
          <Text>
            <Trans>Game Thumbnail (image)</Trans>
          </Text>
          <input
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
          />
          <Spacer />
          {error && <AlertMessage kind="error">{error}</AlertMessage>}
          <Spacer />
          <Line justifyContent="center">
            <RaisedButton
              label={
                !loading ? (
                  <Trans>Deploy Now</Trans>
                ) : (
                  <Trans>Uploading...</Trans>
                )
              }
              primary
              onClick={uploadGameDetails}
              disabled={!gameName || loading}
            />
          </Line>
        </>
      )}
      {success && (
        <Column>
          <Text size="sub-title" style={{ textAlign: 'center', marginTop: 10 }}>
            <Trans>
              Congratulations! Your game has been successfully published and is
              now available in the Play tab.
            </Trans>
          </Text>
          {txSignature && (
            <Line justifyContent="center" style={{ marginTop: 10 }}>
              <Link
                href={`https://explorer.sonic.game/tx/${txSignature}?cluster=testnet.v1`}
                onClick={() =>
                  window.open(
                    `https://explorer.sonic.game/tx/${txSignature}?cluster=testnet.v1`,
                    '_blank'
                  )
                }
              >
                <Text>
                  <Trans>View Transaction</Trans>
                </Text>
              </Link>
            </Line>
          )}
        </Column>
      )}
    </Column>
  );
};

export const html5Exporter = {
  key: 'publishgame',
  tabName: <Trans>Deploy to Sonic</Trans>,
  name: <Trans>Deploy your game to Sonic SVM</Trans>,
  helpPage: '/publishing/Publish_html5_game_in_a_local_folder',
};
