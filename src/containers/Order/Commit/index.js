import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { If } from 'jsx-control-statements';
import { Header } from 'components/Header';
import { BottomBar } from 'components/BottomBar';
import { Radio } from 'components/Radio';
import { Checkbox } from 'components/Checkbox';
import { Popup } from 'components/Popup';
import { LogisticsPopup } from 'components/LogisticsPopup';
import { Toast } from 'components/Toast';
import classnames from 'classnames';
import * as constants from 'constants';
import * as utils from 'utils';
import * as plugins from 'plugins';
import pingpp from 'vendor/pingpp';
import _ from 'underscore';
import * as addressAction from 'actions/user/address';
import * as couponAction from 'actions/user/coupon';
import * as payInfoAction from 'actions/order/payInfo';
import * as commitOrderAction from 'actions/order/commit';

import './index.scss';

const actionCreators = _.extend(addressAction, couponAction, payInfoAction, commitOrderAction);

const payTypeIcons = {
  wx_pub: 'icon-wechat-pay icon-wechat-green',
  alipay_wap: 'icon-alipay-square icon-alipay-blue',
  wx: 'icon-wechat-pay icon-wechat-green',
  alipay: 'icon-alipay-square icon-alipay-blue',
};

@connect(
  state => ({
    address: state.address,
    coupon: state.coupon,
    payInfo: state.payInfo,
    order: state.commitOrder,
  }),
  dispatch => bindActionCreators(actionCreators, dispatch),
)
export default class Commit extends Component {

  static propTypes = {
    prefixCls: React.PropTypes.string,
    params: React.PropTypes.object,
    location: React.PropTypes.object,
    address: React.PropTypes.object,
    coupon: React.PropTypes.object,
    order: React.PropTypes.object,
    payInfo: React.PropTypes.object,
    fetchPayInfo: React.PropTypes.func,
    fetchCouponById: React.PropTypes.func,
    resetCoupon: React.PropTypes.func,
    fetchAddress: React.PropTypes.func,
    commitOrder: React.PropTypes.func,
  };

  static contextTypes = {
    router: React.PropTypes.object,
  };

  static defaultProps = {
    prefixCls: 'order-confirm',
  };

  constructor(props, context) {
    super(props);
    context.router;
  }

  state = {
    walletChecked: false,
    walletBalance: 0,
    logisticsCompanyId: '',
    logisticsCompanyName: '自动分配',
    payTypePopupActive: false,
    logisticsPopupShow: false,
    agreePurchaseTerms: true,
    isShowPurchaseTerms: false,
    couponNum: 1,
    commitOrderEnable: true,
    isAllVirtualProduct: false,
  }

  componentWillMount() {
    const { cartIds, addressId, couponId } = this.props.location.query;
    this.props.fetchAddress(addressId ? addressId : 'get_default_address');
    this.props.fetchPayInfo(cartIds);

    if (couponId) {
      let firstCoupon = couponId;
      let couponNum = 1;
      if (couponId.indexOf('/') > 0) {
        firstCoupon = couponId.split('/')[0];
        couponNum = couponId.split('/').length;
      }

      this.setState({ couponNum: couponNum });
      this.props.fetchCouponById(firstCoupon);
    }
  }

  componentDidMount() {
    this.props.resetCoupon();
  }

