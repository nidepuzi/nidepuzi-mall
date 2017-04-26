import React, { Component } from 'react';
import { Link } from 'react-router';
import { bindActionCreators } from 'redux';
import _ from 'underscore';
import * as utils from 'utils';
import { If } from 'jsx-control-statements';
import { connect } from 'react-redux';
import { Header } from 'components/Header';
import { Loader } from 'components/Loader';
import * as coinLogAction from 'actions/user/coin';

import './xiaolucoin.scss';
const actionCreators = _.extend(coinLogAction);

@connect(
  state => ({
    coinLog: state.coinLog,
  }),
  dispatch => bindActionCreators(actionCreators, dispatch),
)

export default class XiaoluCoin extends Component {
  static propTypes = {
    children: React.PropTypes.array,
    dispatch: React.PropTypes.func,
    location: React.PropTypes.object,
    coinLog: React.PropTypes.any,
    fetchXiaoluCoinLogs: React.PropTypes.func,
  };

  static contextTypes = {
    router: React.PropTypes.object,
  };

  constructor(props, context) {
    super(props);
    context.router;
  }

  state = {
    pageIndex: 0,
    pageSize: 10,
    hasMore: true,
  }

  componentWillMount() {
    const { pageIndex, pageSize } = this.state;
    this.props.fetchXiaoluCoinLogs(pageIndex + 1, pageSize);
  }

  componentDidMount() {
    this.addScrollListener();
  }

  componentWillReceiveProps(nextProps) {
    const coinLog = nextProps.coinLog;
    let count = 0;
    let size = 0;
    if (coinLog.success && coinLog.data && coinLog.data.count) {
      count = coinLog.data.count;
      size = coinLog.data.results.length;
      this.setState({ pageIndex: Math.round(size / this.state.pageSize) });
      this.setState({ hasMore: count > size });
    }
  }

  componentWillUnmount() {
    this.removeScrollListener();
  }

  onScroll = (e) => {
    const { pageSize, pageIndex } = this.state;
    const scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
    const documentHeight = utils.dom.documnetHeight();
    const windowHeight = utils.dom.windowHeight();
    if (scrollTop === documentHeight - windowHeight && !this.props.coinLog.isLoading && this.state.hasMore) {
      this.props.fetchXiaoluCoinLogs(pageIndex + 1, pageSize);
    }
  }

  addScrollListener = () => {
    window.addEventListener('scroll', this.onScroll);
  }

  removeScrollListener = () => {
    window.removeEventListener('scroll', this.onScroll);
  }

  render() {
    const { coinLog } = this.props;
    const { coin } = this.props.location.query;
    const logs = coinLog.data.results || [];

    return (
      <div>
        <Header title="我的小鹿币" leftIcon="icon-angle-left" onLeftBtnClick={this.context.router.goBack}/>
        <div className="content coin-container">
          <div className="row bonus-point padding-bottom-xxs">
            <p className="col-xs-12 no-margin margin-top-sm text-center no-margin font-orange bonus-point-value">{coin || 0}</p>
            <p className="col-xs-12 no-margin margin-bottom-sm text-center font-sm">我的铺子币</p>
          </div>
          <If condition={!_.isEmpty(logs)}>
            <ul className="point-list">
              {logs.map((log, index) => {
                return (
                  <li key={log.id} className="row no-margin padding-top-xs padding-bottom-xs bottom-border">
                    <div className="row no-margin">
                      <p className="col-xs-12 no-margin font-xs font-grey-light">{log.created.replace(/T/, ' ').substring(0, 19)}</p>
                      <p className="col-xs-12 no-margin">
                        <span className="col-xs-8 no-padding">{log.iro_type}</span>
                        <span className="col-xs-4 no-padding font-orange">{(log.amount * 0.01).toFixed(2)}元</span>
                      </p>
                      <p className="col-xs-12 no-margin">
                        <span>类型</span>
                        <span className="padding-left-xxs">{log.subject}</span>
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </If>
          <If condition={_.isEmpty(logs) && !(coinLog.isLoading)}>
            <div className="text-center coin-list-empty">
              <i className="icon-database icon-5x"/>
              <p>您暂时还没有铺子币收支纪录哦～</p>
              <p className="font-xs font-grey-light">充值铺子币购券换券更方便，快去看看吧～</p>
              <Link className="col-xs-4 col-xs-offset-4 margin-top-xs margin-bottom-lg button button-energized" to="/recharge">快去看看</Link>
            </div>
          </If>
        </div>
      </div>
    );
  }
}
