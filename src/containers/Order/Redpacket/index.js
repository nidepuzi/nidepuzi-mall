import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Toast } from 'components/Toast';
import { WechatPopup } from 'components/WechatPopup';
import { Image } from 'components/Image';
import moment from 'moment';
import _ from 'underscore';
import * as utils from 'utils';
import * as profileAction from 'actions/user/profile';
import * as shareRedpacketAction from 'actions/order/shareRedpacket';
import * as receiveRedpacketAction from 'actions/order/receiveRedpacket';
import * as usersRedpacketAction from 'actions/order/usersRedpacket';
import * as wechatSignAction from 'actions/wechat/sign';
import * as constants from 'constants';

import './index.scss';

const actionCreators = _.extend(profileAction, usersRedpacketAction, receiveRedpacketAction, shareRedpacketAction, wechatSignAction);
const staticBase = '//og224uhh3.qnssl.com/mall/';

@connect(
  state => ({
    usersRedpacket: state.usersRedpacket,
    receiveRedpacket: state.receiveRedpacket,
    shareRedpacket: state.shareRedpacket,
    wechatSign: state.wechatSign,
  }),
  dispatch => bindActionCreators(actionCreators, dispatch),
)
export default class Redpacket extends Component {

  static propTypes = {
    prefixCls: React.PropTypes.string,
    location: React.PropTypes.object,
    usersRedpacket: React.PropTypes.object,
    receiveRedpacket: React.PropTypes.object,
    fetchUsersRedpacket: React.PropTypes.func,
    fetchReceiveRedpacket: React.PropTypes.func,
    shareRedpacket: React.PropTypes.object,
    wechatSign: React.PropTypes.object,
    fetchShareRedpacket: React.PropTypes.func,
    fetchWechatSign: React.PropTypes.func,
    params: React.PropTypes.object,
  };

  static contextTypes = {
    router: React.PropTypes.object,
  };

  static defaultProps = {
    prefixCls: 'order-redpacket',
  };

  constructor(props, context) {
    super(props);
    context.router;
  }

  state = {
    phone: '',
  }

  componentWillMount() {
    const { query } = this.props.location;
    this.props.fetchReceiveRedpacket(query.uniq_id);
    this.props.fetchUsersRedpacket(query.uniq_id);
    this.props.fetchWechatSign();
    this.props.fetchShareRedpacket(query.uniq_id);
  }

  componentWillReceiveProps(nextProps) {
    const { profile, receiveRedpacket, wechatSign, shareRedpacket } = nextProps;
    if (!receiveRedpacket.isLoading && receiveRedpacket.success && receiveRedpacket.data.msg) {
      Toast.show(receiveRedpacket.data.msg);
    }

    if (!wechatSign.isLoading && wechatSign.success) {
      utils.wechat.config(wechatSign);
    }
    if (!shareRedpacket.isLoading && shareRedpacket.success) {
      const shareInfo = {
        success: shareRedpacket.success,
        data: {
          title: shareRedpacket.data.title,
          desc: shareRedpacket.data.description,
          share_link: shareRedpacket.data.share_link,
          share_img: shareRedpacket.data.post_img,
        },
      };
      utils.wechat.configShareContent(shareInfo);
    }
  }

  onInputTextChange = (e) => {
    this.setState({ phone: e.target.value });
  }

  onReceiveRedPacketClick = (e) => {
    const tid = this.props.location.query.uniq_id;
    this.props.fetchReceiveRedpacket(tid, this.state.phone);
  }

  onBuyNowClick = (e) => {
    window.ga && window.ga('send', {
      hitType: 'event',
      eventCategory: '分享得红包',
      eventAction: '立即使用',
    });
    this.context.router.replace('/');
  }

  onDownloadClick = (e) => {
    window.ga && window.ga('send', {
      hitType: 'event',
      eventCategory: '分享得红包',
      eventAction: '下载APP',
    });
    const mmLinkId = utils.cookie.getCookie('mm_linkid') || '';
    const uFrom = utils.cookie.getCookie('ufrom') || '';
    window.location.href = `${constants.downloadAppUri}?mm_linkid=${mmLinkId}&ufrom=${uFrom}`;
  }