  componentWillReceiveProps(nextProps) {
    const { order, payInfo, address } = nextProps;
    const { router } = this.context;

    if (order.error && this.props.order.isLoading) {
      Toast.show('网络错误，请重试。');
    }
    if (order.success && this.props.order.isLoading) {
      if (order.data.code === 0 && order.data.charge && order.data.charge.channel !== 'budget') {
        this.pay(order.data);
      }

      if (order.data.code === 0 && order.data.charge && order.data.charge.channel === 'budget') {
        if (order.data.charge.success) {
          if (payInfo.success && payInfo.data.cart_list[0].model_id === 25514) {
            window.location.href = '/mall/mama/open/succeed';
            return;
          }
          // window.location.replace(order.data.success_url);
          // return;
        }
        // window.location.replace(order.data.fail_url);
      }

      if (order.data.code !== 0) {
        this.setState({ commitOrderEnable: true });
        Toast.show(order.data.info);
      }
    }

    if (payInfo.isLoading || order.isLoading || address.isLoading) {
      utils.ui.loadingSpinner.show();
    } else {
      utils.ui.loadingSpinner.hide();
    }
    if (payInfo.error) {
      this.context.router.goBack();
    }
    if (payInfo.success) {
      const products = payInfo.data.cart_list || [];
      const isAllVirtualProduct = this.checkAllVirtualProduct(products);
      this.setState({ isAllVirtualProduct: isAllVirtualProduct });
    }
  }

  componentWillUnmount() {
    this.props.resetCoupon();
  }

  onCommitOrderClick = (e) => {
    const { address, payInfo, coupon } = this.props;
    const { walletChecked, xiaoluCoinChecked, walletBalance, walletPayType, logisticsCompanyId, agreePurchaseTerms } = this.state;
    let mmLinkId = this.props.location.query.mm_linkid ? this.props.location.query.mm_linkid : 0;
    const teambuyId = this.props.location.query.teambuyId;
    const cookieMamaLinkId = utils.cookie.getCookie('mm_linkid');
    if (Number(mmLinkId) === 0 && cookieMamaLinkId && Number(cookieMamaLinkId) > 0) {
      mmLinkId = cookieMamaLinkId;
    }

    if (!address.data.id && !this.state.isAllVirtualProduct) {
      Toast.show('请填写收货地址！');
      return;
    }
    if (!agreePurchaseTerms) {
      Toast.show('请勾选购买条款！');
      return;
    }
    if (!(payInfo && payInfo.success && payInfo.data)) {
      Toast.show('支付信息获取失败，请刷新此页面！');
      return;
    }

    if (this.checkNeedIdentification()) {
      Toast.show('订单中包含进口保税区发货商品，根据海关监管要求，需要提供收货人身份证号码。此信息加密保存，只用于此订单海关通关。请您点击收货地址-修改-进行填写');
      this.context.router.push(`user/address/edit/${address.data.id}?source_type=` + payInfo.data.max_personalinfo_level);
      return;
    }

    this.setState({ commitOrderEnable: false });

    if ((walletChecked || xiaoluCoinChecked) && walletBalance >= payInfo.data.total_fee && _.isEmpty(coupon.data)) {
      this.props.commitOrder({
        uuid: payInfo.data.uuid,
        cart_ids: payInfo.data.cart_ids,
        payment: this.getpPaymentPrice(payInfo.data.total_payment),
        post_fee: payInfo.data.post_fee,
        discount_fee: this.getDiscountValue(),
        total_fee: payInfo.data.total_fee,
        addr_id: address.data.id,
        channel: 'budget',
        logistics_company_id: logisticsCompanyId,
        pay_extras: this.getPayExtras(),
        teambuy_id: teambuyId,
        mm_linkid: mmLinkId,
        order_type: (this.state.isAllVirtualProduct ? 4 : 0),
        orderUrl: this.props.location.pathname + this.props.location.search,
      });
      return;
    }
    if ((walletChecked || xiaoluCoinChecked) && walletBalance >= (payInfo.data.total_fee - coupon.data.coupon_value * this.state.couponNum)) {
      this.props.commitOrder({
        uuid: payInfo.data.uuid,
        cart_ids: payInfo.data.cart_ids,
        payment: this.getpPaymentPrice(payInfo.data.total_payment),
        post_fee: payInfo.data.post_fee,
        discount_fee: this.getDiscountValue(),
        total_fee: payInfo.data.total_fee,
        addr_id: address.data.id,
        channel: 'budget',
        logistics_company_id: logisticsCompanyId,
        pay_extras: this.getPayExtras(),
        teambuy_id: teambuyId,
        mm_linkid: mmLinkId,
        order_type: (this.state.isAllVirtualProduct ? 4 : 0),
        orderUrl: this.props.location.pathname + this.props.location.search,
      });
      return;
    }
    if (coupon.data.coupon_value * this.state.couponNum >= payInfo.data.total_fee) {
      this.props.commitOrder({
        uuid: payInfo.data.uuid,
        cart_ids: payInfo.data.cart_ids,
        payment: this.getpPaymentPrice(payInfo.data.total_payment),
        post_fee: payInfo.data.post_fee,
        discount_fee: this.getDiscountValue(),
        total_fee: payInfo.data.total_fee,
        addr_id: address.data.id,
        channel: 'budget',
        logistics_company_id: logisticsCompanyId,
        pay_extras: this.getPayExtras(),
        teambuy_id: teambuyId,
        mm_linkid: mmLinkId,
        order_type: (this.state.isAllVirtualProduct ? 4 : 0),
        orderUrl: this.props.location.pathname + this.props.location.search,
      });
      return;
    }

    // 进入这里，说明需要进行微信支付宝支付，打开支付类型选择界面
    this.togglePayTypePopupActive();
    return;
  }

