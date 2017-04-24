import React, { Component } from 'react';
import { Link } from 'react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'underscore';
import classnames from 'classnames';
import { If } from 'jsx-control-statements';
import * as actionCreators from 'actions/user/profile';

import './mydetailinfo.scss';

@connect(
  state => ({
    profile: state.profile.data,
    isLoading: state.profile.isLoading,
  }),
  dispatch => bindActionCreators(actionCreators, dispatch),
)
export default class HomeMyDetailInfo extends Component {
  static propTypes = {
    profile: React.PropTypes.object,
    fetchProfile: React.PropTypes.func,
  }

  static defaultProps = {

  }

  constructor(props, context) {
    super(props);
  }

  state = {

  }

  componentWillMount() {
    this.props.fetchProfile();
  }

  render() {
    const { profile } = this.props;
    let isPartner = 0;
    if (profile && profile.xiaolumm && profile.xiaolumm.last_renew_type >= 90 && profile.xiaolumm.elite_score >= 6000) {
      isPartner = 1;
    }
    return (
      <div className="mydetailinfo-container">
        <div className="row no-margin">
          <div className="col-xs-6 col-xs-offset-3 text-center">
            <Link to="/user/profile">
            <div className="avatar">
              <If condition={profile.thumbnail} >
                <img src={profile.thumbnail} />
              </If>
              <If condition={!profile.thumbnail} >
                <i className="icon-avatar icon-xiaolu icon-grey icon-3x"></i>
              </If>
            </div>
            </Link>
            <p className="text-center">{profile.nick}</p>
          </div>
        </div>
        <div className="row no-margin account-summary bottom-border text-center">
          <div className="col-xs-4">
            <Link to={'/user/wallet?cash=' + (profile.user_budget ? profile.user_budget.budget_cash : 0) + '&nick=' + profile.nick + '&isPartner=' + isPartner}>
              <p>{profile.user_budget ? profile.user_budget.budget_cash : 0}</p>
              <p>
                <i className="icon-wallet"></i>
                <span className="font-xs">零钱(元)</span>
              </p>
            </Link>
          </div>
          <div className="col-xs-4">
            <Link to={'/user/coin?coin=' + (profile.xiaolu_coin ? profile.xiaolu_coin : 0)}>
              <p>{profile.xiaolu_coin || 0}</p>
              <p>
                <i className="icon-database"></i>
                <span className="font-xs">币</span>
              </p>
            </Link>
          </div>
          <div className="col-xs-4">
            <Link to="/user/coupons">
              <p>{profile.coupon_num || 0}</p>
              <p>
                <i className="icon-coupon-o"></i>
                <span className="font-xs">优惠券</span>
              </p>
            </Link>
          </div>
        </div>
        <ul>
          <li>
            <a href="/mall/ol.html?type=1">
              <i className="icon-order-square icon-gold"></i>
              <span>待支付</span>
              <If condition={profile.waitpay_num}>
                <span className="badge gold pull-right">{profile.waitpay_num}</span>
              </If>
            </a>
          </li>
          <li>
            <a href="/mall/ol.html?type=2">
              <i className="icon-truck icon-gold"></i>
              <span>待收货</span>
              <If condition={profile.waitgoods_num}>
                <span className="badge gold pull-right">{profile.waitgoods_num}</span>
              </If>
            </a>
          </li>
          <li>
            <Link to="/refunds">
              <i className="icon-cny icon-gold"></i>
              <span>退换货</span>
              <If condition={profile.refunds_num}>
                <span className="badge gold pull-right">{profile.refunds_num}</span>
              </If>
            </Link>
          </li>
          <li className="bottom-border-black">
            <a href="/mall/ol.html?type=0">
              <i className="icon-order icon-gold"></i>
              <span>全部订单</span>
            </a>
          </li>
          <li>
            <Link to="/complaint/commit">
              <i className="icon-mail-open icon-gold"></i>
              <span>投诉建议</span>
            </Link>
          </li>
          <li className="bottom-border-black">
            <Link to="/faq">
              <i className="icon-faq icon-gold"></i>
              <span>常见问题</span>
            </Link>
          </li>
          <li>
            <Link to="/mama/home">
              <i className="icon-home icon-gold"></i>
              <span>我的店铺</span>
            </Link>
          </li>
        </ul>
      </div>
    );
  }
}
