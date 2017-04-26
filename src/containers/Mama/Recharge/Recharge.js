import React, { Component } from 'react';
import { Link } from 'react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'underscore';
import { Header } from 'components/Header';
import { Image } from 'components/Image';
import { Checkbox } from 'components/Checkbox';
import { Radio } from 'components/Radio';
import { Input } from 'components/Input';
import { Toast } from 'components/Toast';
import { Popup } from 'components/Popup';
import { BottomBar } from 'components/BottomBar';
import { If } from 'jsx-control-statements';
import * as utils from 'utils';
import * as constants from 'constants';
import * as mamaInfoAction from 'actions/mama/mamaInfo';
import * as detailsAction from 'actions/product/details';
import * as shopBagAction from 'actions/shopBag';
import * as payInfoAction from 'actions/order/payInfo';
import * as commitOrderAction from 'actions/order/commit';
import * as couponAction from 'actions/user/coupons';
import * as wechatSignAction from 'actions/wechat/sign';
import * as plugins from 'plugins';

import './Recharge.scss';

const payTypeIcons = {
  wx: 'icon-wechat-pay icon-wechat-green',
  alipay: 'icon-alipay-square icon-alipay-blue',
};

const eliteMamaUpgradeScore = [
  { level: '经理', score: 100 },
  { level: '主管', score: 600 },
  { level: '副总裁', score: 2000 },
  { level: '合伙人', score: 6000 },
  { level: '高级合伙人', score: 20000 },
];

const actionCreators = _.extend(mamaInfoAction, detailsAction, shopBagAction, payInfoAction, commitOrderAction, couponAction, wechatSignAction);