  onPayTypeClick = (e) => {
    const { address, payInfo } = this.props;
    const { walletChecked, walletBalance, walletPayType, logisticsCompanyId } = this.state;
    const { paytype } = e.currentTarget.dataset;
    let mmLinkId = this.props.location.query.mm_linkid ? this.props.location.query.mm_linkid : 0;
    const teambuyId = this.props.location.query.teambuyId;
    const cookieMamaLinkId = utils.cookie.getCookie('mm_linkid');
    if (Number(mmLinkId) === 0 && cookieMamaLinkId && Number(cookieMamaLinkId) > 0) {
      mmLinkId = cookieMamaLinkId;
    }

    this.props.commitOrder({
      uuid: payInfo.data.uuid,
      cart_ids: payInfo.data.cart_ids,
      payment: this.getpPaymentPrice(payInfo.data.total_payment),
      post_fee: payInfo.data.post_fee,
      discount_fee: this.getDiscountValue(),
      total_fee: payInfo.data.total_fee,
      addr_id: address.data.id,
      channel: this.getPayType(paytype),
      logistics_company_id: logisticsCompanyId,
      pay_extras: this.getPayExtras(),
      teambuy_id: teambuyId,
      mm_linkid: mmLinkId,
      order_type: (this.state.isAllVirtualProduct ? 4 : 0),
      orderUrl: this.props.location.pathname + this.props.location.search,
    });
    this.togglePayTypePopupActive();
    e.preventDefault();
  }

  // select coupon
  onLinkClick = (e) => {
    this.context.router.push(e.currentTarget.dataset.to);
    e.preventDefault();
  }

  onWalletChange = (e) => {
    if (e.target.payType === 'budget') {
      this.setState({
        walletChecked: !this.state.walletChecked,
        walletBalance: Number(e.target.walletBalance),
        walletPayType: e.target.payType,
        xiaoluCoinChecked: false,
      });
    } else if (e.target.payType === 'xiaolucoin') {
      this.setState({
        walletChecked: false,
        walletBalance: Number(e.target.walletBalance),
        walletPayType: e.target.payType,
        xiaoluCoinChecked: !this.state.xiaoluCoinChecked,
      });
    }
    e.preventDefault();
  }

  onLogisticsCompanyChange = (e) => {
    const { value, name } = e.currentTarget.dataset;
    this.setState({
      logisticsCompanyId: value,
      logisticsCompanyName: name,
      logisticsPopupShow: false,
    });
    e.preventDefault();
  }

  onShowLogisticsPopUpClick = (e) => {
    this.setState({ logisticsPopupShow: true });
    e.preventDefault();
  }

