import React, { Component } from 'react';
import { Link } from 'react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'underscore';
import { Image } from 'components/Image';
import { Checkbox } from 'components/Checkbox';
import { Input } from 'components/Input';
import { Toast } from 'components/Toast';
import { Popup } from 'components/Popup';
import { If } from 'jsx-control-statements';
import * as utils from 'utils';
import * as constants from 'constants';
import * as mamaInfoAction from 'actions/mama/mamaInfo';
import * as mamaOrderAction from 'actions/mama/mamaOrder';
import * as mamaChargeAction from 'actions/mama/mamaCharge';
import * as inviteSharingAction from 'actions/mama/inviteSharing';
import * as wechatSignAction from 'actions/wechat/sign';

import './index.scss';

const pageInfos = {
  'mct.html': {
    type: 'trail',
    banner: '//og224uhh3.qnssl.com/mall/opening-shop-banner.jpg',
    id: 2,
    shareId: 27,
    btn: '马上一元开店',
  },
  'mcf.html': {
    type: 'full',
    banner: `${constants.image.imageUrl}/mall/mama/open/v2/188.png`,
    id: 0,
    shareId: 38,
    btn: '支付',
  },
};

const actionCreators = _.extend(mamaInfoAction, mamaOrderAction, mamaChargeAction, inviteSharingAction, wechatSignAction);

@connect(
  state => ({
    mamaInfo: state.mamaInfo,
    mamaOrder: state.mamaOrder,
    mamaCharge: state.mamaCharge,
    inviteSharing: state.inviteSharing,
    wechatSign: state.wechatSign,
  }),
  dispatch => bindActionCreators(actionCreators, dispatch),
)
export default class Charge extends Component {
  static propTypes = {
    children: React.PropTypes.array,
    location: React.PropTypes.object,
    saveMamaInfo: React.PropTypes.func,
    fetchMamaOrder: React.PropTypes.func,
    fetchMamaCharge: React.PropTypes.func,
    fetchInviteSharing: React.PropTypes.func,
    fetchWechatSign: React.PropTypes.func,
    mamaInfo: React.PropTypes.any,
    mamaOrder: React.PropTypes.any,
    mamaCharge: React.PropTypes.any,
    verifyCode: React.PropTypes.any,
    inviteSharing: React.PropTypes.object,
    wechatSign: React.PropTypes.object,
  };

  static contextTypes = {
    router: React.PropTypes.object,
  };

  constructor(props, context) {
    super(props);
    context.router;
  }

  state = {
    phone: '',
    code: '',
    payTypePopupActive: false,
  }

  componentWillMount() {
    const { mama_id } = this.props.location.query;
    const { location } = this.props;
    const pageInfo = pageInfos[location.pathname];
    if (pageInfo.type === 'trail') {
      Toast.show('一元开店活动已经结束，更优惠的活动马上开始，敬请等待！');
      window.location.replace('/mall/mama/open/failed');
      return;
    }

    if (pageInfo) {
      this.setState({ pageInfo: pageInfo });
    }

    this.props.saveMamaInfo({
      mama_id: mama_id,
    });
    this.props.fetchMamaOrder();
    this.props.fetchInviteSharing(pageInfo.shareId);
    this.props.fetchWechatSign();
  }

  componentWillReceiveProps(nextProps) {
    const { mamaInfo, mamaOrder, mamaCharge, inviteSharing, wechatSign } = nextProps;
    utils.wechat.config(wechatSign);
    if (!inviteSharing.isLoading && inviteSharing.success) {
      const shareInfo = {
        success: inviteSharing.success,
        data: {
          title: inviteSharing.data.title,
          desc: inviteSharing.data.active_dec,
          share_link: inviteSharing.data.share_link,
          share_img: inviteSharing.data.share_icon,
        },
      };
      utils.wechat.configShareContent(shareInfo);
    }

    if (mamaCharge.success && !mamaCharge.isLoading && !_.isEmpty(mamaCharge.data)) {
      this.pay(mamaCharge.data);
    }

    /*
    // 正式妈妈邀请页面，并且存在妈妈信息，且为99或188元正式妈妈，那么直接显示开店成功
    //if ((!_.isEmpty(mamaInfo.data)) && (mamaInfo.data.last_renew_type === 183 || mamaInfo.data.last_renew_type === 365)) {
    //  this.context.router.replace(`/mama/open/succeed?mamaId=${mamaInfo.data.id}`);
    //}
    */
  }

  componentWillUnmount() {
    this.props.fetchInviteSharing(27);
  }