@connect(
  state => ({
    mamaInfo: state.mamaInfo,
    productDetails: state.productDetails,
    payInfo: state.payInfo,
    order: state.commitOrder,
    coupons: state.coupons,
    shopBag: state.shopBag,
    wechatSign: state.wechatSign,
  }),
  dispatch => bindActionCreators(actionCreators, dispatch),
)
export default class Recharge extends Component {
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
    resetPayInfo: React.PropTypes.func,
    buyNowCommitOrder: React.PropTypes.func,
    fetchMamaInfo: React.PropTypes.func,
    fetchWechatSign: React.PropTypes.func,
    mamaInfo: React.PropTypes.any,
    shopBag: React.PropTypes.object,
    order: React.PropTypes.object,
    payInfo: React.PropTypes.object,
    coupons: React.PropTypes.object,
    productDetails: React.PropTypes.object,
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
    useWallet: false,
  }

  componentWillMount() {
    this.props.fetchMamaInfo();
    this.props.fetchProductDetails(25339);
  }

  componentWillReceiveProps(nextProps) {
    const { productDetails, payInfo, order, coupons, wechatSign } = nextProps;
    const mamaInfo = nextProps.mamaInfo.mamaInfo;
    const mmLinkId = (mamaInfo.data && mamaInfo.data.length > 0) ? mamaInfo.data[0].id : 0;
    const referalMamaid = this.props.location.query.mama_id ? this.props.location.query.mama_id : mmLinkId;
    if (nextProps.isLoading) {
      utils.ui.loadingSpinner.show();
    } else if (!nextProps.isLoading) {
      utils.ui.loadingSpinner.hide();
    }

    if (mamaInfo.success && mamaInfo.data && mamaInfo.data[0].elite_level && productDetails.success && productDetails.data) {
      this.setState({ sku: productDetails.data.sku_info[0] });
    }

    if (productDetails.success && productDetails.data && this.props.productDetails.isLoading) {
      this.setState({ productDetail: productDetails.data });
      this.props.fetchBuyNowPayInfo(productDetails.data.sku_info[0].sku_items[0].sku_id, 1, 'wap');
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
        if (!this.state.chargeEnable) {
          if (this.state.useWallet && payInfo.data.budget_cash >= (payInfo.data.total_fee)) {
            this.props.buyNowCommitOrder({
              uuid: payInfo.data.uuid,
              item_id: payInfo.data.sku.product.id,
              sku_id: payInfo.data.sku.id,
              num: 1,
              payment: payInfo.data.total_payment,
              post_fee: payInfo.data.post_fee,
              discount_fee: payInfo.data.discount_fee,
              total_fee: payInfo.data.total_fee,
              channel: 'budget',
              mm_linkid: referalMamaid,
              order_type: 4, // 对应后台的电子商品类型，不校验地址
              pay_extras: this.getPayExtras(),
            });
            return;
          }
          this.setState({ payTypePopupActive: true });
        } else {
          this.setState({ budgetCash: payInfo.data.budget_cash });
        }
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
    const { productDetails } = this.props;
    const mamaInfo = this.props.mamaInfo.mamaInfo;
    const { type } = e.currentTarget.dataset;
    const skus = productDetails.data.sku_info;
    const payInfo = this.props.payInfo;
    const mmLinkId = mamaInfo.data ? mamaInfo.data[0].id : 0;
    const referalMamaid = this.props.location.query.mama_id ? this.props.location.query.mama_id : mmLinkId;

    if (mamaInfo && mamaInfo.data && (mamaInfo.data.length > 0)) {
      if (this.state.selectId) {
        // this.props.addProductToShopBag(this.state.sku.product_id, this.state.sku.sku_items[0].sku_id, this.state.num);
        // 精品券默认是在app上支付
        this.props.resetPayInfo();
        if (utils.detector.isApp()) {
          this.props.fetchBuyNowPayInfo(this.state.selectId, 1, 'app');
        } else {
          this.props.fetchBuyNowPayInfo(this.state.selectId, 1, 'wap');
        }

        this.setState({ chargeEnable: false });
      } else {
        Toast.show('请选择一个充值选项');
      }
    }
  }

  onPayTypeClick = (e) => {
    const { payInfo } = this.props;
    const mamaInfo = this.props.mamaInfo.mamaInfo;
    const { paytype } = e.currentTarget.dataset;
    const mmLinkId = mamaInfo.data ? mamaInfo.data[0].id : 0;
    const referalMamaid = this.props.location.query.mama_id ? this.props.location.query.mama_id : mmLinkId;

    this.setState({ payTypePopupActive: false });

    if (mmLinkId === 0) {
      Toast.show('你的铺子会员信息获取不全，请重进此页面！！');
      e.preventDefault();
      return;
    }

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
      mm_linkid: referalMamaid,
      order_type: 4, // 对应后台的电子商品类型，不校验地址
      pay_extras: this.getPayExtras(),
    });

    e.preventDefault();
  }

  onAdministratorClick = (e) => {
    this.context.router.push('/mama/open/succeed');
    e.preventDefault();
  }

  getPayExtras = () => {
    const self = this;
    const { payInfo } = this.props;
    const { useWallet } = this.state;
    const payExtras = [];

    _.each(payInfo.data.pay_extras, (extra) => {
      console.log(extra.pid === 3, payInfo.data.total_fee);

      if (extra.pid === 3 && useWallet && payInfo.data.budget_cash > 0 && self.getDisplayPrice(payInfo.data.total_fee) > 0) {
        payExtras.push('pid:' + extra.pid + ':value:' + payInfo.data.budget_cash);
      }
      if (extra.pid === 3 && useWallet && payInfo.data.budget_cash >= (payInfo.data.total_fee)) {
        payExtras.push('pid:' + extra.pid + ':budget:' + (payInfo.data.total_fee).toFixed(2));
      }

    });
    return payExtras.join(','); // pid:1:value:2,pid:2:value:3:cunponid:2
  }

  getpPaymentPrice = (totalPrice) => {
    const { payInfo } = this.props;
    const { useWallet } = this.state;
    const value = totalPrice || 0;

    if (useWallet && payInfo.data.budget_cash >= (payInfo.data.total_fee)) {
      return (payInfo.data.total_fee).toFixed(2);
    }
    return value.toFixed(2);
  }

  getDisplayPrice = (totalPrice) => {
    const { payInfo } = this.props;
    const { useWallet } = this.state;
    let displayPrice = payInfo.data.total_fee || 0;

    if (useWallet) {
      if (totalPrice && payInfo.data.budget_cash >= payInfo.data.total_fee) {
        displayPrice = 0;
      }
      if (totalPrice && payInfo.data.budget_cash < payInfo.data.total_fee) {
        displayPrice = displayPrice - payInfo.data.budget_cash;
      }
    }

    if (displayPrice < 0) {
      displayPrice = 0;
    }
    return displayPrice.toFixed(2);
  }

  handleChange = (e) => {
    this.setState({ selectId: e.target.value });
    this.props.resetPayInfo();
  }

  handleUseWalletChange = (e) => {
    this.setState({ useWallet: !this.state.useWallet });
  }

  togglePayTypePopupActive = () => {
      this.setState({ payTypePopupActive: false, chargeEnable: true });
  }

  payInfo = () => {
    let payInfo = {};
    if (this.props.payInfo.success && (!_.isEmpty(this.props.payInfo.data))) {
      payInfo = this.props.payInfo.data;
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
    const { shopBag } = this.props;
    const mamaInfo = this.props.mamaInfo.mamaInfo;
    const imgSrc = (this.state.productDetail && this.state.productDetail.detail_content) ? this.state.productDetail.detail_content.head_img : '';
    const payInfo = this.payInfo();
    const sku = this.state.sku ? this.state.sku : null;
    const trasparentHeader = false;
    const disabled = false;
    let walletValue = '';

    if (this.state.budgetCash) {
      walletValue = this.state.budgetCash + '元 ';
      if (this.state.useWallet && payInfo && (!_.isEmpty(payInfo))) {
        if (this.state.budgetCash > payInfo.total_payment) {
          walletValue += '使用' + payInfo.total_payment + '元 ';
        } else {
          walletValue += '使用' + this.state.budgetCash + '元 ';
        }
      }
    }

    return (
      <div className="col-xs-12 col-sm-8 col-sm-offset-2 no-padding content-white-bg recharge-info">
        <Header trasparent={trasparentHeader} title="小鹿精品币充值" leftIcon="icon-angle-left" onLeftBtnClick={this.context.router.goBack} />
        <div className="invite-imgs">
          <Image className="coupon-img" src={imgSrc} quality={70} />
        </div>
        <div className="bottom-border">
          {sku && (sku.sku_items.length > 0) && sku.sku_items.map((item) =>
            (
              <If condition={ item.sku_id !== 297999 }>
              <div className="margin-left-sm margin-right-sm" key={item.sku_id} data-paytype={item.sku_id} >
                <label className="text-center">
                <Checkbox className="inline-block margin-top-xxs" value={item.sku_id} checked = {this.state.selectId === item.sku_id} onChange={this.handleChange} />
                {' ' + item.name + ' ' + item.agent_price + '元 '}
                </label>
              </div>
              </If>
            )
          )}
        </div>
        <div className="margin-left-sm margin-right-sm" >
          <label className="text-center">
          <Checkbox className="inline-block margin-top-xxs" value={1} checked = {this.state.useWallet} onChange={this.handleUseWalletChange} />
          {' 零钱' + walletValue}
          </label>
        </div>
        <div>
          <p className="col-xs-offset-1 font-xs">购买条款说明：铺子币仅限专业版精英妈妈充值及使用，充值越多越优惠。铺子币能方便和自由的用来购买各种精品券，减少换券的烦恼。铺子币不能退还，不能提现。购买即表明同意此条款。</p>
        </div>
        <ul className="bottom-border upgrade-score">
          {eliteMamaUpgradeScore.map((item) =>
            (
              <li className="margin-left-sm margin-right-sm upgrade-score-d" key={item.level} >
                <div className="text-center col-xs-6">{item.level}</div>
                <div className="text-center col-xs-6">{item.score + '积分'}</div>
              </li>
            )
          )}
        </ul>
        <BottomBar className="clearfix" size="medium">
          <button className="button button-energized col-xs-10 col-xs-offset-1 no-padding" type="button" data-type={3} onClick={this.onChargeClick} disabled={!this.state.chargeEnable}>
            {'直接支付'}
          </button>
        </BottomBar>
        <Popup active={this.state.payTypePopupActive} className="pay-type-popup">
          <div className="row no-margin bottom-border">
            <i className="col-xs-1 no-padding icon-close font-orange" onClick={this.togglePayTypePopupActive}></i>
            <p className="col-xs-11 no-padding text-center">
              <span className="font-xs">应付款金额</span>
              <span className="font-lg font-orange">{`￥${this.getDisplayPrice(payInfo.total_payment)}`}</span>
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
      </div>
    );
  }
}
