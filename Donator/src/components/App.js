import React, { Component } from 'react'
import Web3 from 'web3'
import DonationRequest from '../abis/DonationRequest.json'
import Main from './Main'
import './App.css'

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const web3 = window.web3

    this.setState({ account: window.ethereum.selectedAddress })

    const networkId = await web3.eth.net.getId()

    // Load initial DonationRequest contract data
    const donationRequestData = DonationRequest.networks[networkId]
    if(donationRequestData) {
      const donationRequest = new web3.eth.Contract(DonationRequest.abi, donationRequestData.address)
      this.setState({ donationRequest })

      let receiverName = await donationRequest.methods.receiverName().call()
      let totalDonations = await donationRequest.methods.totalDonations().call()
      let isReceiver = await donationRequest.methods.addressIsReceiver().call()

      this.setState({ receiverName: receiverName.toString() ,
                      totalDonations: totalDonations,
                      isReceiver: isReceiver })
    } else {
      window.alert('DonationRequest contract not deployed to detected network.')
    }

    this.setState({ loading: false })
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  donate(amount) {
    console.log("donate called")
  }

  setReceiver = (address, name) => {
    this.setState({ state: window.ethereum.selectedAddress })
    this.setState({ loading: true })
    this.state.donationRequest.methods.setReceiver(address, name).send(
        { from: this.state.account },
        (error, result) => { 
          if (error)
            console.log(error)
          else
            console.log(result)
      })
    .on('transactionHash', (hash) => {
      this.setState({ loading: false })
    })
  }

  receiveDonations() {
    console.log("receiveDonations called")
  }

  constructor(props) {
    super(props)
    this.state = {
      donate: {},
      account: '0x0',
      receiverName: 'Receiver Name',
      loading: true,
      totalDonations: 0,
      isReceiver: true
    }
  }

  render() {
    let content
    if(this.state.loading) {
      content = <p id="loader" className="text-center">Loading...</p>
    } else {
        content = <Main
          receiverName={this.state.receiverName}
          account={this.state.account}
          totalDonations={this.state.totalDonations}
          isReceiver={this.state.isReceiver}
          donate={this.donate}
          setReceiver={this.setReceiver}
          receiveDonations={this.receiveDonations}
      />
    }

    return (
      <div className="text-center">
        Ethereum Donator
        {content}
      </div>
    );
  }
}

export default App;
