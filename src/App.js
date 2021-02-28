import { useState } from "react";
// Material UI
import { Grid, Box, TextField, Button } from "@material-ui/core";
// Components
import ConnectWallet from "./components/ConnectWallet";
// ABIs
const uniPairABI = require("./abis/UniswapPair.json");
const tokenABI = require("./abis/ERC20.json");
// BN
const BN = require("web3-utils").BN;

function App() {
  const [web3, setWeb3] = useState();
  const [account, setAccount] = useState();
  const [pairAddress, setPairAddress] = useState("");
  const [lpAmount, setLpAmount] = useState("");
  const [token0Share, setToken0Share] = useState("");
  const [token1Share, setToken1Share] = useState("");
  const [token0Name, setToken0Name] = useState("");
  const [token1Name, setToken1Name] = useState("");

  const calculate = async () => {
    try {
      const uniPair = new web3.eth.Contract(uniPairABI, pairAddress);
      const token0Address = await uniPair.methods.token0().call();
      const token1Address = await uniPair.methods.token1().call();

      const token0Instance = new web3.eth.Contract(tokenABI, token0Address);
      const token1Instance = new web3.eth.Contract(tokenABI, token1Address);

      const reserve0 = await token0Instance.methods
        .balanceOf(pairAddress)
        .call();
      const reserve1 = await token1Instance.methods
        .balanceOf(pairAddress)
        .call();

      const lpTotalSupply = await uniPair.methods.totalSupply().call();

      const userToken0Share = new BN(reserve0)
        .mul(new BN(lpAmount).mul(new BN("10").pow(new BN("18"))))
        .div(new BN(lpTotalSupply));
      const userToken1Share = new BN(reserve1)
        .mul(new BN(lpAmount).mul(new BN("10").pow(new BN("18"))))
        .div(new BN(lpTotalSupply));

      setToken0Share(await toDecimal(token0Instance, userToken0Share));
      setToken1Share(await toDecimal(token1Instance, userToken1Share));

      setToken0Name(await token0Instance.methods.symbol().call());
      setToken1Name(await token1Instance.methods.symbol().call());
    } catch (error) {
      console.log(error);
    }
  };

  const toDecimal = async (tokenInstance, amount) => {
    const decimals = await tokenInstance.methods.decimals().call();
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

  return (
    <Grid container direction="column">
      <Grid
        container
        style={{
          marginBottom: "40px",
          marginTop: "40px",
        }}
      >
        <Grid item xs={4} />
        <Grid item xs={4}>
          <Box
            fontWeight="fontWeightBold"
            fontSize="h4.fontSize"
            fontFamily="fontFamily"
            fontStyle=""
            style={{
              margin: "auto",
              color: "#673ab7",
              borderBottom: "4px solid #01579b"
            }}
          >
            LP Underlying Calculator
          </Box>
        </Grid>
        <Grid item xs={4}>
          {!web3 ? (
            <Grid
              container
              justify="flex-end"
              style={{
                paddingRight: "2rem",
              }}
            >
              <ConnectWallet setWeb3={setWeb3} setAccount={setAccount} />
            </Grid>
          ) : (
            <>
              <Grid container justify="center">
                <Grid item>
                  <Box
                    fontWeight="fontWeightBold"
                    fontSize="1.2rem"
                    fontFamily="fontFamily"
                    fontStyle=""
                    style={{
                      color: "green",
                      marginRight: "1rem",
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
                      color: "green",
                    }}
                  >
                    {account}
                  </Box>
                </Grid>
              </Grid>
            </>
          )}
        </Grid>
      </Grid>
      <Grid item>
        UNISWAP:
        <br />
        <br />
        <br />
      </Grid>
      <Grid item>
        <TextField
          id="pair-address"
          label="Pair Address"
          variant="outlined"
          style={{
            minWidth: "450px",
          }}
          autoComplete="off"
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
          onClick={() => calculate()}
        >
          Calculate
        </Button>
      </Grid>
      <Grid item>
        Token A Val: {token0Share} {token0Name}
      </Grid>
      <Grid item>
        Token B Val: {token1Share} {token1Name}
      </Grid>
    </Grid>
  );
}

export default App;