  onColseLogisticsPopupClick = (e) => {
    this.setState({ logisticsPopupShow: false });
    e.preventDefault();
  }

  onAgreePurchaseTermsChange = (e) => {
    if (this.state.agreePurchaseTerms) {
      this.setState({ agreePurchaseTerms: false });
    } else {
      this.setState({ agreePurchaseTerms: true });
    }
    e.preventDefault();
  }

  onShowPurchaseItermsClick = (e) => {
    if (this.state.isShowPurchaseTerms) {
      this.setState({ isShowPurchaseTerms: false });
    } else {
      this.setState({ isShowPurchaseTerms: true });
    }
    e.preventDefault();
  }

  getPayExtras = () => {
    const self = this;
    const { coupon, payInfo } = this.props;
    const { walletChecked, xiaoluCoinChecked, walletBalance, walletPayType } = this.state;
    const payExtras = [];
    let couponValue = 0;

    if (coupon && coupon.data && coupon.data.coupon_value) {
      couponValue = coupon.data.coupon_value * this.state.couponNum;
    }

    _.each(payInfo.data.pay_extras, (extra) => {
      console.log(extra.pid === 4, xiaoluCoinChecked, walletBalance, payInfo.data.total_fee, couponValue);
      if (extra.pid === 3 && walletChecked && walletBalance > 0 && self.getDisplayPrice(payInfo.data.total_fee) > 0) {
        payExtras.push('pid:' + extra.pid + ':value:' + extra.value);
      }
      if (extra.pid === 3 && walletChecked && walletBalance >= (payInfo.data.total_fee - couponValue)) {
        payExtras.push('pid:' + extra.pid + ':budget:' + (payInfo.data.total_fee - couponValue).toFixed(2));
      }
      if (extra.pid === 4 && xiaoluCoinChecked && walletBalance > 0 && self.getDisplayPrice(payInfo.data.total_fee) > 0) {
        payExtras.push('pid:' + extra.pid + ':value:' + extra.value);
      }
      if (extra.pid === 4 && xiaoluCoinChecked && walletBalance >= (payInfo.data.total_fee - couponValue)) {
        payExtras.push('pid:' + extra.pid + ':budget:' + (payInfo.data.total_fee - couponValue).toFixed(2));
      }
      if (extra.pid === 2 && self.getDiscountValue() > 0) {
        payExtras.push('pid:' + extra.pid + ':value:' + self.getDiscountValue() + ':couponid:' + this.props.location.query.couponId);
      }
    });
    return payExtras.join(','); // pid:1:value:2,pid:2:value:3:cunponid:2
  }

  getPayType = (payType) => {
    const { coupon, payInfo } = this.props;
    const { walletChecked, xiaoluCoinChecked, walletBalance, walletPayType } = this.state;
    if (coupon.data.coupon_value * this.state.couponNum >= payInfo.data.total_fee
      || ((walletChecked || xiaoluCoinChecked) && walletBalance >= (payInfo.data.total_fee - coupon.data.coupon_value * this.state.couponNum))) {
      return 'budget';
    }
    if (walletChecked && payInfo.data.total_fee <= walletBalance) {
      return walletPayType;
    }
    return payType;
  }

  getpPaymentPrice = (totalPrice) => {
    const { coupon, payInfo } = this.props;
    const { walletChecked, walletBalance, walletPayType } = this.state;
    let value = totalPrice || 0;
    if (coupon.data.coupon_value * this.state.couponNum >= payInfo.data.total_fee) {
      return 0;
    }
    if (walletChecked && walletBalance >= (payInfo.data.total_fee - coupon.data.coupon_value * this.state.couponNum)) {
      return (payInfo.data.total_fee - coupon.data.coupon_value * this.state.couponNum).toFixed(2);
    }
    if (value > 0 && coupon.success && coupon.data.status === 0 && payInfo.data.total_fee >= coupon.data.use_fee) {
      value = value - coupon.data.coupon_value * this.state.couponNum;
    }
    return value.toFixed(2);
  }

