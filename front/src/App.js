import React, {useEffect, useState} from "react";
import { ethers } from "ethers";
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import domains from './utils/Domains.json';

const TWITTER_HANDLE = 'NelsonRodMar';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const tld = '.panda';
const CONTRACT_ADDRESS = '0x684f2970509ed65936d7F0Ce7B4064dee9C3fe5e';

const App = () => {
    const [currentAccount, setCurrentAccount] = useState("");
    const [domain, setDomain] = useState('');
    const [twitter, setTwitter] = useState('');

    /**
     * Implement your connectWallet method here
     */
    const connectWallet = async () => {
        try {
            const {ethereum} = window;

            if (!ethereum) {
                alert("Get a wallet !");
                return;
            }
            const accounts = await ethereum.request({method: "eth_requestAccounts"});
            setCurrentAccount(accounts[0]);
        } catch (error) {
            console.log(error)
        }
    }
    /*
        Check if a wallet is connected
      */
    const checkIfWalletIsConnected = async () => {
        try {
            const {ethereum} = window;

            if (!ethereum) {
                console.log("Make sure you have metamask!");
                return;
            } else {
                console.log("We have the ethereum object", ethereum);
            }

            const accounts = await ethereum.request({method: "eth_accounts"});

            if (accounts.length !== 0) {
                const account = accounts[0];
                console.log("Found an authorized account:", account);
                setCurrentAccount(account);
            } else {
                console.log("No authorized account found")
            }
        } catch (error) {
            console.log(error);
        }
    }

    const mintDomain = async () => {
        // Don't run if the domain is empty
        if (!domain && !twitter) { return }
        // Alert the user if the domain is too short
        if (domain.length < 0) {
            alert('Domain must be at least 1 characters long');
            return;
        }
        console.log("Minting domain", domain);
        try {
            const { ethereum } = window;
            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const contract = new ethers.Contract(CONTRACT_ADDRESS, domains.abi, signer);
                var price = await contract.price();
                price = price.toHexString();

                console.log("Price ", price)
                console.log("Going to pop wallet now to pay gas...")
                let tx = await contract.register(domain, {value: price});
                // Wait for the transaction to be mined
                const receipt = await tx.wait();

                // Check if the transaction was successfully completed
                if (receipt.status === 1) {
                    // Set the record for the domain
                    tx = await contract.setTwitter(domain, twitter);
                    await tx.wait();

                    console.log("Record set! https://mumbai.polygonscan.com/tx/"+tx.hash);

                    setTwitter('');
                    setDomain('');
                }
                else {
                    alert("Transaction failed! Please try again");
                }
            }
        }
        catch(error){
            console.log(error);
        }
    }

    // Create a function to render if wallet is not connected yet
    const renderNotConnectedContainer = () => (
        <div className="connect-wallet-container">
            <img src="https://media.giphy.com/media/ewzF6uunnPn6L5amuW/giphy-downsized-large.gif" alt="Panda gif"/>
            <button className="cta-button connect-wallet-button" onClick={connectWallet}>
                Connect Wallet
            </button>
        </div>
    );


    // Form to enter domain name and data
    const renderInputForm = () => {
        return (
            <div className="form-container">

                <img src="https://media.giphy.com/media/snpENu20kUrTESS3ko/giphy.gif" alt="Panda hello"/>
                <br />
                <div className="first-row">
                    <input
                        type="text"
                        value={domain}
                        placeholder='domain'
                        onChange={e => setDomain(e.target.value)}
                    />
                    <p className='tld'> {tld} </p>
                </div>

                <input
                    type="text"
                    value={twitter}
                    placeholder='whats ur Twitter account'
                    onChange={e => setTwitter(e.target.value)}
                />

                <div className="button-container">
                    <button className='cta-button mint-button' onClick={mintDomain}>
                        Mint
                    </button>
                </div>

            </div>
        );
    }

    useEffect(() => {
        checkIfWalletIsConnected();
    }, []);

    return (
        <div className="App">
            <div className="container">

                <div className="header-container">
                    <header>
                        <div className="left">
                            <p className="title">🐼 Panda Name Service</p>
                            <p className="subtitle">Your representation as a Panda !</p>
                        </div>
                    </header>
                </div>

                {!currentAccount && renderNotConnectedContainer()}
                {currentAccount && renderInputForm()}

                <div className="footer-container">
                    <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo}/>
                    <a
                        className="footer-text"
                        href={TWITTER_LINK}
                        target="_blank"
                        rel="noreferrer"
                    >{`built by @${TWITTER_HANDLE}`}</a>
                </div>
            </div>
        </div>
    );
}

export default App;
