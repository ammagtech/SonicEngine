// @flow
import * as React from 'react';

import MuiLinearProgress from '@material-ui/core/LinearProgress';
import { makeStyles } from '@material-ui/core';
import GDevelopThemeContext from './Theme/GDevelopThemeContext';

const styles = {
  linearProgress: { flex: 1 },
};

type Props = {|
  expand?: boolean,
  value?: ?number,
|};

function ColoredLinearProgress(props: Props) {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const classes = makeStyles({
    root: {
      height: 10,
      borderRadius: 5,
    },
    colorPrimary: {
      backgroundColor: gdevelopTheme.paper.backgroundColor.medium,
    },
    bar: {
      borderRadius: 5,
      backgroundImage: `linear-gradient(90deg, rgba(0, 0, 255, 1), rgba(251, 176, 66, 1))` //hsnnaw
      // backgroundColor:
      //   props.value === 100
      //     ? gdevelopTheme.linearProgress.color.complete
      //     // : gdevelopTheme.linearProgress.color.incomplete,
      //     : 'rgba(52, 77, 246, 1)',
    },
  })();

  return (
    <MuiLinearProgress
      classes={classes}
      style={styles.linearProgress}
      variant="determinate"
      value={props.value}
    />
  );
}

export default ColoredLinearProgress;
