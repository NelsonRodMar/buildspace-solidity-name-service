import React, {useEffect, useState, useRef} from "react";
import {ethers} from "ethers";
import ReCAPTCHA from "react-google-recaptcha";
import './styles/App.css';

import polygonLogo from './assets/polygonlogo.png';
import editIcon from './assets/edit.png';
import ethLogo from './assets/ethlogo.png';
import twitterLogo from './assets/twitter-logo.svg';
import domains from './utils/Domains.json';
import {networks} from './utils/networks';

const TWITTER_HANDLE = 'NelsonRodMar';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const tld = '.panda';
const CONTRACT_ADDRESS = '0x4b6702765FACc6A5411BC9cF2307462Bf217281E';

const App = () => {
    const [currentAccount, setCurrentAccount] = useState("");
    const [network, setNetwork] = useState('');
    const [domain, setDomain] = useState('');
    const [twitter, setTwitter] = useState('');
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [mints, setMints] = useState([]);
    const [captchaToken, setCaptchaToken] = useState({
        expiry_token: -1,
        auth_token: -1,
        signature_token: -1
    });
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

            const chainId = await ethereum.request({method: 'eth_chainId'});
            setNetwork(networks[chainId]);

            ethereum.on('chainChanged', handleChainChanged);

            // Reload the page when they change networks
            function handleChainChanged(_chainId) {
                window.location.reload();
            }
        } catch (error) {
            console.log(error);
        }
    }


    function onCaptchaValidate(value) {
        if (value) {
            console.log("Value :", value);
            var myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");
            var raw = JSON.stringify({
                "application_id": process.env.REACT_APP_APPLICATION_ID,
                "validation_proof": value
            });

            var requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: raw,
                redirect: 'follow'
            };

            fetch("https://api.algoz.xyz/validate/", requestOptions)
                .then(async response => {
                    const data = await response.json();
                    console.log("Response :", data);
                    setCaptchaToken({
                        expiry_token: data.expiry_token,
                        auth_token: data.auth_token,
                        signature_token: data.signature_token
                    });
                })
                .catch(error => {
                    console.error('There was an error!', error);
                });

            setLoading(false);
        } else {
            setLoading(true);
        }
    }

    const mintDomain = async () => {
        // Don't run if the domain is empty
        if (!domain && !twitter) {
            return
        }
        // Alert the user if the domain is too short
        if (domain.length < 1 && domain.length > 140) {
            alert('Domain must between 1 and 140 characters');
            return;
        }
        console.log("Minting domain", domain);
        const {ethereum} = window;
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, domains.abi, signer);
        let pause = await contract.paused();
        if (pause) {
            alert('Contract is paused');
            return;
        }
        try {
            if (ethereum) {
                var price = await contract.price();
                price = price.toHexString();

                console.log("Price ", price)
                console.log("Going to pop wallet now to pay gas...")
                let tx = await contract.register(
                    domain,
                    captchaToken.expiry_token,
                    captchaToken.auth_token,
                    captchaToken.signature_token,
                    {value: price}
                );
                // Wait for the transaction to be mined
                const receipt = await tx.wait();
                console.log("Domain minted ! https://goerli.etherscan.io//tx/" + tx.hash);

                // Check if the transaction was successfully completed and if twitter value is not null
                if (receipt.status === 1 && !twitter) {
                    // Set the record for the domain
                    tx = await contract.setTwitter(domain, twitter);
                    await tx.wait();

                    console.log("Record set! https://goerli.etherscan.io//tx/" + tx.hash);

                    // Call fetchMints after 2 seconds
                    setTimeout(() => {
                        fetchMints();
                    }, 2000);

                    setTwitter('');
                    setDomain('');
                } else {
                    alert("Transaction failed! Please try again");
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    const updateTwitter = async () => {
        if (!twitter || !domain) {
            return
        }
        setLoading(true);
        console.log("Updating domain", domain, "with twitter", twitter);
        try {
            const {ethereum} = window;
            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const contract = new ethers.Contract(CONTRACT_ADDRESS, domains.abi, signer);

                let tx = await contract.setTwitter(domain, twitter);
                await tx.wait();
                console.log("Twitter updated tx hash : " + tx.hash);

                fetchMints();
                setTwitter('');
                setDomain('');
            }
        } catch (error) {
            console.log(error);
        }
        setLoading(false);
    }

    // Fetch all the Domains mint
    const fetchMints = async () => {
        try {
            const {ethereum} = window;
            if (ethereum) {
                // You know all this
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const contract = new ethers.Contract(CONTRACT_ADDRESS, domains.abi, signer);

                // Get all the domain names from our contract
                const names = await contract.getAllNames();


                // For each name, get the record and the address
                const mintTwitters = await Promise.all(names.map(async (name) => {
                    const mintTwitter = await contract.getTwitter(name);
                    const owner = await contract.getAddress(name);
                    return {
                        id: names.indexOf(name),
                        name: name,
                        twitter: mintTwitter,
                        owner: owner,
                    };
                }));

                console.log("MINTS FETCHED ", mintTwitters);
                setMints(mintTwitters);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const renderMints = () => {
        if (currentAccount && mints.length > 0) {
            return (
                <div className="mint-container">
                    <p className="subtitle"> Recently minted domains!</p>
                    <div className="mint-list">
                        {mints.map((mint, index) => {
                            return (
                                <div className="mint-item" key={index}>
                                    <div className='mint-row'>
                                        <a className="link"
                                           href={`https://testnets.opensea.io/assets/goerli/${CONTRACT_ADDRESS}/${mint.id}`}
                                           target="_blank" rel="noopener noreferrer">
                                            <p>{' '}{mint.name}{tld}{' '}</p>
                                        </a>
                                        {/* If mint.owner is currentAccount, add an "edit" button*/}
                                        {mint.owner.toLowerCase() === currentAccount.toLowerCase() ?
                                            <button className="edit-button" onClick={() => editRecord(mint.name)}>
                                                <img className="edit-icon"
                                                     src={editIcon}
                                                     alt="Edit button"/>
                                            </button>
                                            :
                                            null
                                        }
                                    </div>
                                    <a href={`https://twitter.com/${mint.twitter}/`}> @{mint.twitter} </a>
                                </div>)
                        })}
                    </div>
                </div>);
        }
    };

    // This will take us into edit mode and show us the edit buttons!
    const editRecord = (name) => {
        console.log("Editing record for", name);
        setEditing(true);
        setDomain(name);
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
                <br/>
                <div className="first-row">
                    <input
                        id="domain"
                        type="text"
                        value={domain}
                        placeholder='domain'
                        required={true}
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

                {editing ? (
                    <div className="button-container">
                        <button className='cta-button mint-button' disabled={loading} onClick={updateTwitter}>
                            Set Twitter
                        </button>
                        <button className='cta-button mint-button' onClick={() => {
                            document.getElementById('domain').value = "";
                            setEditing(false);
                        }}>
                            Cancel
                        </button>
                    </div>
                ) : (
                    <div>
                        <ReCAPTCHA
                            sitekey={process.env.REACT_APP_SITE_KEY}
                            onChange={onCaptchaValidate}
                        />
                        <button className='cta-button mint-button' disabled={loading} onClick={mintDomain}>
                            Mint
                        </button>
                    </div>
                )}

            </div>
        );
    }

    useEffect(() => {
        checkIfWalletIsConnected();
    }, []);

    useEffect(() => {
        fetchMints();
    }, [currentAccount, network]);

    return (
        <div className="App">
            <div className="container">

                <div className="header-container">
                    <header>
                        <div className="left">
                            <p className="title">🐼 Panda Name Service</p>
                            <p className="subtitle">Your representation as a Panda !</p>
                        </div>

                        <div className="right">
                            <img alt="Network logo" className="logo"
                                 src={network.includes("Polygon") ? polygonLogo : ethLogo}/>
                            {currentAccount ?
                                <p> Wallet: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)} </p> :
                                <p> Not connected </p>}
                        </div>
                    </header>
                </div>

                {!currentAccount && renderNotConnectedContainer()}
                {currentAccount && renderInputForm()}
                {mints && renderMints()}

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
