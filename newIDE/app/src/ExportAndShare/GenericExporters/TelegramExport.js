// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Text from '../../UI/Text';
import { TelegramApi } from '../../Utils/GDevelopServices/ApiConfigs';
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

// const getIconStyle = ({ isMobile }: {| isMobile: boolean |}) => {
//   return {
//     height: isMobile ? 30 : 48,
//     width: isMobile ? 30 : 48,
//     margin: 10,
//   };
// };

export const ExplanationHeader = () => {
  // const { isMobile } = useResponsiveWindowSize();
  // const iconStyle = getIconStyle({ isMobile });
  return (
    <Column noMargin>
      <Line>
        <Text align="center">
          <Trans>
          This will export and deploy your game to our secure hosting service, then automatically configure it as a Telegram Mini App for your bot. Once completed, players can instantly access your game through your Telegram bot.
          </Trans>
        </Text>
      </Line>
      {/* <Line justifyContent="center">
        <ItchIo color="secondary" style={iconStyle} />
        <GameJolt color="secondary" style={iconStyle} />
        <Poki color="secondary" style={iconStyle} />
        <CrazyGames color="secondary" style={iconStyle} />
        <NewsGround color="secondary" style={iconStyle} />
      </Line> */}
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
          !isExporting ? (
            <Trans>Build game</Trans>
          ) : (
            <Trans>Building...</Trans>
          )
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
  gameLink
}: {|
  renderGameButton: () => React.Node,
|}) => {
  const [botName, setBotName] = React.useState('');
  //Creating Bot state
  const [loading, setLoading] = React.useState(false);

  const [error, setError] = React.useState(null);
  const [success, setSuccess] = React.useState(false);

  // call api to create telegram bot with game link, axios
  const createTelegramBot = (botName: string) => {
    setError(null);
    setLoading(true);
    console.log(botName);
    Axios.post(`${TelegramApi.baseUrl}/createBot`, {
      botToken: botName,
      gameLink: gameLink
    })
      .then((response) => {
        console.log(response);
        setLoading(false);
        setSuccess(true);
      })
      .catch((error) => {
        if (error.response && (error.response.status === 400 || error.response.status === 500)) {

          setError("Please check your bot access token, ensure it is correct");
        } else {
          setError(error.message);
        } 
        console.log(error);
        setLoading(false);

      });
  };

  return (
    <Column noMargin alignItems="center">
      <ColumnStackLayout noMargin justifyContent="center" alignItems="center">
        <Text>
          <Trans>Done!</Trans>
        </Text>
        <Spacer />
        <Link href={gameLink} onClick={() => window.open(gameLink, '_blank')}>
          <Text>
            <Trans>Click here to test game</Trans>
          </Text>
        </Link>
      </ColumnStackLayout>
      {/* <ColumnStackLayout justifyContent="center">
        <Line justifyContent="center">{renderGameButton()}</Line>
       
      </ColumnStackLayout>
      <Spacer /> */}
      {!success&&<><Text>
        <Trans>
          Enter bot access token. you can get it from BotFather. here are the step by step to get the token
        </Trans>
      </Text>
      <Spacer /> {/* Added Spacer for better layout */}
      <Text>
        <b>Step 1</b> : Open Telegram and search for @BotFather

      </Text>
      <Text>
        <b>Step 2</b> : Send the command /newbot to create a new bot.
      </Text>
      <Text>
        <b>Step 3</b> : Follow the instructions to set up your bot and receive your bot access token.
      </Text>

      <Link href="https://core.telegram.org/bots#6-botfather" onClick={() => window.open('https://core.telegram.org/bots#6-botfather', '_blank')}>
        <Text>
          
          <Trans>BotFather Instructions</Trans>
        </Text>
      </Link>
      <Spacer /> {/* Added Spacer for better layout */}
      
      {/* <Text>
        <Trans>Enter Bot Access Token:</Trans>
      </Text> */}
      <TextField
        placeholder={<Trans>Bot access Token</Trans>}
        onChange={(_, value) => setBotName(value)}
        value={botName}
      />
      <Spacer />
      {error && (
        <AlertMessage kind="error">
          {error}
        </AlertMessage>
      )}
      <Spacer /> {/* Added Spacer for better layout */}
      <Line justifyContent="center">
        <RaisedButton
          label={
            !loading ? (

              <Trans>Create Game for bot</Trans>
            ) : (
              <Trans>Creating...</Trans>
            )
          }
          primary
          onClick={() => createTelegramBot(botName)}

          disabled={!botName || loading}
        />
      </Line>
      </>}
      {success && (
        <Column>
          <Check />
          <Text
            size="title"
            style={{ textAlign: 'center', marginTop: 10 }}
          >
            
            {<Trans>Your Game has been created successfully!, please check your telegram bot</Trans>}
          </Text>
        </Column>
      )}
      </Column>
  );
};

export const html5Exporter = {
  key: 'telegramexport',
  tabName: <Trans>Telegram Mini App</Trans>,
  name: <Trans>Telegram Mini App</Trans>,
  helpPage: '/publishing/telegram_html5_game_in_a_local_folder',
};
