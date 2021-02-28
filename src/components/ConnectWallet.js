import Web3Modal from "web3modal";
import Web3 from "web3";
import Portis from "@portis/web3";
import { Button } from "@material-ui/core";
require("dotenv").config();

const providerOptions = {
  portis: {
    package: Portis, // required
    options: {
      id: process.env.REACT_APP_PORTIS_KEY, // required
    },
  },
};
const web3Modal = new Web3Modal({
  network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions, // required
});

const connectWallet = async (setWeb3, setAccount) => {
  // clear cache to allow connecting to different wallet
  // if the user wants
  await web3Modal.clearCachedProvider();
  const provider = await web3Modal.connect();
  const web3 = new Web3(provider);
  setWeb3(web3);
  const accounts = await web3.eth.getAccounts();
  setAccount(accounts[0]);
};

const ConnectWallet = ({ setWeb3, setAccount }) => {
  return (
    <Button
      variant="contained"
      color="primary"
      style={{
        minHeight: "55px",
        maxWidth: "200px",
      }}
      onClick={() => connectWallet(setWeb3, setAccount)}
    >
      Connect Wallet{" "}
    </Button>
  );
};

export default ConnectWallet;