  getDisplayPrice = (totalPrice) => {
    const { coupon, payInfo } = this.props;
    const { walletChecked, xiaoluCoinChecked, walletBalance } = this.state;
    let displayPrice = payInfo.data.total_fee || 0;
    // 目前实现小鹿币和零钱互斥，只能选1个支付
    if (walletChecked) {
      if (totalPrice && walletChecked && walletBalance >= payInfo.data.total_fee) {
        displayPrice = 0;
      }
      if (totalPrice && walletChecked && walletBalance < payInfo.data.total_fee) {
        displayPrice = displayPrice - walletBalance;
      }
    } else if (xiaoluCoinChecked) {
      if (totalPrice && xiaoluCoinChecked && walletBalance >= payInfo.data.total_fee) {
        displayPrice = 0;
      }
      if (totalPrice && xiaoluCoinChecked && walletBalance < payInfo.data.total_fee) {
        displayPrice = displayPrice - walletBalance;
      }
    }
    if (displayPrice > 0 && coupon.success && coupon.data.status === 0 && payInfo.data.total_fee >= coupon.data.use_fee) {
      displayPrice = displayPrice - coupon.data.coupon_value * this.state.couponNum;
      if (displayPrice < 0) {
        displayPrice = 0;
      }
    }
    if (displayPrice < 0) {
      displayPrice = 0;
    }
    return displayPrice.toFixed(2);
  }

  getTotalPrice = () => {
    const { coupon, payInfo } = this.props;
    let totalPrice = payInfo.data.total_fee || 0;
    if (totalPrice > 0 && coupon.success && coupon.data.status === 0 && payInfo.data.total_fee >= coupon.data.use_fee
        && payInfo.data.total_fee >= payInfo.data.discount_fee) {
      totalPrice = totalPrice - coupon.data.coupon_value * this.state.couponNum;
      if (totalPrice < 0) {
        totalPrice = 0;
      }
    }
    return totalPrice.toFixed(2);
  }

  getDiscountValue() {
    const { coupon, payInfo } = this.props;
    const { walletChecked, walletBalance, walletPayType } = this.state;
    let discount = 0;
    if (coupon.data.coupon_value * this.state.couponNum >= payInfo.data.total_fee) {
      return payInfo.data.total_fee;
    }
    if (walletChecked && walletBalance >= (payInfo.data.total_fee - coupon.data.coupon_value * this.state.couponNum)) {
      discount = coupon.data.coupon_value * this.state.couponNum;
    }
    if (coupon.success && coupon.data.status === 0 && payInfo.data.total_fee >= coupon.data.use_fee) {
      discount = coupon.data.coupon_value * this.state.couponNum;
    } else if (coupon.success && (coupon.data.status !== 0 || payInfo.data.total_fee < coupon.data.use_fee)) {
      this.props.resetCoupon();
      Toast.show('优惠券不可用！');
    }
    return discount.toFixed(2);
  }

  getChannel = () => {
    let payInfo = {};
    let channels = [];
    if (this.props.payInfo.success && (!_.isEmpty(this.props.payInfo.data))) {
      payInfo = this.props.payInfo.data;
      channels = payInfo.channels;
    }
    return channels;
  }

  togglePayTypePopupActive = () => {
    this.setState({ payTypePopupActive: !this.state.payTypePopupActive });
  }

  pay = (data) => {
    const payInfo = this.props.payInfo.data;
    this.togglePayTypePopupActive();
    if (utils.detector.isApp()) {
      plugins.invoke({
        method: 'callNativePurchase',
        data: data,
      });
    } else {
      window.pingpp.createPayment(data.charge, (result, error) => {
        if (result === 'success') {
          Toast.show('支付成功');
          // window.location.push(`${data.success_url}`);
          if (payInfo && payInfo.cart_list[0].model_id === 25514) {
            window.location.href = '/mall/mama/open/succeed';
            return;
          }
          window.location.href = `${data.success_url}`;
          return;
        }
        Toast.show('支付失败');
        window.location.replace(`${data.fail_url}`);
      });
    }
  }

