import React, { Component } from 'react';
import { Link } from 'react-router';
import { bindActionCreators } from 'redux';
import _ from 'underscore';
import * as utils from 'utils';
import * as plugins from 'plugins';
import * as constants from 'constants';
import { If } from 'jsx-control-statements';
import { connect } from 'react-redux';
import { Header } from 'components/Header';
import { Loader } from 'components/Loader';
import { Image } from 'components/Image';
import MyInfoTab from './myinfo';
import BoutiqueExchg from '../BoutiqueExchange';

import './index.scss';

export default class MamaHome extends Component {
  static propTypes = {
    children: React.PropTypes.array,
    dispatch: React.PropTypes.func,
  };

  static contextTypes = {
    router: React.PropTypes.object,
  };

  constructor(props, context) {
    super(props);
    context.router;
  }

  state = {
    topTab: 'boutique',
  }

  componentWillMount() {

  }

  componentDidMount() {

  }

  componentWillReceiveProps(nextProps) {
  }

  componentWillUnmount() {

  }

  onLeftBtnClick = (e) => {
    if (utils.detector.isApp()) {
      plugins.invoke({
        method: 'callNativeBack',
      });
      return;
    }
    this.context.router.goBack();
  }

  onTabClick = (e) => {
    const { id, type } = e.currentTarget.dataset;
      switch (id) {
        case 'boutique':
          this.setState({
            topTab: id,

          });
          // window.location.href = '/mall/mama/boutique';
          break;
        case 'myinfo':
          this.setState({
            topTab: id,
          });
          break;
        default:
      }

    e.preventDefault();
  }

  render() {
    const { topTab } = this.state;

    return (
      <div className="home-root">
        <Header title="妈妈中心" leftIcon="icon-angle-left" onLeftBtnClick={this.onLeftBtnClick}/>
        <div className="content mamahome">
          <div className="mamahome-container">
            <Choose>
            <When condition={topTab === 'boutique'}>
              <BoutiqueExchg />
            </When>
            <When condition={topTab === 'myinfo'}>
              <MyInfoTab />
            </When>
            </Choose>
          </div>
          <div className="row no-margin top-border base-tab">
            <ul className="row no-margin">
              <li key={2} data-id="boutique" onClick={this.onTabClick}>
                <p className={'col-xs-6 no-margin no-padding text-center' + (topTab === 'boutique' ? ' active' : '')}>
                  <span>精品汇</span>
                </p>
              </li>
              <li key={4} data-id="myinfo" onClick={this.onTabClick}>
                <p className={'col-xs-6 no-margin no-padding text-center' + (topTab === 'myinfo' ? ' active' : '')}>
                  <span>妈妈中心</span>
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}
