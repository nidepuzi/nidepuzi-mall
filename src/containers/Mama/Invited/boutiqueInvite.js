import React, { Component } from 'react';
import { Link } from 'react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'underscore';
import { Header } from 'components/Header';
import { Image } from 'components/Image';
import { Checkbox } from 'components/Checkbox';
import { Input } from 'components/Input';
import { Toast } from 'components/Toast';
import { Popup } from 'components/Popup';
import { BottomBar } from 'components/BottomBar';
import { WechatPopup } from 'components/WechatPopup';
import { If } from 'jsx-control-statements';
import * as utils from 'utils';
import * as constants from 'constants';
import * as mamaInfoAction from 'actions/mama/mamaInfo';
import * as detailsAction from 'actions/product/details';
import * as shopBagAction from 'actions/shopBag';
import * as payInfoAction from 'actions/order/payInfo';
import * as commitOrderAction from 'actions/order/commit';
import * as couponAction from 'actions/user/coupons';
import * as inviteSharingAction from 'actions/mama/inviteSharing';
import * as wechatSignAction from 'actions/wechat/sign';
import * as plugins from 'plugins';

import './boutiqueInvite.scss';

const payTypeIcons = {
  wx: 'icon-wechat-pay icon-wechat-green',
  alipay: 'icon-alipay-square icon-alipay-blue',
};

const actionCreators = _.extend(mamaInfoAction, detailsAction, shopBagAction, payInfoAction, commitOrderAction, couponAction, inviteSharingAction, wechatSignAction);

@connect(
  state => ({
    mamaInfo: state.mamaInfo,
    productDetails: state.productDetails,
    payInfo: state.payInfo,
    order: state.commitOrder,
    coupons: state.coupons,
    shopBag: state.shopBag,
    inviteSharing: state.inviteSharing,
    wechatSign: state.wechatSign,
  }),
  dispatch => bindActionCreators(actionCreators, dispatch),
)
export default class BoutiqueInvite extends Component {
  static propTypes = {
    children: React.PropTypes.array,
    location: React.PropTypes.object,
    addProductToShopBag: React.PropTypes.func,
    // fetchPayInfo: React.PropTypes.func,
    // commitOrder: React.PropTypes.func,
    fetchProductDetails: React.PropTypes.func,
    resetProductDetails: React.PropTypes.func,
    resetAddProductToShopBag: React.PropTypes.func,
    fetchBuyNowPayInfo: React.PropTypes.func,
    buyNowCommitOrder: React.PropTypes.func,
    saveMamaInfo: React.PropTypes.func,
    fetchMamaInfo: React.PropTypes.func,
    fetchMamaInfoById: React.PropTypes.func,
    fetchInviteSharing: React.PropTypes.func,
    fetchWechatSign: React.PropTypes.func,
    mamaInfo: React.PropTypes.any,
    shopBag: React.PropTypes.object,
    order: React.PropTypes.object,
    payInfo: React.PropTypes.object,
    coupons: React.PropTypes.object,
    productDetails: React.PropTypes.object,
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
    payTypePopupActive: false,
    chargeEnable: true,
    index: 0,
    popupActive: false,
  }

  componentWillMount() {
    const mmLinkId = this.props.location.query.mm_linkid ? this.props.location.query.mm_linkid : 0;
    const wxPublic = this.props.location.query.wx_public ? Number(this.props.location.query.wx_public) : 0;
    if (mmLinkId !== 0) {
      this.props.fetchMamaInfoById(Number(mmLinkId));
    }
    this.setState({ mmLinkId: mmLinkId });
    this.setState({ wxPublic: wxPublic });

    this.props.fetchProductDetails(25339);
    this.props.fetchWechatSign();
    this.props.fetchInviteSharing(26);
  }

