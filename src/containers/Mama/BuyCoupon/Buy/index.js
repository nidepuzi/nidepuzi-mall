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
import { If } from 'jsx-control-statements';
import * as utils from 'utils';
import * as mamaInfoAction from 'actions/mama/mamaInfo';
import * as detailsAction from 'actions/product/details';
import * as shopBagAction from 'actions/shopBag';
import * as payInfoAction from 'actions/order/payInfo';
import * as commitOrderAction from 'actions/order/commit';
import * as couponAction from 'actions/user/coupons';
import * as plugins from 'plugins';
import * as constants from 'constants';

import './index.scss';

const payTypeIcons = {
  wx: 'icon-wechat-pay icon-wechat-green',
  alipay: 'icon-alipay-square icon-alipay-blue',
};

const actionCreators = _.extend(mamaInfoAction, detailsAction, shopBagAction, payInfoAction, commitOrderAction, couponAction);

@connect(
  state => ({
    mamaInfo: state.mamaInfo,
    productDetails: state.productDetails,
    payInfo: state.payInfo,
    order: state.commitOrder,
    coupons: state.coupons,
    shopBag: state.shopBag,
  }),
  dispatch => bindActionCreators(actionCreators, dispatch),
)
export default class BuyCoupon extends Component {
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
    fetchMamaInfo: React.PropTypes.func,
    applyNegotiableCoupons: React.PropTypes.func,
    resetApplyNegotiableCoupons: React.PropTypes.func,
    mamaInfo: React.PropTypes.any,
    shopBag: React.PropTypes.object,
    order: React.PropTypes.object,
    payInfo: React.PropTypes.object,
    coupons: React.PropTypes.object,
    productDetails: React.PropTypes.object,
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
    num: 5,
    minBuyNum: 5,
    chargeEnable: true,
  }

  componentWillMount() {
    const { query } = this.props.location;

    this.props.fetchMamaInfo();
    this.props.fetchProductDetails(query.modelid);
  }

  componentWillReceiveProps(nextProps) {
    const { mamaInfo, productDetails, payInfo, order, coupons } = nextProps;
    let mmLinkId = '';
    if (nextProps.isLoading) {
      utils.ui.loadingSpinner.show();
    } else if (!nextProps.isLoading) {
      utils.ui.loadingSpinner.hide();
    }

    if (nextProps.mamaInfo.mamaInfo.error) {
      switch (nextProps.mamaInfo.mamaInfo.status) {
        case 403:
          if (utils.detector.isApp()) {
            plugins.invoke({ method: 'jumpToNativeLogin' });
            return;
          }
          this.context.router.push(`/user/login?next=${encodeURIComponent(this.props.location.pathname + this.props.location.search)}`);
          return;
        case 500:
          Toast.show(nextProps.mamaInfo.mamaInfo.data.detail);
          return;
        default:
          Toast.show(nextProps.mamaInfo.mamaInfo.data.detail);
          return;
      }
    }

    if (this.props.mamaInfo.mamaInfo.isLoading && mamaInfo.mamaInfo.success && mamaInfo.mamaInfo.data && !(mamaInfo.mamaInfo.data[0].charge_status === 'charged'
        && (mamaInfo.mamaInfo.data[0].is_elite_mama))) {
        Toast.show('您还不是小鹿精英妈妈，无法申请或购买精品券。请关注你的铺子公众号或联系客服了解更多信息。');
        this.context.router.replace('/mama/elitemama');
        return;
    }

    if (mamaInfo.mamaInfo.success && mamaInfo.mamaInfo.data && mamaInfo.mamaInfo.data[0].elite_level && productDetails.success && productDetails.data) {
      mmLinkId = mamaInfo.mamaInfo.data[0].id;
      for (let i = 0; i < productDetails.data.sku_info.length; i++) {
        if (productDetails.data.sku_info[i].name.indexOf(mamaInfo.mamaInfo.data[0].elite_level) >= 0) {
          this.setState({ sku: productDetails.data.sku_info[i] });
        }
      }
    }

    if (productDetails.success && productDetails.data && this.props.productDetails.isLoading) {
      this.setState({ productDetail: productDetails.data });
      if (productDetails.data.sku_info[0].elite_score >= constants.minBuyScore) {
        this.setState({ num: 1, minBuyNum: 1 });
      } else {
        if (productDetails.data.sku_info[0].elite_score * 5 < constants.minBuyScore) {
          this.setState({ num: 5, minBuyNum: 5 });
        } else {
          const buyNum = Math.ceil(constants.minBuyScore / productDetails.data.sku_info[0].elite_score);
          this.setState({ num: buyNum, minBuyNum: buyNum });
        }
      }
    }

    // Add product resp
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


    // add shop bag
    const { shopBag } = nextProps.shopBag;
    if (shopBag.success && !_.isEmpty(shopBag.data) && this.props.shopBag.shopBag.isLoading && !this.state.chargeEnable) {
      const cartId = shopBag.data[0].id;
      if (productDetails.data && productDetails.data.detail_content && productDetails.data.detail_content.is_boutique) {
        // 特卖抢购商品直接进入支付页面
        if (utils.detector.isApp()) {
          const jumpUrl = 'com.danlai.ndpz://app/v1/trades/purchase?cart_id=' + cartId + '&type=' + shopBag.data[0].type;
          plugins.invoke({
            method: 'jumpToNativeLocation',
            data: { target_url: jumpUrl },
          });
        } else {
          window.location.href = `/mall/oc.html?cartIds=${encodeURIComponent(cartId)}&mm_linkid=${mmLinkId}`;
        }
      }
    }

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

    // apply coupon
    if (this.props.coupons.applynegotiable.isLoading) {
      if (coupons.applynegotiable.success && !_.isEmpty(coupons.applynegotiable.data) && coupons.applynegotiable.data.code === 0) {
          Toast.show('申请精品券成功');
          this.context.router.push('/mama/inoutcoupon');
      }

      if (coupons.applynegotiable.success && !_.isEmpty(coupons.applynegotiable.data) && coupons.applynegotiable.data.code !== 0) {
          Toast.show(coupons.applynegotiable.data.info);
      }
    }

  }

  componentWillUnmount() {
    this.props.resetAddProductToShopBag();
    this.props.resetProductDetails();
    this.props.resetApplyNegotiableCoupons();
  }

  onChargeClick = (e) => {
    const { productDetails } = this.props;
    const mamaInfo = this.props.mamaInfo.mamaInfo;
    const { type } = e.currentTarget.dataset;
    const skus = productDetails.data.sku_info;

    if (this.state.num <= 0) {
      Toast.show('对不起，输入的商品个数不对，请重新输入');
      return;
    }

    if (mamaInfo && mamaInfo.data && (mamaInfo.data.length > 0) && mamaInfo.data[0].elite_level !== 'Associate') {
      if (Number(this.state.num) < this.state.minBuyNum) {
        Toast.show('精品券购买个数不能小于最低购买张数' + this.state.minBuyNum + '张');
        return;
      }
    } else if (mamaInfo && mamaInfo.data && (mamaInfo.data.length > 0) && mamaInfo.data[0].elite_level === 'Associate') {
      if (constants.restrictAssociateBuyScore) {
        if (Number(this.state.num) < this.state.minBuyNum) {
          Toast.show('精品券购买个数不能小于最低购买张数' + this.state.minBuyNum + '张');
          return;
        }
      }
    }

    if (mamaInfo && mamaInfo.data && (mamaInfo.data.length > 0) && mamaInfo.data[0].charge_status === 'charged'
        && mamaInfo.data[0].status === 'effect' && (mamaInfo.data[0].is_elite_mama)) {
      if (this.state.sku) {
          this.props.addProductToShopBag(this.state.sku.product_id, this.state.sku.sku_items[0].sku_id, this.state.num, 6); // use vitual cart type
        } else {
          Toast.show('商品信息获取不全');
        }
      // if (mamaInfo.data[0].is_buyable) {
      //   if (this.state.sku) {
      //     this.props.addProductToShopBag(this.state.sku.product_id, this.state.sku.sku_items[0].sku_id, this.state.num, 6); // use vitual cart type
      //   } else {
      //     Toast.show('商品信息获取不全');
      //   }
      //    20170120 购券支付同意该到commit order页面，此处类似精品汇或团购直接购买，不经过购物车直接跳转
      //     if (this.state.sku) {
      //     // this.props.addProductToShopBag(this.state.sku.product_id, this.state.sku.sku_items[0].sku_id, this.state.num);
      //     // 精品券默认是在app上支付
      //     if (utils.detector.isApp()) {
      //       this.props.fetchBuyNowPayInfo(this.state.sku.sku_items[0].sku_id, this.state.num, 'app');
      //     } else {
      //       this.props.fetchBuyNowPayInfo(this.state.sku.sku_items[0].sku_id, this.state.num, 'wap');
      //     }
      //   } else {
      //     Toast.show('商品信息获取不全');
      //   }
      // } else {
      //   // Toast.show('对不起，只有专业版精英你的铺子会员才能购买此精品券，请先加入精英妈妈！！');
      //   if (this.state.sku) {
      //     this.props.applyNegotiableCoupons(this.state.sku.product_id, this.state.num);
      //   } else {
      //     Toast.show('商品信息获取不全');
      //   }
      // }
    } else {
      Toast.show('您还不是小鹿精英妈妈，无法申请或购买精品券。请关注你的铺子公众号或联系客服了解更多信息。');
    }
    this.setState({ chargeEnable: false });
  }

  onPayTypeClick = (e) => {
    const { payInfo } = this.props;
    const mamaInfo = this.props.mamaInfo.mamaInfo;
    const { paytype } = e.currentTarget.dataset;
    const mmLinkId = mamaInfo.data ? mamaInfo.data[0].id : 0;

    this.setState({ payTypePopupActive: false });
    console.log(mmLinkId);
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
      num: this.state.num,
      payment: payInfo.data.total_payment,
      post_fee: payInfo.data.post_fee,
      discount_fee: payInfo.data.discount_fee,
      total_fee: payInfo.data.total_fee,
      channel: paytype,
      mm_linkid: mmLinkId,
      order_type: 4, // 对应后台的电子商品类型，不校验地址
    });

    e.preventDefault();
  }

  onUpdateQuantityClick = (e) => {
    const { action } = e.currentTarget.dataset;
    if (action === 'minus' && Number(this.state.num) === 1) {
      e.preventDefault();
      return false;
    }

    switch (action) {
      case 'plus':
        this.setState({ num: this.state.num + 1 });
        break;
      case 'minus':
        /* if (Number(this.state.num - 1) < this.state.minBuyNum) {
          Toast.show('特卖商品券购买个数不能小于最低购买张数' + this.state.minBuyNum + '张');
          break;
        }*/
        this.setState({ num: this.state.num - 1 });
        break;
      default:
        break;
    }
    e.preventDefault();
  }

  onNumChange = (value) => {
    if (Number(value.target.value) >= 10000) {
      Toast.show('输入个数不能为0或超过10000');
      return;
    }

    /* if ((Number(value.target.value) > 0)
        && Number(value.target.value) < this.state.minBuyNum) {
      Toast.show('特卖商品券购买个数不能小于最低购买张数' + this.state.minBuyNum + '张');
      return;
    }*/

    this.setState({ num: Number(value.target.value) });
  }

  onShopbagClick = (e) => {
    const mamaInfo = this.props.mamaInfo.mamaInfo;
    if (mamaInfo && mamaInfo.data && (mamaInfo.data.length > 0) && mamaInfo.data[0].charge_status === 'charged' && mamaInfo.data[0].status === 'effect' && (mamaInfo.data[0].is_elite_mama)) {
      this.context.router.push('/shop/bag?is_buyable=' + ((mamaInfo.success && mamaInfo.data && mamaInfo.data[0].is_buyable) ? '1' : '0')
        + '&type=6' + '&elite_level=' + mamaInfo.data[0].elite_level + '&xiaolucoin=' + ((mamaInfo.success && mamaInfo.data && Number(mamaInfo.data[0].xiaolucoin_cash) > 0) ? '1' : '0'));
    } else {
      Toast.show('您还不是小鹿精英妈妈，无法申请或购买精品券。请关注你的铺子公众号或联系客服了解更多信息。');
    }
    e.preventDefault();
  }

  onAddToShopBagClick = (e) => {
    const { sku, num } = this.state;
    const { type } = e.currentTarget.dataset;

    if (sku) {
      this.props.addProductToShopBag(sku.product_id, sku.sku_items[0].sku_id, num, 6); // use vitual cart type
    }

    e.preventDefault();
  }

  getEliteLevelPrice = (detail) => {
    let result = [];
    const mamaInfo = this.props.mamaInfo.mamaInfo;
    if (detail && detail.sku_info.length === 5) {
      for (let i = detail.sku_info.length - 1; i >= 0; i--) {
        if (detail.sku_info[i].name.indexOf('Associate') >= 0) {
          const item = { name: '经理', price: detail.sku_info[i].agent_price };
          result[0] = item;
        } else if (detail.sku_info[i].name.indexOf('Director') >= 0) {
          const item = { name: '主管', price: detail.sku_info[i].agent_price };
          result[1] = item;
        } else if (detail.sku_info[i].name.indexOf('VP') >= 0) {
          const item = { name: '副总裁', price: detail.sku_info[i].agent_price };
          result[2] = item;
        } else if (detail.sku_info[i].name.indexOf('Partner') >= 0) {
          const item = { name: '合伙人', price: detail.sku_info[i].agent_price };
          result[3] = item;
        } else if (detail.sku_info[i].name.indexOf('SP') >= 0) {
          const item = { name: '高级合伙人', price: detail.sku_info[i].agent_price };
          result[4] = item;
        }
      }
    }

    if (mamaInfo && mamaInfo.data && (mamaInfo.data.length > 0)) {
      if (mamaInfo.data[0].elite_level.indexOf('Associate') >= 0) {
        result = result.slice(0, 1);
      } else if (mamaInfo.data[0].elite_level.indexOf('Director') >= 0) {
        result = result.slice(0, 2);
      } else if (mamaInfo.data[0].elite_level.indexOf('VP') >= 0) {
        result = result.slice(0, 3);
      } else if (mamaInfo.data[0].elite_level.indexOf('Partner') >= 0) {
        result = result.slice(0, 4);
      }
    }
    return result;
  }

  togglePayTypePopupActive = () => {
      this.setState({ payTypePopupActive: false, chargeEnable: true });
  }

  payInfo = () => {
    let payInfo = {};
    if (this.props.payInfo.success && (!_.isEmpty(this.props.payInfo.data))) {
      payInfo = this.props.payInfo.data;
      /* payInfo.channels = [];
      if (utils.detector.isApp()) {
        payInfo.channels.push({
          id: 'wx',
          icon: 'icon-wechat-pay icon-wechat-green',
          name: '微信支付',
        });

        payInfo.channels.push({
          id: 'alipay',
          icon: 'icon-alipay-square icon-alipay-blue',
          name: '支付宝',
        });
      } else {
        payInfo.channels.push({
          id: 'wx_pub',
          icon: 'icon-wechat-pay icon-wechat-green',
          name: '微信支付',
        });

        payInfo.channels.push({
          id: 'alipay_wap',
          icon: 'icon-alipay-square icon-alipay-blue',
          name: '支付宝',
        });
      }*/
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
    const trasparentHeader = true;
    const disabled = false;
    let badge = 0;
    const levelPrice = this.getEliteLevelPrice(this.state.productDetail);

    if (shopBag.shopBagQuantity.data) {
      badge = shopBag.shopBagQuantity.data.result;
    }

    return (
      <div className="col-xs-12 col-sm-8 col-sm-offset-2 no-padding content-white-bg buycoupon">
        <Header trasparent={trasparentHeader} title="入券" leftIcon="icon-angle-left" onLeftBtnClick={this.context.router.goBack} />
        <Image className="coupon-img" src={imgSrc} quality={70} />
        <div className="product-info bottom-border bg-white col-xs-offset-1">
          <div className="row no-margin">
            <p className="col-xs-10 no-padding font-md">{(this.state.productDetail && this.state.productDetail.detail_content && sku) ? this.state.productDetail.detail_content.name + '/' + sku.name : '' }</p>
          </div>
          <div className="row no-margin ">
            <p className="no-padding">
              <span className="font-32">{'￥' + (sku ? sku.agent_price : '')}</span>
              <span className="font-grey">/</span>
              <span className="font-xs font-grey-light text-line-through">{'￥' + (sku ? sku.std_sale_price : '')}</span>
              <span className="font-grey font-xs" style={{ paddingLeft: '8px' }}>{(sku) ? '积分' + sku.elite_score : ''}</span>
            </p>
          </div>
          <If condition={levelPrice.length > 0}>
          {levelPrice.map((item, index) => {
            return (<div className="row no-margin" key={index}>
              <div className="no-padding no-margin">
                <p className="font-xs col-xs-6" style={{ paddingLeft: '8px' }}>{item.name}</p>
                <p className="font-xs col-xs-6" >{item.price + '元'}</p>
              </div>
            </div>);
            })
          }
          </If>
        </div>
        <div className="row coupon-num">
          <div className="text-center cart-quantity">
            <i className="icon-minus icon-yellow" data-action="minus" onClick={this.onUpdateQuantityClick}></i>
            <input className="input-num" type="number" value={this.state.num} required pattern="[1-9][0-9]*$" onChange={this.onNumChange} />
            <i className="icon-plus icon-yellow" data-action="plus" onClick={this.onUpdateQuantityClick}></i>
          </div>
        </div>
        <div>
          <p className="col-xs-offset-1 font-xs">规则说明：本精品优惠券仅限专业版精英妈妈购买及流通使用。精品券可以加入购物车与其它精品券组合购买，不能与普通商品组合购买。
          <span className="font-red">购买精品券不是购买真实商品，不会发货，流转精品券或兑换订单可以获得佣金收益。</span>
          </p>
        </div>
        <BottomBar className="clearfix" size="medium">
            <div className="col-xs-2 no-padding shop-cart">
              <div onClick={this.onShopbagClick}>
                <i className="icon-coupon-o icon-yellow"></i>
                <If condition={badge > 0}>
                  <span className="shop-cart-badge no-wrap">{badge}</span>
                </If>
              </div>
            </div>
            <button className="button col-xs-4 col-xs-offset-1 no-padding font-orange" type="button" data-type={`单独购买`} onClick={this.onAddToShopBagClick} disabled={disabled}>
              {'加入购券组合'}
            </button>
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
      </div>
    );
  }
}