  render() {
    const { prefixCls, receiveRedpacket, usersRedpacket } = this.props;
    const coupon = receiveRedpacket.data.coupon || {};
    return (
      <div className={`${prefixCls}`}>
        <Image className={`${prefixCls}-bg`} src={`${staticBase}sharing-redpacket-bg.png`} quality={90}/>
        <img className={`${prefixCls}-opened`} src={`${staticBase}redpacket-opened.png`} />
        <div className={`${prefixCls}-container`}>
          <div className={`${prefixCls}-content`}>
            <If condition={!receiveRedpacket.isLoading && !receiveRedpacket.data.coupon}>
              <p className="text-center font-lg margin-top-lg">绑定手机号领取红包</p>
              <div className="text-center input-box">
                <input type="number" placeholder="请输入您的手机号" value={this.state.phone} onChange={this.onInputTextChange} />
              </div>
            </If>
            <If condition={!receiveRedpacket.isLoading && receiveRedpacket.data.coupon && coupon.coupon_value }>
              <p className="font-red text-center">
                <span>￥</span>
                <span className="coupon-value">{coupon.coupon_value}</span>
              </p>
              <p className="font-grey-light text-center">
                <span>有效期</span>
                <span>{moment(coupon.created).format('YYYY年MM月DD日')}</span>
                <span> - </span>
                <span>{moment(coupon.deadline).format('YYYY年MM月DD日')}</span>
              </p>
              <p className="text-center">
                <span>红包已放至账户</span>
                <span className="font-grey-light">{coupon.nick || coupon.mobile}</span>
              </p>
            </If>
            <If condition={!receiveRedpacket.isLoading && receiveRedpacket.data.coupon && !coupon.coupon_value }>
              <p className="text-center margin-left-xxs margin-right-xxs margin-top-md">手快有，手慢无，对不起，您已经抢过了，或者红包已经被抢完了，下次可以快点哦~</p>
            </If>
            <div className="divider margin-top-lg margin-bottom-md"></div>
            <If condition={!usersRedpacket.isLoading && !_.isEmpty(usersRedpacket.data)}>
              <h4 className="text-center font-red">看看小伙伴的手气</h4>
              <ul className="margin-top-sm margin-bottom-sm">
                <If condition={Array.isArray(usersRedpacket.data)}>
                {usersRedpacket.data.map((item) => {
                  return (
                    <li className="row user">
                      <img className="col-xs-3 no-padding user-avatar" src={item.head_img}/>
                      <div className="col-xs-6 padding-right-xxs padding-left-xxs ">
                        <p>{item.nick}</p>
                        <p className="font-grey-light">{moment(item.created).format('YYYY-MM-DD HH:mm')}</p>
                      </div>
                      <p className="col-xs-3 no-padding font-red">
                        <span>￥</span>
                        <span className="font-26">{item.coupon_value.toFixed(2)}</span>
                      </p>
                    </li>
                  );
                })}
                </If>
              </ul>
            </If>
            <div className={`${prefixCls}-rules`}>
              <h4 className="text-center font-red">红包领取规则</h4>
              <div className="row no-margin">
                <p className="col-xs-1 no-padding"><span className="badge">1</span></p>
                <p className="col-xs-11 no-padding">发放至手机号的红包需在App用手机号注册，或将手机号绑定你的铺子账户后即可使用。</p>
              </div>
              <div className="row no-margin">
                <p className="col-xs-1 no-padding"><span className="badge">2</span></p>
                <p className="col-xs-11 no-padding">每位用户每个红包只限领取一次，红包使用以后，订单发生退款红包则不进行补发。</p>
              </div>
              <div className="row no-margin">
                <p className="col-xs-1 no-padding"><span className="badge">3</span></p>
                <p className="col-xs-11 no-padding">每个订单仅限使用一张红包，红包不找零。</p>
              </div>
              <div className="row no-margin">
                <p className="col-xs-1 no-padding"><span className="badge">4</span></p>
                <p className="col-xs-11 no-padding">若订单产生部分退款，将不退回分摊至每个商品优惠的金额。</p>
              </div>
              <div className="row no-margin">
                <p className="col-xs-1 no-padding"><span className="badge">5</span></p>
                <p className="col-xs-11 no-padding">你的铺子可在法律法规允许范围内对本次活动规则进行解释。</p>
              </div>
            </div>
          </div>
        </div>
          <div className="button-container">
            <If condition={!receiveRedpacket.isLoading && !receiveRedpacket.data.coupon}>
              <button className="button button-red" type="button" onClick={this.onReceiveRedPacketClick}>领取红包</button>
            </If>
            <If condition={!receiveRedpacket.isLoading && receiveRedpacket.data.coupon}>
              <button className="button button-red" type="button" onClick={this.onBuyNowClick}>立即使用</button>
              <button className="button button-yellow margin-top-xxs" type="button" onClick={this.onDownloadClick}>打开APP</button>
            </If>
          </div>
      </div>
    );
  }

}
