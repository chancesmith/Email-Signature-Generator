import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import { Button, Container, TextField, Typography } from '@material-ui/core';
import Logo from './assets/Logo.png';
import Signature from './Signature';
import { CheckOutlined, FileCopyOutlined } from '@material-ui/icons';
import CircularProgressWithLabel from './CircularProgressWithLabel';
import './App.css';

const useStyles = makeStyles((theme: Theme) =>
  // Styles for the web app
  createStyles({
    root: {
      '& .MuiTextField-root': {
        margin: theme.spacing(1),
      },
      '& .label-root': {
        margin: theme.spacing(1),
      },
    },
    paper: {
      padding: theme.spacing(2),
      textAlign: 'left',
      color: theme.palette.text.secondary,
    },
    centeredImage: {
      display: 'block',
      marginLeft: 'auto',
      marginRight: 'auto',
      width: '374px',
      height: '200px',
    },
    centeredText: {
      textAlign: 'center',
    },
    warningIconStyle: {
      textAlign: 'center',
      color: '#FFDC00',
      verticalAlign: 'middle',
    },
  })
);

export interface PhotoSignatureProps {
  fullName: string;
  credentials: string;
  title: string;
  phone: string;
  mobile: string;
  calendlyLink: string;
}

interface State extends PhotoSignatureProps {
  copied: boolean;
}

const initialState: State = {
  fullName: '',
  credentials: '',
  title: '',
  phone: '',
  mobile: '',
  calendlyLink: '',
  copied: false,
};

function App() {
  const classes = useStyles();
  const [state, setState] = React.useState<State>(initialState);

  React.useEffect(() => {
    setState(initialState);
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState((prevState) => ({
      ...prevState,
      [event.target.name]: event.target.value,
    }));
  };

  //signature will not show in the preview until the first bit of data is added
  const showSignature = () => {
    let progress = 0;

    if (state.fullName) {
      return (
        <React.Fragment>
          <Signature
            fullName={state.fullName}
            credentials={state.credentials}
            title={state.title}
            phone={state.phone}
            mobile={state.mobile}
            calendlyLink={state.calendlyLink}
          />
          <br />
          <Button
            onClick={copyToClipboard}
            endIcon={state.copied ? <CheckOutlined /> : <FileCopyOutlined />}
          >
            {state.copied ? 'Copied' : 'Copy to clipboard'}
          </Button>
        </React.Fragment>
      );
    }
    if (progress > 0) {
      return (
        <div className={classes.centeredText}>
          <CircularProgressWithLabel variant='determinate' value={progress} />
        </div>
      );
    } else {
      return <div>Please, input your data</div>;
    }
  };

  const copyToClipboard = () => {
    let copyText = document.querySelector('.signature');
    const range = document.createRange();
    if (copyText) {
      range.selectNode(copyText);
    }
    const windowSelection = window.getSelection();
    if (windowSelection) {
      windowSelection.removeAllRanges();
      windowSelection.addRange(range);
    }
    try {
      let successful = document.execCommand('copy');
      console.log(successful ? 'Success' : 'Fail');
      setState((prevState) => ({
        ...prevState,
        copied: true,
      }));
    } catch (err) {
      console.log('Fail');
    }
  };

  const isStateChanged = () => {
    return JSON.stringify(state) === JSON.stringify(initialState);
  };

  const clearState = () => {
    setState(initialState);
  };

  return (
    <Container>
      <img className={classes.centeredImage} src={Logo} alt={'logo'} />
      <Typography variant='h2' gutterBottom className={classes.centeredText}>
        Signature generator
      </Typography>
      <Typography
        variant='subtitle1'
        gutterBottom
        className={classes.centeredText}
      ></Typography>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <Paper className={classes.paper}>
            <form className={classes.root} noValidate autoComplete='off'>
              <TextField
                fullWidth={true}
                required
                label='Full Name'
                value={state.fullName}
                name={'fullName'}
                onChange={handleChange}
                autoFocus={true}
              />
              <TextField
                fullWidth={true}
                label='Credentials'
                value={state.credentials}
                name={'credentials'}
                onChange={handleChange}
              />
              <TextField
                fullWidth={true}
                required
                label='Title'
                value={state.title}
                name={'title'}
                onChange={handleChange}
              />
              <TextField
                fullWidth={true}
                required
                label='Telephone'
                value={state.phone}
                name={'phone'}
                onChange={handleChange}
              />
              <TextField
                fullWidth={true}
                label='Mobile Phone'
                value={state.mobile}
                name={'mobile'}
                onChange={handleChange}
              />
              <TextField
                fullWidth={true}
                required
                label='Calendly Link'
                value={state.calendlyLink}
                name={'calendlyLink'}
                onChange={handleChange}
              />
              <br />
              <Button
                disabled={isStateChanged()}
                onClick={clearState}
                color={'secondary'}
              >
                Clear
              </Button>
            </form>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper className={classes.paper}>{showSignature()}</Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default App;