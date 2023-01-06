import {
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  TextField,
  Typography,
} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { Theme, createStyles, makeStyles } from "@material-ui/core/styles";
import { CheckOutlined, FileCopyOutlined } from "@material-ui/icons";
import { Select, SelectChangeEvent } from "@mui/material";
import React from "react";
import "./App.css";
import ReactDOMServer from "react-dom/server";
import DownloadIcon from "@mui/icons-material/Download";
import CircularProgressWithLabel from "./CircularProgressWithLabel";
import Signature from "./Signature";

const useStyles = makeStyles((theme: Theme) =>
  // Styles for the web app
  createStyles({
    root: {
      "& .MuiTextField-root": {
        margin: theme.spacing(1),
      },
      "& .label-root": {
        margin: theme.spacing(1),
      },
    },
    paper: {
      padding: theme.spacing(2),
      textAlign: "left",
      color: theme.palette.text.secondary,
    },
    centeredImage: {
      display: "block",
      marginLeft: "auto",
      marginRight: "auto",
      marginTop: "1rem",
      width: "150px",
    },
    centeredText: {
      textAlign: "center",
    },
    warningIconStyle: {
      textAlign: "center",
      color: "#FFDC00",
      verticalAlign: "middle",
    },
    box: {
      width: "75%",
    },
    inputLabel: {
      marginLeft: 10,
      marginTop: 3,
    },
    select: {
      width: 250,
      height: 50,
      marginLeft: 0.7,
    },
  })
);

export const LOGOS = {
  "ata-cpa-advisors":
    "https://temp-ata-signature-assets.s3.amazonaws.com/ATA_LOGO-CPAAdvisor-BT-RGB.png",
  "ata-capital":
    "https://temp-ata-signature-assets.s3.amazonaws.com/ATAC_LOGO-BT-RGB.png",
  "ata-employment-solutions":
    "https://temp-ata-signature-assets.s3.amazonaws.com/ATAES_LOGO-BT-RGB.png",
} as const;

export interface PhotoSignatureProps {
  logo: keyof typeof LOGOS;
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
  logo: "ata-capital",
  fullName: "",
  credentials: "",
  title: "",
  phone: "",
  mobile: "",
  calendlyLink: "",
  copied: false,
};

function App() {
  const classes = useStyles();
  const [state, setState] = React.useState<State>(initialState);

  const hasRequiredFields: boolean =
    !!state.logo && !!state.fullName && !!state.title && !!state.phone;

  React.useEffect(() => {
    setState(initialState);
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState((prevState) => ({
      ...prevState,
      [event.target.name]: event.target.value,
    }));
  };

  const handleChangeLogo = (
    event: SelectChangeEvent<
      "ata-cpa-advisors" | "ata-capital" | "ata-employment-solutions"
    >
  ) => {
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
            logo={state.logo}
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
            disabled={!hasRequiredFields}
            endIcon={state.copied ? <CheckOutlined /> : <FileCopyOutlined />}
          >
            {state.copied ? "Copied" : "Copy to clipboard"}
          </Button>
          <Button
            endIcon={<DownloadIcon />}
            onClick={downloadHtmlFile}
            disabled={!hasRequiredFields}
          >
            Download HTML File
          </Button>
        </React.Fragment>
      );
    }
    if (progress > 0) {
      return (
        <div className={classes.centeredText}>
          <CircularProgressWithLabel variant="determinate" value={progress} />
        </div>
      );
    } else {
      return <div>Please, input your data</div>;
    }
  };

  const copyToClipboard = () => {
    let copyText = document.querySelector(".signature");
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
      let successful = document.execCommand("copy");
      console.log(successful ? "Success" : "Fail");
      setState((prevState) => ({
        ...prevState,
        copied: true,
      }));
    } catch (err) {
      console.log("Fail");
    }
  };

  const downloadHtmlFile = () => {
    const htmlSignature = ReactDOMServer.renderToStaticMarkup(
      <Signature
        logo={state.logo}
        fullName={state.fullName}
        credentials={state.credentials}
        title={state.title}
        phone={state.phone}
        mobile={state.mobile}
        calendlyLink={state.calendlyLink}
      />
    );
    const lowerCaseName = state.fullName.toLowerCase();
    const nameSplit = lowerCaseName.split(" ");
    const firstInitial = nameSplit[0].charAt(0);
    const lastName = nameSplit[1];
    const blob = new Blob([htmlSignature]);
    const fileDownloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = fileDownloadUrl;
    link.setAttribute("download", `${firstInitial}${lastName}.htm`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  };

  const isStateChanged = () => {
    return JSON.stringify(state) === JSON.stringify(initialState);
  };

  const clearState = () => {
    setState(initialState);
  };

  return (
    <Container>
      <img
        className={classes.centeredImage}
        src={"https://temp-ata-signature-assets.s3.amazonaws.com/Logo.png"}
        alt={"ata-logo"}
      />
      <Typography variant="h2" gutterBottom className={classes.centeredText}>
        Signature generator
      </Typography>
      <Typography
        variant="subtitle1"
        gutterBottom
        className={classes.centeredText}
      ></Typography>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <Paper className={classes.paper}>
            <form className={classes.root} noValidate autoComplete="off">
              <Box className={classes.box}>
                <FormControl fullWidth>
                  <InputLabel
                    className={classes.inputLabel}
                    required
                    id="logo-select"
                  >
                    Choose a Logo
                  </InputLabel>
                  <Select
                    className={classes.select}
                    value={state.logo}
                    placeholder="Select a Logo"
                    name="logo"
                    onChange={handleChangeLogo}
                  >
                    <MenuItem value={LOGOS["ata-capital"]}>
                      ATA Capital
                    </MenuItem>
                    <MenuItem value={LOGOS["ata-cpa-advisors"]}>
                      ATA CPA Advisors
                    </MenuItem>
                    <MenuItem value={LOGOS["ata-employment-solutions"]}>
                      ATA Employment Solutions
                    </MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <TextField
                fullWidth={true}
                required
                label="Full Name"
                value={state.fullName}
                name={"fullName"}
                onChange={handleChange}
                // autoFocus={true}
              />
              <TextField
                fullWidth={true}
                label="Credentials"
                value={state.credentials}
                name={"credentials"}
                onChange={handleChange}
              />
              <TextField
                fullWidth={true}
                required
                label="Title"
                value={state.title}
                name={"title"}
                onChange={handleChange}
              />
              <TextField
                fullWidth={true}
                required
                label="Telephone"
                placeholder="777.444.5555"
                value={state.phone}
                name={"phone"}
                onChange={handleChange}
              />
              <TextField
                fullWidth={true}
                label="Mobile Phone"
                placeholder="777.444.5555"
                value={state.mobile}
                name={"mobile"}
                onChange={handleChange}
              />
              <TextField
                fullWidth={true}
                label="Calendly Link"
                value={state.calendlyLink}
                name={"calendlyLink"}
                onChange={handleChange}
              />
              <br />
              <Button
                disabled={isStateChanged()}
                onClick={clearState}
                color={"secondary"}
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