  componentWillReceiveProps(nextProps) {
    const { mamaInfo, productDetails, payInfo, order, coupons, wechatSign, inviteSharing } = nextProps;
    if (nextProps.isLoading) {
      utils.ui.loadingSpinner.show();
    } else if (!nextProps.isLoading) {
      utils.ui.loadingSpinner.hide();
    }

    if (!nextProps.wechatSign.isLoading && nextProps.wechatSign.success) {
      utils.wechat.config(nextProps.wechatSign);
    }

    if (inviteSharing.success && !inviteSharing.isLoading
      && (this.props.inviteSharing.isLoading)) {
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

    if (mamaInfo.mamaInfo.error) {
      Toast.show('获取推荐人妈妈信息失败，请确认填写的ID是否正确');
    }

    if (productDetails.success && productDetails.data) {
      for (let i = 0; i < productDetails.data.sku_info.length; i++) {
        this.setState({ sku: productDetails.data.sku_info[0] });
      }
    }

    if (productDetails.success && productDetails.data && this.props.productDetails.isLoading) {
      this.setState({ productDetail: productDetails.data });
    }

    // Add product resp
    /*
    if (this.props.shopBag.addProduct.isLoading) {
      if (nextProps.shopBag.addProduct.success && nextProps.shopBag.addProduct.data.code === 0) {
        // Toast.show(nextProps.shopBag.addProduct.data.info);
        this.setState({ activeSkuPopup: false });
      }
      if (nextProps.shopBag.addProduct.success && (nextProps.shopBag.addProduct.data.code !== 0)
          && nextProps.shopBag.addProduct.data.info) {
        Toast.show(nextProps.shopBag.addProduct.data.info);
      }

      if (nextProps.shopBag.addProduct.error) {
        switch (nextProps.shopBag.addProduct.status) {
          case 403:
            if (utils.detector.isApp()) {
              plugins.invoke({ method: 'jumpToNativeLogin' });
              return;
            }
            this.context.router.push(`/user/login?next=${encodeURIComponent(this.props.location.pathname + this.props.location.search)}`);
            return;
          case 500:
            Toast.show(nextProps.shopBag.addProduct.data.detail);
            break;
          default:
            Toast.show(nextProps.shopBag.addProduct.data.detail);
            break;
        }
      }
    }

    // query shopbag resp
    if (this.props.shopBag.shopBag.isLoading) {
      if (shopBag.shopBag.success && !_.isEmpty(shopBag.shopBag.data)) {
        const cartIds = shopBag.shopBag.data[0].id;
        this.props.fetchPayInfo(cartIds);
      }
    }*/

    // payinfo resp
    if (this.props.payInfo.isLoading) {
      if (payInfo.error) {
        this.setState({ chargeEnable: true });
        Toast.show('获取支付信息错误');
      }
      // pop pay
      if (payInfo.success && !_.isEmpty(payInfo.data)) {
        this.setState({ payTypePopupActive: true });
      }
    }

    // commit order resp
    if (this.props.order.isLoading) {
      if (order.success && !_.isEmpty(order.data) && order.data.code === 0) {
          this.pay(order.data);
      }

      if (order.success && !_.isEmpty(order.data) && order.data.code !== 0) {
          this.setState({ chargeEnable: true });
          Toast.show(order.data.info);
      }
    }

  }

  componentWillUnmount() {
    this.props.resetProductDetails();
  }

  onChargeClick = (e) => {
    const { productDetails, mamaInfo } = this.props;
    const { type } = e.currentTarget.dataset;
    const skus = productDetails.data.sku_info;

    if (utils.detector.isApp()) {
      Toast.show('只能在微信环境购买，请在微信点击你的铺子会员分享的链接购买');
      return;
    }
    if ((this.state.mmLinkId === undefined || this.state.mmLinkId === 0 || isNaN(this.state.mmLinkId))) {
      Toast.show('请填写推荐人ID');
      return;
    }
    this.props.fetchBuyNowPayInfo(297999, 1, 'wap');
    this.setState({ chargeEnable: false });

  }

  onPayTypeClick = (e) => {
    const { payInfo, mamaInfo } = this.props;
    const { paytype } = e.currentTarget.dataset;

    this.setState({ payTypePopupActive: false });
    /* this.props.commitOrder({
      uuid: payInfo.data.uuid,
      cart_ids: payInfo.data.cart_ids,
      payment: payInfo.data.total_payment,
      post_fee: payInfo.data.post_fee,
      discount_fee: payInfo.data.discount_fee,
      total_fee: payInfo.data.total_fee,
      channel: paytype,
      mm_linkid: mmLinkId,
      order_type: 4, // 对应后台的电子商品类型，不校验地址
    });*/

    this.props.buyNowCommitOrder({
      uuid: payInfo.data.uuid,
      item_id: payInfo.data.sku.product.id,
      sku_id: payInfo.data.sku.id,
      num: 1,
      payment: payInfo.data.total_payment,
      post_fee: payInfo.data.post_fee,
      discount_fee: payInfo.data.discount_fee,
      total_fee: payInfo.data.total_fee,
      channel: paytype,
      mm_linkid: this.state.mmLinkId,
      order_type: 4, // 对应后台的电子商品类型，不校验地址
    });

    e.preventDefault();
  }

  onNumChange = (value) => {
    if (Number(value.target.value) === 0) {
      Toast.show('输入推荐人ID不能为0');
      this.setState({ mmLinkId: '' });
      return;
    }

    this.setState({ mmLinkId: Number(value.target.value) });
    // this.props.fetchMamaInfoById(Number(value.target.value));
  }

  onQueryMamaClick = () => {
    if (!isNaN(this.state.mmLinkId)) {
      this.props.fetchMamaInfoById(Number(this.state.mmLinkId));
    }
  }

  onAdministratorClick = (e) => {
    this.context.router.push('/mama/open/succeed');
    e.preventDefault();
  }

  onShareClick = (e) => {
    const shareInfo = this.props.inviteSharing.data || {};
    if (utils.detector.isWechat()) {
      this.setState({ popupActive: true });
      return;
    }

    plugins.invoke({
      method: 'callNativeUniShareFunc',
      data: {
        share_title: shareInfo.title,
        share_to: '',
        share_desc: shareInfo.active_dec,
        share_icon: shareInfo.share_icon,
        share_type: 'link',
        link: shareInfo.share_link,
      },
    });
  }

  onCloseBtnClick = (e) => {
    this.setState({ popupActive: false });
  }

  togglePayTypePopupActive = () => {
      this.setState({ payTypePopupActive: false, chargeEnable: true });
  }

  payInfo = () => {
    let payInfo = {};
    if (this.props.payInfo.success && (!_.isEmpty(this.props.payInfo.data))) {
      payInfo = this.props.payInfo.data;
      // payInfo.channels = [];
      // if (utils.detector.isApp()) {
      //   payInfo.channels.push({
      //     id: 'wx',
      //     icon: 'icon-wechat-pay icon-wechat-green',
      //     name: '微信支付',
      //   });

      //   payInfo.channels.push({
      //     id: 'alipay',
      //     icon: 'icon-alipay-square icon-alipay-blue',
      //     name: '支付宝',
      //   });
      // } else {
      //   payInfo.channels.push({
      //     id: 'wx_pub',
      //     icon: 'icon-wechat-pay icon-wechat-green',
      //     name: '微信支付',
      //   });

      //   payInfo.channels.push({
      //     id: 'alipay_wap',
      //     icon: 'icon-alipay-square icon-alipay-blue',
      //     name: '支付宝',
      //   });
      // }
    }
    return payInfo;
  }

  pay = (data) => {
    this.setState({ payTypePopupActive: false });
    if (utils.detector.isApp()) {
      plugins.invoke({
        method: 'callNativePurchase',
        data: data,
      });
    } else {
      window.pingpp.createPayment(data.charge, (result, error) => {
        if (result === 'success') {
          Toast.show('支付成功');
          window.location.href = `${data.success_url}`;
          return;
        }
        console.log(result, error);
        Toast.show('支付失败');
        window.location.replace(`${data.fail_url}`);
      });
    }

  }

  render() {
    const { shopBag, mamaInfo } = this.props;
    const imgSrc = (this.state.productDetail && this.state.productDetail.detail_content) ? this.state.productDetail.detail_content.head_img : '';
    const payInfo = this.payInfo();
    const sku = this.state.sku ? this.state.sku : null;
    const trasparentHeader = true;
    const disabled = false;

    return (
      <div className="col-xs-12 col-sm-8 col-sm-offset-2 no-padding content-white-bg boutique-invite">
        <Header title="邀请您加入精品汇" leftIcon="icon-angle-left" onLeftBtnClick={this.context.router.goBack} />
        <div className="bg-white fill-referal">
          <div className="font-md font-weight-700 bottom-border padding-bottom-xxs padding-top-xxs padding-left-xxs">你的铺子会员邀请您加入</div>
          <div className="bottom-border mamaid-item col-xs-12 no-padding">
            <div className="col-xs-3 mamaid-title font-xs">
            <p >推荐人ID:</p>
            </div>
            <input className="input-mmnum col-xs-6" type="number" placeholder="请输入推荐人妈妈ID" value={this.state.mmLinkId !== 0 ? this.state.mmLinkId : ''} required pattern="[1-9][0-9]*$" onChange={this.onNumChange} />
            <div className="col-xs-3 mamaid-query">
            <p className="mamaid-query-p font-orange font-xs text-center button-sm" onClick={this.onQueryMamaClick}>查询</p>
            </div>
          </div>
          <div className="mama-info">
            <div className="col-xs-3">
              <img className="my-thumbnail" src ={(mamaInfo.mamaInfo.success && mamaInfo.mamaInfo.data) ? mamaInfo.mamaInfo.data.thumbnail : ''} />
            </div>
            <div className="col-xs-9">
              <p className="my-mama-id">{'昵称:' + ((mamaInfo.mamaInfo.success && mamaInfo.mamaInfo.data) ? mamaInfo.mamaInfo.data.nick : '')}</p>
            </div>
          </div>
        </div>
        <div className="invite-imgs">
          <Image className="coupon-img" src={constants.image.imageUrl + '/mall/mama/invite/365boutique_01.png'} quality={70} />
          <Image className="coupon-img" src={constants.image.imageUrl + '/mall/mama/invite/365boutique_02_5.png'} quality={70} />
          <Image className="coupon-img" src={constants.image.imageUrl + '/mall/mama/invite/365boutique_03.png'} quality={70} />
          <Image className="coupon-img" src={constants.image.imageUrl + '/mall/mama/invite/365boutique_04.png'} quality={70} />
          <Image className="coupon-img" src={constants.image.imageUrl + '/mall/mama/invite/365boutique_05.png'} quality={70} />
          <Image className="coupon-img" src={constants.image.imageUrl + '/mall/mama/invite/365boutique_06.png'} quality={70} />
          <Image className="coupon-img" src={constants.image.imageUrl + '/mall/mama/invite/365boutique_08.png'} quality={70} />
        </div>
        <BottomBar className="clearfix" size="medium">
          <If condition={this.state.wxPublic === 0}>
            <button className="button col-xs-4 col-xs-offset-1 no-padding font-orange" type="button" onClick={this.onShareClick}>
              {'分享此页面'}
            </button>
            </If>
            <If condition={this.state.wxPublic === 1}>
            <button className="button col-xs-4 col-xs-offset-1 no-padding font-orange" type="button" onClick={this.onAdministratorClick} disabled={disabled}>
              {'咨询管理员'}
            </button>
            </If>
          <button className="button button-energized col-xs-4 col-xs-offset-1 no-padding" type="button" data-type={3} onClick={this.onChargeClick} disabled={!this.state.chargeEnable}>
            {'直接支付'}
          </button>
        </BottomBar>
        <Popup active={this.state.payTypePopupActive} className="pay-type-popup">
          <div className="row no-margin bottom-border">
            <i className="col-xs-1 no-padding icon-close font-orange" onClick={this.togglePayTypePopupActive}></i>
            <p className="col-xs-11 no-padding text-center">
              <span className="font-xs">应付款金额</span>
              <span className="font-lg font-orange">{`￥${payInfo.total_payment && payInfo.total_payment.toFixed(2)}`}</span>
            </p>
          </div>
          {payInfo.channels && (payInfo.channels.length > 0) && payInfo.channels.map((channel) =>
            (
              <div className="bottom-border pay-type-item" key={channel.id} data-paytype={channel.id} onClick={this.onPayTypeClick}>
                <If condition={channel.id.indexOf('wx') >= 0 }>
                  <i className={`${payTypeIcons.wx} icon-2x margin-right-xxs`}></i>
                </If>
                <If condition={channel.id.indexOf('alipay') >= 0 }>
                  <i className={`${payTypeIcons.alipay} icon-2x margin-right-xxs`}></i>
                </If>
                <span className="inline-block margin-top-xxs">{channel.name}</span>
              </div>
            )
          )}
        </Popup>
        <WechatPopup active={this.state.popupActive} onCloseBtnClick={this.onCloseBtnClick}/>
      </div>
    );
  }
}