  checkNeedIdentification = () => {
    const { address, payInfo } = this.props;
    if (address.success && address.data && payInfo.success && payInfo.data) {
      let isBondedGoods = false;
      if (payInfo && payInfo.data && payInfo.data.max_personalinfo_level > 1) {
        isBondedGoods = true;
      }

      if (isBondedGoods && _.isEmpty(address.data.identification_no)) {
        return true;
      }
    }

    return false;
  }

  checkAllVirtualProduct = (products) => {
    let result = false;
    let num = 0;
    if (products.length === 0) {
      return result;
    }
    for (let i = 0; i < products.length; i++) {
      if (products[i].product_type === 1) {
        num += 1;
      }
    }
    if (num === products.length) {
      result = true;
    }
    return result;
  }

  renderProducts(products = []) {
    const { prefixCls } = this.props;
    return (
      <div className={`${prefixCls}-product-list`}>
        {products.map((product, index) => {
          return (
            <div key={product.id} className="row no-margin bottom-border">
              <div className="col-xs-3 no-padding">
                <img src={product.pic_path + constants.image.square} />
              </div>
              <div className="col-xs-9 no-padding padding-top-xxs font-xs">
                <p className="row no-margin no-wrap">{product.title}</p>
                <p className="row no-margin margin-top-xxxs font-grey">{'尺寸: ' + product.sku_name}</p>
                <p className="row no-margin margin-top-xxxs">
                  <span className="">{'￥' + product.price.toFixed(2)}</span>
                  <span className="padding-left-xs">{'x' + product.num}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  render() {
    const { prefixCls, payInfo, order, coupon } = this.props;
    const products = payInfo.data.cart_list || [];
    const logisticsCompanies = payInfo.data.logistics_companys || [];
    const payExtras = payInfo.data.pay_extras || [];
    const address = this.props.address.data || {};
    const isAllVirtualProduct = this.checkAllVirtualProduct(products);
    const channels = this.getChannel();
    const { pathname, query } = this.props.location;
    const addressLink = '/user/address?source_type=' + ((payInfo && payInfo.data) ? payInfo.data.max_personalinfo_level : 0)
                    + '&next=' + encodeURIComponent(pathname + '?cartIds=' + query.cartIds
                    + (query.teambuyId ? '&teambuyId=' + query.teambuyId : '')
                    + (query.mm_linkid ? '&mm_linkid=' + query.mm_linkid : '')
                    + (query.couponId ? '&couponId=' + query.couponId : ''))
                    ;
    const couponLink = '/order/selectcoupon?cartIds=' + query.cartIds + (products.length > 0 ? '&goodsnum=' + products[0].num : '')
                    + '&next=' + encodeURIComponent(pathname + '?cartIds=' + query.cartIds
                    + (query.teambuyId ? '&teambuyId=' + query.teambuyId : '')
                    + (query.mm_linkid ? '&mm_linkid=' + query.mm_linkid : '')
                    + (query.addressId ? '&addressId=' + query.addressId : ''));
    return (
      <div className={`${prefixCls}`}>
        <Header title="确认订单" leftIcon="icon-angle-left" onLeftBtnClick={this.context.router.goBack} />
        <div className="content">
          <If condition={!isAllVirtualProduct}>
          <div className={`row no-margin bottom-border ${prefixCls}-address`} data-to={addressLink} onClick={this.onLinkClick}>
            <If condition={!_.isEmpty(address)}>
              <i className="col-xs-1 no-padding margin-top-xxs icon-location icon-2x icon-yellow-light"></i>
              <div className="col-xs-10">
                <p><span className="margin-right-sm">{address.receiver_name}</span><span>{address.receiver_mobile}</span></p>
                <p className="font-grey-light">{address.receiver_state + address.receiver_city + address.receiver_district + address.receiver_address}</p>
              </div>
              <i className="col-xs-1 no-padding margin-top-28 text-right icon-angle-right icon-grey"></i>
            </If>
            <If condition={_.isEmpty(address)}>
              <i className="col-xs-1 no-padding icon-location icon-2x icon-yellow-light"></i>
              <div className="col-xs-10 margin-top-xxs">填写收货地址</div>
              <i className="col-xs-1 no-padding margin-top-xxs text-right icon-angle-right icon-grey"></i>
            </If>
          </div>
          <If condition={payInfo && payInfo.data && payInfo.data.max_personalinfo_level > 1}>
          <div className="col-xs-12 address-tips">
            <p className="font-xs font-red">温馨提示:保税区和直邮发货根据海关要求需要提供身份证号码，为了避免清关失败，提供的身份证必须和收货人一致。如需修改，请您点击收货地址-编辑-进行填写。</p>
          </div>
          </If>
          <div className={`row no-margin bottom-border margin-top-xs ${prefixCls}-row`}>
            <p className="col-xs-5 no-margin no-padding">物流配送</p>
            <div className="col-xs-7 no-padding" onClick={this.onShowLogisticsPopUpClick}>
              <p className="col-xs-11 no-margin no-padding text-right">{this.state.logisticsCompanyName}</p>
              <i className="col-xs-1 no-padding margin-top-28 text-right icon-angle-right icon-grey"></i>
            </div>
          </div>
          </If>
          {this.renderProducts(products)}
          {payExtras.map((item) => {
            switch (item.pid) {
              case 2:
                if (item.pid === 2 && !item.use_coupon_allowed) {
                  return null;
                }
                return (
                  <div className={`row no-margin bottom-border margin-top-xs ${prefixCls}-row`} key={item.pid} data-to={couponLink} onClick={this.onLinkClick}>
                    <p className="col-xs-4 no-padding">优惠券</p>
                    <p className="col-xs-8 no-padding">
                      <Choose>
                        <When condition = {this.state.couponNum > 1}>
                          <span className="col-xs-11 no-padding text-right">{'￥' + coupon.data.coupon_value + '元优惠券' + (' x ' + this.state.couponNum + '张') + '=' + this.getDiscountValue() + '元 '}</span>
                        </When>
                        <When condition = {this.state.couponNum === 1}>
                          <span className="col-xs-11 no-padding text-right">{'￥-' + this.getDiscountValue() + '元优惠券'}</span>
                        </When>
                      </Choose>
                      <i className="col-xs-1 no-padding margin-top-28 text-right icon-angle-right icon-grey"></i>
                    </p>
                  </div>
                );
              case 3:
                if (item.pid === 3 && !item.use_budget_allowed) {
                  return null;
                }
                return (
                  <div className={`row no-margin bottom-border ${prefixCls}-row`} key={item.pid}>
                    <p className="col-xs-5 no-padding">零钱</p>
                    <p className="col-xs-7 no-padding">
                      <span className="col-xs-10 no-padding text-right">{item.value}</span>
                      <Checkbox className="col-xs-2" checked={this.state.walletChecked} walletBalance={item.value} payType={item.channel} onChange={this.onWalletChange}/>
                    </p>
                  </div>
                );
              case 4:
                if (!(item.pid === 4 && item.use_coin_allowed && item.value > 0)) {
                  return null;
                }
                return (
                  <div className={`row no-margin bottom-border ${prefixCls}-row`} key={item.pid}>
                    <p className="col-xs-5 no-padding">币</p>
                    <p className="col-xs-7 no-padding">
                      <span className="col-xs-10 no-padding text-right">{item.value}</span>
                      <Checkbox className="col-xs-2" checked={this.state.xiaoluCoinChecked} walletBalance={item.value} payType={item.channel} onChange={this.onWalletChange}/>
                    </p>
                  </div>
                );
              default:
                break;
            }
          })}
          <div className={`row no-margin bottom-border margin-top-xs ${prefixCls}-row`}>
            <p className="col-xs-8 no-padding" onClick={this.onShowPurchaseItermsClick}>我已阅读并同意购买条款</p>
            <Checkbox className="col-xs-4 no-padding text-right" checked={this.state.agreePurchaseTerms} onChange={this.onAgreePurchaseTermsChange}/>
          </div>
          <div className={`row no-margin ${prefixCls}-row transparent`}>
            <p className="col-xs-12 no-padding">
              <span className="col-xs-5 no-padding text-left">商品金额</span>
              <span className="col-xs-7 no-padding text-right font-orange">{'￥' + payInfo.data.total_fee}</span>
            </p>
            <p className="col-xs-12 margin-top-xxs no-padding">
              <span className="col-xs-5 no-padding text-left">运费</span>
              <span className="col-xs-7 no-padding text-right">{payInfo.data.post_fee}</span>
            </p>
          </div>
        </div>
        <BottomBar size="large">
          <p>
            <span className="font-xs">应付款金额</span>
            <span className="font-lg font-orange">{'￥' + this.getDisplayPrice(payInfo.data.total_payment)}</span>
          </p>
          <button className="button button-energized col-xs-12" type="button" onClick={this.onCommitOrderClick} disabled={!this.state.commitOrderEnable}>购买</button>
        </BottomBar>
        <Popup active={this.state.payTypePopupActive} className="pay-type-popup">
          <div className={`row no-margin bottom-border `}>
            <i className="col-xs-1 padding-left-xxs padding-top-xxs icon-close font-orange" onClick={this.togglePayTypePopupActive}></i>
            <div className="col-xs-11">
              <p className="no-margin text-center font-xs">应付款金额</p>
              <p className="no-margin text-center font-lg font-orange">{'￥' + this.getDisplayPrice(payInfo.data.total_payment)}</p>
            </div>
          </div>
          {channels.map((channel) => {
            if (!channel.payable) {
              return null;
            }
            return (
              <div className="bottom-border pay-type-item" key={channel.id} data-paytype={channel.id} onClick={this.onPayTypeClick}>
                <i className={`${constants.payTypeIcons[channel.id]} icon-2x margin-right-xxs`}></i>
                <span className="inline-block margin-top-xxs">{channel.name}</span>
              </div>
            );
          })}
        </Popup>
        <Popup active={this.state.isShowPurchaseTerms}>
          <p className="font-md text-center">购买条款</p>
          <p className="font-xs">
            亲爱的用户，由于特卖商城购买人数过多和供应商供货原因，可能存在极少数用户出现缺货的情况。
          </p>
          <p className="font-xs">
            为了减少您长时间的等待，一旦出现这种情况，我们将在您购买一周后帮您自动退款，并补偿给您一张为全场通用优惠劵。
          </p>
          <p className="font-xs">
            质量问题退货会以现金券或零钱形式补偿10元邮费。
          </p>
          <p className="font-xs">
           订单向工厂订货后无法退款，需要收货后走退货流程或者换货。
          </p>
          <p className="font-xs">
            给您带来不便，敬请谅解！祝您购物愉快！本条款解释权归你的铺子特卖商城所有。
          </p>
          <div className="row no-margin">
            <button className="col-xs-10 col-xs-offset-1 margin-top-xs button button-sm button-energized" type="button" onClick={this.onShowPurchaseItermsClick} disabled={this.state.save}>确定</button>
          </div>
        </Popup>
        <LogisticsPopup active={this.state.logisticsPopupShow} companies={logisticsCompanies} onItemClick={this.onLogisticsCompanyChange} onColsePopupClick={this.onColseLogisticsPopupClick}/>
      </div>
    );
  }
}