  onChargeClick = (e) => {
    const { paytype } = e.currentTarget.dataset;
    this.setState({ payChannel: paytype });
    const mamaOrder = this.props.mamaOrder.data || {};
    const { id } = this.state.pageInfo;
    const { mama_id } = this.props.location.query;
    const { mamaInfo } = this.props;
    this.props.fetchMamaCharge({
      product_id: mamaOrder.product.id,
      sku_id: mamaOrder.product.normal_skus[id].id,
      payment: mamaOrder.payinfos[id].total_payment,
      channel: paytype,
      num: 1,
      post_fee: 0,
      discount_fee: 0,
      mm_linkid: mama_id,
      uuid: mamaOrder.uuid,
      total_fee: mamaOrder.payinfos[id].total_payment,
      success_url: `/mall/mama/open/succeed?mamaId=${mamaInfo.mamaInfo.data[0].id}`,
      cancel_url: '/mall/mama/open/failed',
    });
  }

  togglePayTypePopupActive = () => {
    const { mama_id } = this.props.location.query;
    const { mamaInfo } = this.props;
    // if (mamaInfo.success && !_.isEmpty(mamaInfo.data) && !mamaInfo.data.can_trial) {
    //  Toast.show('您已经是你的铺子会员');
    //  return;
    // }

    if (this.state.pageInfo.type === 'trail') {
      Toast.show('一元开店活动已经结束，更优惠的活动马上开始，敬请等待！');
      window.location.replace('/mall/mama/open/failed');
    } else {
      this.setState({ payTypePopupActive: !this.state.payTypePopupActive });
    }
  }

  payInfo = () => {
    const { id } = this.state.pageInfo;
    let payInfo = { total_payment: 0 };
    if (!_.isEmpty(this.props.mamaOrder.data.payinfos)) {
      payInfo = this.props.mamaOrder.data.payinfos[id];
      payInfo.channels = [];
      if (payInfo.weixin_payable) {
        payInfo.channels.push({
          id: 'wx_pub',
          icon: 'icon-wechat-pay icon-wechat-green',
          name: '微信支付',
        });
      }
      if (payInfo.alipay_payable) {
        payInfo.channels.push({
          id: 'alipay_wap',
          icon: 'icon-alipay-square icon-alipay-blue',
          name: '支付宝',
        });
      }
    }
    return payInfo;
  }

  pay = (charge) => {
    this.setState({ payTypePopupActive: !this.state.payTypePopupActive });
    window.pingpp.createPayment(charge, (result, error) => {
      if (result === 'success') {
        window.location.replace('/mall/mama/open/succeed');
        return;
      }
      window.location.replace('/mall/mama/open/failed');
    });
  }

  render() {
    const { banner, btn, type } = this.state.pageInfo;
    const payInfo = this.payInfo();
    return (
      <div className="col-xs-12 col-sm-8 col-sm-offset-2 no-padding content-white-bg opening-shop">
        <Image style={{ width: '100%' }} src={banner} quality={70} />
        <div className="row no-margin text-center margin-bottom-xs">
          <button className="col-xs-10 col-xs-offset-1 button button-energized" onClick={this.togglePayTypePopupActive}>{btn}</button>
        </div>
          <If condition={type === 'trail'}>
            <div className="row no-margin text-center margin-bottom-xs">
              <Checkbox className="margin-bottom-xs" checked>同意</Checkbox>
              <Link to="/mama/agreement">一元体验15天你的铺子会员服务条款！</Link>
            </div>
          </If>
          <If condition={type === 'full'}>
            <div className="row no-margin text-center margin-bottom-xs">
              <Checkbox className="margin-bottom-xs" checked>同意</Checkbox>
              <a href="/static/tiaokuan.html">你的铺子会员服务条款！</a>
            </div>
          </If>
        <Popup active={this.state.payTypePopupActive} className="pay-type-popup">
          <div className="row no-margin bottom-border">
            <i className="col-xs-1 no-padding icon-close font-orange" onClick={this.togglePayTypePopupActive}></i>
            <p className="col-xs-11 no-padding text-center">
              <span className="font-xs">应付款金额</span>
              <span className="font-lg font-orange">{`￥${payInfo.total_payment && payInfo.total_payment.toFixed(2)}`}</span>
            </p>
          </div>
          {payInfo.channels && payInfo.channels.map((channel) =>
            (
              <div className="bottom-border pay-type-item" key={channel.id} data-paytype={channel.id} onClick={this.onChargeClick}>
                <i className={`${channel.icon} icon-2x margin-right-xxs`}></i>
                <span className="inline-block margin-top-xxs">{channel.name}</span>
              </div>
            )
          )}
        </Popup>
      </div>
    );
  }
}
