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
import { Toast } from 'components/Toast';
import HomePage from './homepage';
import { ShopBag } from 'containers/ShopBag';
import ProductCategory from '../Product/Categories';
import HomeMyDetailInfo from './mydetailinfo';
import * as wechatSignAction from 'actions/wechat/sign';
import * as shopSharingAction from 'actions/mama/shopSharing';

import logo from './images/logo.png';
import './index.scss';

const actionCreators = _.extend(wechatSignAction, shopSharingAction);

@connect(
  state => ({
    profile: state.profile,
  }),
  dispatch => bindActionCreators(actionCreators, dispatch),
)
export class Home extends Component {
  static propTypes = {
    children: React.PropTypes.array,
    location: React.PropTypes.any,
    dispatch: React.PropTypes.func,
    profile: React.PropTypes.object,
  };

  static contextTypes = {
    router: React.PropTypes.object,
  };

  constructor(props, context) {
    super(props);
    context.router;
  }

  state = {
    topTab: 'home',
  }

  componentWillMount() {
    const active = this.props.location.query.active;
    const mmLinkId = this.props.location.query.mm_linkid;
    const tab = this.props.location.query.tab;
    let topTab = 'home';
    if (tab) {
      if (Number(tab) === 1) {
        topTab = 'category';
      } else if (Number(tab) === 2) {
        topTab = 'shoppingcart';
      } else if (Number(tab) === 3) {
        topTab = 'myinfo';
      }
    }
    this.setState({ active: active, mmLinkId: mmLinkId, topTab: topTab });
  }

  componentDidMount() {

  }

  componentWillReceiveProps(nextProps) {

  }

  componentWillUnmount() {

  }

  onTabClick = (e) => {
    const { id, type } = e.currentTarget.dataset;
    this.setState({ topTab: id });
    let tab = 0;
    switch (id) {
      case 'home':
        tab = 0;
        break;
      case 'category':
        tab = 1;
        break;
      case 'shoppingcart':
        tab = 2;
        break;
      case 'myinfo':
        tab = 3;
        break;
      default:
        break;
    }
    this.context.router.replace('?tab=' + tab);
    e.preventDefault();
  }

  enterMamahome = () => {
    const { profile } = this.props;
    if (profile && profile.success && profile.data.xiaolumm && profile.data.xiaolumm.id > 0) {
      // this.context.router.push('/mama/home');
      window.location.href = '/mall/mama/home';
      return;
    }
    if (profile && profile.success && (profile.data.xiaolumm === null)) {
      Toast.show('您还不是会员，请关注你的铺子公众号了解更多信息');
      return;
    }
    if (profile && (!profile.success || profile.error)) {
      Toast.show('您还没有登录，请登录后进入');
      return;
    }
  }

  render() {
    const { topTab } = this.state;
    const { location } = this.props;
    const hasHeader = !utils.detector.isApp();

    return (
      <div className="home-xiaolumeimei">
        <div className="content home-div">
          <div className="home-container">
            <Choose>
            <When condition={topTab === 'home'}>
              <HomePage location={location} />
            </When>
            <When condition={topTab === 'category'}>
              <ProductCategory location={location} />
            </When>
            <When condition={topTab === 'shoppingcart'}>
              <ShopBag location={location} ishome={1}/>
            </When>
            <When condition={topTab === 'myinfo'}>
              <HomeMyDetailInfo location={location} />
            </When>
            </Choose>
          </div>
          <div className="row no-margin top-border base-tab">
            <ul className="row no-margin">
              <li key={1} data-id="home" onClick={this.onTabClick}>
                <p className={'col-xs-3 no-margin no-padding text-center' + (topTab === 'home' ? ' active' : '')}>首页</p>
              </li>
              <li key={2} data-id="category" onClick={this.onTabClick}>
                <p className={'col-xs-3 no-margin no-padding text-center' + (topTab === 'category' ? ' active' : '')}>分类</p>
              </li>
              <li key={3} data-id="shoppingcart" onClick={this.onTabClick}>
                <p className={'col-xs-3 no-margin no-padding text-center' + (topTab === 'shoppingcart' ? ' active' : '')}>购物车</p>
              </li>
              <li key={4} data-id="myinfo" onClick={this.onTabClick}>
                <p className={'col-xs-3 no-margin no-padding text-center' + (topTab === 'myinfo' ? ' active' : '')}>我的</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}
