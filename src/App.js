import { useState, useEffect } from "react";
// Material UI
import {
  Grid,
  Paper,
  Box,
  TextField,
  Button,
  Typography,
} from "@material-ui/core";
// Components
import ConnectWallet from "./components/ConnectWallet";
// ABIs
const uniPairABI = require("./abis/UniswapPair.json");
const tokenABI = require("./abis/ERC20.json");
// BN
const BN = require("web3-utils").BN;

const truncateWithDots = (
  str,
  firstCharCount = 6,
  endCharCount = 4,
  dotCount = 4
) => {
  var convertedStr = "";
  convertedStr += str.substring(0, firstCharCount);
  convertedStr += ".".repeat(dotCount);
  convertedStr += str.substring(str.length - endCharCount, str.length);
  return convertedStr;
};

const SupportedPool = ({ name, icon }) => (
  <Grid item xs={3}>
    <Paper
      elevation={0}
      style={{
        padding: "2rem 3rem",
        border: "2px solid black",
      }}
    >
      <Grid
        container
        direction="row"
        alignItems="center"
        style={{
          minHeight: "100%",
        }}
      >
        <img
          alt={name}
          src={`./poolIcons/${icon}`}
          heigth="40px"
          width="40px"
        />
        <Typography
          variant="body2"
          display="inline"
          gutterBottom
          style={{
            fontWeight: "bold",
            paddingLeft: "1rem",
          }}
        >
          {name}
        </Typography>
      </Grid>
    </Paper>
  </Grid>
);

