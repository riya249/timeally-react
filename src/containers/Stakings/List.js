import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import { timeally } from '../../env';
const ethers = require('ethers');

class StakingList extends Component {
  state = {
    stakings: [],
    month: 0,
    benefit: {},
    errorMessage: '',
    withdrawing: false,
    withdrawable: true
  }

  componentDidMount = async () => {
    this.showStakings();
    this.setState({ month: (await this.props.store.timeallyInstance.functions.getCurrentMonth()).toNumber() })
  };

  showStakings = async () => {
    const newStakingEventSig = ethers.utils.id("NewStaking(address,uint256,uint256,uint256)");
    const topics = [ newStakingEventSig, ethers.utils.hexZeroPad(this.props.store.walletInstance.address, 32) ];

    const logs = await this.props.store.providerInstance.getLogs({
      address: timeally.address,
      fromBlock: 0,
      toBlock: 'latest',
      topics
    });

    const stakings = [];
    for(let i = logs.length - 1; i >= 0; i--) {
      const log = logs[i];
      const address = log.topics[1].slice(0,2) + log.topics[1].slice(26,log.topics[1].length);
      const stakingId = Number(log.data.slice(66,130));
      const staking = await this.props.store.timeallyInstance.functions.stakings(address, stakingId);
      console.log(staking);
      stakings.push({
        address,
        planId: ethers.utils.bigNumberify(log.topics[2]).toNumber(),
        amount: ethers.utils.formatEther(ethers.utils.bigNumberify(log.data.slice(0,66))),
        timestamp: staking[1].toNumber()
      });
    }

    this.setState({ stakings });

    console.log('fetching logs from the ethereum blockchain', logs);
  }


  showBenefit = async () => {
    this.setState({ errorMessage: '',  });

    try {
      const benefit = await this.props.store.timeallyInstance.functions.seeShareForUserByMonth(
        this.props.store.walletInstance.address,
        this.state.month
      );
      this.setState({ benefit, withdrawable: true });
    } catch (err) {
      this.setState({ errorMessage: err.message, benefit: {}, withdrawable: false });
    }
  }

  withdrawBenefit = async () => {
    try {
      this.setState({ withdrawing: true });
      const inputs = [
        this.state.month,
        50,
        false,
        0
      ];
      console.log(inputs);
      const tx = await this.props.store.timeallyInstance.functions.withdrawShareForUserByMonth(
        ...inputs
      );
      console.log(tx);
      await tx.wait();
      console.log('done');
    } catch (err) {
      this.setState({ errorMessage: err.message });
      console.log(err);
    }
    this.setState({ withdrawing: false });
  }

  render() {
    return (
      <div>
            <div className="page-header">
              <div className="container">
                <div className="row">
                  <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                    <div className="page-breadcrumb">
                      <ol className="breadcrumb">
                        <li><a>Home</a></li>
                        <li>Stakings</li>
                      </ol>
                    </div>
                  </div>
                  <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                    <div className="bg-white pinside30">
                      <div className="row">
                        <div className="col-xl-4 col-lg-4 col-md-9 col-sm-12 col-12">
                          <h1 className="page-title">Stakings</h1>
                        </div>
                        <div className="col-xl-8 col-lg-8 col-md-3 col-sm-12 col-12">
                          <div className="row">
                            <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                              <div className="btn-action">
                                <Button onClick={() => this.props.history.push('/stakings/new')}>New Staking</Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* content start */}
            <div className="container">
              <div className="row">
                <div className="col-md-12">
                  <div className="wrapper-content bg-white pinside40">
                   <div className="bg-white section-space80">
                     <div className="container">
                       See total monthly benefit by month: <input style={{height: '52px', padding: '6px 16px', fontSize: '14px', lineHeight: '1.42857143', color: '#555', borderRadius: '4px', boxShadow: 'inset 0 0px 0px rgba(0, 0, 0, .075)', marginBottom: '10px', border: '2px solid #e6ecef'}} type="text" placeholder="enter month id" value={this.state.month ? this.state.month : undefined} onChange={
                         event => {
                           console.log(+event.target.value);
                           this.setState({ month: +event.target.value });
                         } } />
                       <button className="btn" onClick={this.showBenefit}>Query</button>
                         <br></br><br></br>
                     {Object.keys(this.state.benefit).length
                       ?

                       <p>
                         Your benefit above month is {ethers.utils.formatEther(this.state.benefit)} ES
                         <br />
                         <button disabled={this.state.withdrawing} onClick={this.withdrawBenefit}>
                           {this.state.withdrawing ? 'Withdrawing...' : 'Withdraw this now'}</button>
                       </p>

                   :null}

                   {this.state.errorMessage ? <p>Error from blockchain: {this.state.errorMessage}</p> : null}
                    {this.state.stakings.map((staking, index) => (
                      <div onClick={() => this.props.history.push('/stakings/'+index)}>
                          <p>
                             <strong>StakingId:</strong> {index} - <strong>Plan:</strong> {staking.planId ? '2 Year' : '1 Year'} and <strong>Amount:</strong> {staking.amount} ES at <strong>Time:</strong> {new Date(staking.timestamp * 1000).toLocaleString()}
                          </p>
                      </div>
                    ))}
<<<<<<< HEAD
                    
=======
                    <table className="table table-striped" border="1">
                        <thead>
                          <tr>
                            <th>Month ID</th>
                            <th>Staking ID <button className="btn query btn-primary">Query All</button></th>
                            <th>Plan</th>
                            <th>Amount</th>
                            <th>Time</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>John</td>
                            <td>555252147s52s4dsdsd <button className="btn query btn-primary">Query</button></td>
                            <td>1 year</td>
                            <td>50055</td>
                            <td>25/07/2019, 17:32:08</td>
                            <td> <button className="btn query btn-primary">WITHDRAW</button></td>
                          </tr>                          
                          <tr>
                            <td>John</td>
                            <td>555252147s52s4dsdsd <button className="btn query btn-primary">Query</button></td>
                            <td>1 year</td>
                            <td>4578455</td>
                            <td>25/07/2019, 17:32:08</td>
                            <td> <button className="btn query btn-primary">WITHDRAW</button></td>
                          </tr>
                          <tr>
                            <td>John</td>
                            <td>555252147s52s4dsdsd <button className="btn query btn-primary">Query</button></td>
                            <td>1 year</td>
                            <td>578755</td>
                            <td>25/07/2019, 17:32:08</td>
                            <td> <button className="btn query btn-primary">WITHDRAW</button></td>
                          </tr>
                        </tbody>
                      </table>
>>>>>>> 788cb1bd88fc77eb815b9e349fbdb22521698069
                      <div className="pagination">
                          <a href="#">«</a>
                          <a className="active" href="#">1</a>
                          <a href="#">2</a>
                          <a href="#">3</a>
                          <a href="#">4</a>
                          <a href="#">5</a>
                          <a href="#">6</a>
                          <a href="#">»</a>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(state => {return{store: state}})(StakingList);