function App() {
  const [web3, setWeb3] = useState();
  const [account, setAccount] = useState("");
  const [inputDisabled, setInputDisabled] = useState(true);
  const [pairAddress, setPairAddress] = useState("");
  const [lpAmount, setLpAmount] = useState("");
  const [token0Share, setToken0Share] = useState("");
  const [token1Share, setToken1Share] = useState("");
  const [token0Name, setToken0Name] = useState("");
  const [token1Name, setToken1Name] = useState("");

  const supportedPools = [
    {
      name: "Uniswap",
      icon: "uniswap.png",
    },
    {
      name: "Sushiswap",
      icon: "sushiswap.ico",
    },
    {
      name: "1inch",
      icon: "1inch.png",
    },
  ];

  const calculate = async () => {
    try {
      const uniPair = new web3.eth.Contract(uniPairABI, pairAddress);
      const token0Address = await uniPair.methods.token0().call();
      const token1Address = await uniPair.methods.token1().call();
      const lpTotalSupply = await uniPair.methods.totalSupply().call();

      if (token0Address === "0x0000000000000000000000000000000000000000") {
        // in case of 1inch pool having ETH as pool token
        const reserve0 = await web3.eth.getBalance(pairAddress);
        const userToken0Share = new BN(reserve0)
          .mul(new BN(lpAmount).mul(new BN("10").pow(new BN("18"))))
          .div(new BN(lpTotalSupply));
        setToken0Share(await toDecimal(token0Address, userToken0Share, true));
        setToken0Name("ETH");
      } else {
        const token0Instance = new web3.eth.Contract(tokenABI, token0Address);
        const reserve0 = await token0Instance.methods
          .balanceOf(pairAddress)
          .call();
        const userToken0Share = new BN(reserve0)
          .mul(new BN(lpAmount).mul(new BN("10").pow(new BN("18"))))
          .div(new BN(lpTotalSupply));
        setToken0Share(await toDecimal(token0Instance, userToken0Share));
        setToken0Name(await token0Instance.methods.symbol().call());
      }

      const token1Instance = new web3.eth.Contract(tokenABI, token1Address);
      const reserve1 = await token1Instance.methods
        .balanceOf(pairAddress)
        .call();
      const userToken1Share = new BN(reserve1)
        .mul(new BN(lpAmount).mul(new BN("10").pow(new BN("18"))))
        .div(new BN(lpTotalSupply));
      setToken1Share(await toDecimal(token1Instance, userToken1Share));
      setToken1Name(await token1Instance.methods.symbol().call());
    } catch (error) {
      console.log(error);
    }
  };

  const toDecimal = async (tokenInstance, amount, isETH) => {
    var decimals = isETH ? 18 : await tokenInstance.methods.decimals().call();
    const divisor = new BN("10").pow(new BN(decimals));
    const beforeDec = new BN(amount).div(divisor).toString();
    var afterDec = new BN(amount).mod(divisor).toString();

    if (afterDec.length < decimals && afterDec !== "0") {
      // pad with extra zeroes
      const pad = Array(decimals + 1).join("0");
      afterDec = (pad + afterDec).slice(-decimals);
    }

    // remove insignificant trailing zeros
    return ((beforeDec + "." + afterDec) * 1).toString();
  };

  useEffect(() => {
    if (web3) {
      setInputDisabled(false);
    }
  }, [web3]);

  return (
    <Grid container direction="column">
      <Grid
        container
        style={{
          marginBottom: "40px",
          marginTop: "40px",
          paddingBottom: "30px",
          borderBottom: "2px solid black",
        }}
      >
        <Grid item xs={3} />
        <Grid
          item
          xs={6}
          container
          justify="center"
          style={{
            paddingRight: "2rem",
          }}
        >
          <Box
            fontWeight="fontWeightBold"
            fontSize="2.5rem"
            fontFamily="fontFamily"
            fontStyle=""
            color="#673ab7"
          >
            💦LP Underlying Calculator 🔢
          </Box>
        </Grid>
        <Grid
          item
          xs={3}
          container
          justify="flex-end"
          style={{
            paddingRight: "2rem",
          }}
        >
          {!web3 ? (
            <ConnectWallet setWeb3={setWeb3} setAccount={setAccount} />
          ) : (
            <Grid container direction="column" alignItems="flex-end">
              <Grid item>
                <Box
                  fontWeight="fontWeightBold"
                  fontSize="1.2rem"
                  fontFamily="fontFamily"
                  fontStyle=""
                  style={{
                    color: "green",
                    marginRight: "0.5rem",
                  }}
                >
                  • Connected
                </Box>
              </Grid>
              <Grid item>
                <Box
                  fontWeight="fontWeightBold"
                  fontFamily="fontFamily"
                  style={{
                    color: "#04ad04",
                  }}
                >
                  {`(${truncateWithDots(account)})`}
                </Box>
              </Grid>
            </Grid>
          )}
        </Grid>
      </Grid>
      <Paper
        elevation={2}
        style={{
          margin: "auto",
          padding: "2rem 10rem",
          minWidth: "60%",
        }}
      >
        <Grid container justify="space-between">
          <Grid item>
            <Grid
              container
              direction="row"
              alignItems="center"
              style={{
                minHeight: "100%",
              }}
            >
              <Typography variant="button" display="block" gutterBottom>
                Supported Pools:
              </Typography>
            </Grid>
          </Grid>
          {supportedPools.map((pool, index) => (
            <SupportedPool key={index} name={pool.name} icon={pool.icon} />
          ))}
        </Grid>
        <Grid
          container
          direction="column"
          spacing={3}
          alignItems="center"
          style={{
            marginTop: "3rem",
          }}
        >
          <Grid item>
            <TextField
              id="pair-address"
              label="Pair Address"
              variant="outlined"
              style={{
                minWidth: "450px",
              }}
              autoComplete="off"
              disabled={inputDisabled}
              onChange={(e) => setPairAddress(e.target.value)}
            />
          </Grid>
          <Grid item>
            <TextField
              id="lp-amount"
              label="LP Token Amount"
              variant="outlined"
              style={{
                minWidth: "450px",
              }}
              autoComplete="off"
              disabled={inputDisabled}
              onChange={(e) => setLpAmount(e.target.value)}
            />
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              style={{
                minHeight: "55px",
                maxWidth: "200px",
              }}
              disabled={inputDisabled}
              onClick={() => calculate()}
            >
              Calculate
            </Button>
          </Grid>
          {token0Name && token1Name && (
              <Grid item>
                <Box
                  fontWeight="fontWeightBold"
                  fontFamily="fontFamily"
                >
                  Token A Val: {token0Share} {token0Name}
                </Box>
                <Box
                  fontWeight="fontWeightBold"
                  fontFamily="fontFamily"
                >
                  Token B Val: {token1Share} {token1Name}
                </Box>
              </Grid>
          )}
        </Grid>
      </Paper>
    </Grid>
  );
}

export default App;
