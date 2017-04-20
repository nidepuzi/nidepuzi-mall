import React, { Component } from 'react';
import { Link } from 'react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'underscore';
import * as constants from 'constants';
import * as utils from 'utils';
import * as plugins from 'plugins';
import * as shopbagAction from 'actions/shopBag';
import * as couponAction from 'actions/user/coupons';
import { Header } from 'components/Header';
import { Toast } from 'components/Toast';
import { BottomBar } from 'components/BottomBar';

import './index.scss';

const actionCreators = _.extend(shopbagAction, couponAction);
@connect(
  state => ({
    shopBag: state.shopBag,
    coupons: state.coupons,
  }),
  dispatch => bindActionCreators(actionCreators, dispatch),
)
export class ShopBag extends Component {
  static propTypes = {
    location: React.PropTypes.object,
    shopBag: React.PropTypes.object,
    ishome: React.PropTypes.object,
    fetchShopBag: React.PropTypes.func,
    fetchShopBagHistory: React.PropTypes.func,
    applyNegotiableCoupons: React.PropTypes.func,
    resetApplyNegotiableCoupons: React.PropTypes.func,
    updateQuantity: React.PropTypes.func,
    rebuy: React.PropTypes.func,
    coupons: React.PropTypes.object,
  };

  static contextTypes = {
    router: React.PropTypes.object,
  };

  constructor(props, context) {
    super(props);
    context.router;
  }

  state = {
    isBuyable: 1,
    applyNum: 0,
    mmLinkId: 0,
  }

  componentWillMount() {
    const type = this.props.location.query.type ? this.props.location.query.type : 5;
    const buyable = this.props.location.query.is_buyable ? this.props.location.query.is_buyable : 1;
    const level = this.props.location.query.elite_level ? this.props.location.query.elite_level : '';
    const xiaolucoin = this.props.location.query.xiaolucoin ? this.props.location.query.xiaolucoin : 0;
    const mmLinkId = this.props.location.query.mm_linkid ? this.props.location.query.mm_linkid : 0;
    this.setState({ type: type, isBuyable: buyable, eliteLevel: level, xiaolucoin: xiaolucoin, mmLinkId: mmLinkId });

    this.props.fetchShopBag(type);
    this.props.fetchShopBagHistory(type);
  }

  componentWillReceiveProps(nextProps) {
    const { updateQuantity, shopBag, shopBagHistory } = nextProps.shopBag;
    const { coupons } = nextProps;
    if (updateQuantity.success && updateQuantity.data.code === 2) {
      Toast.show(updateQuantity.data.info);
    }
    if (shopBag.isLoading || shopBagHistory.isLoading) {
      utils.ui.loadingSpinner.show();
    } else {
      utils.ui.loadingSpinner.hide();
    }

    if (nextProps.shopBag.shopBag.error) {
      switch (nextProps.shopBag.shopBag.status) {
        case 403:
          if (utils.detector.isApp()) {
            plugins.invoke({ method: 'jumpToNativeLogin' });
            return;
          }
          this.context.router.push(`/user/login?next=${encodeURIComponent(this.props.location.pathname + this.props.location.search)}`);
          return;
        case 500:
          Toast.show(nextProps.shopBag.shopBag.data.detail);
          break;
        default:
          Toast.show(nextProps.shopBag.shopBag.data.detail);
          break;
      }
    }

    // apply coupon
    if (coupons.applynegotiable.success && !_.isEmpty(coupons.applynegotiable.data) && coupons.applynegotiable.data.code === 0) {
        if (this.state.applyNum + 1 === shopBag.data.length) {
          Toast.show('申请精品券成功');
          this.context.router.replace('/mama/inoutcoupon');
        }
        this.setState({ applyNum: this.state.applyNum + 1 });
    }

    if (coupons.applynegotiable.success && !_.isEmpty(coupons.applynegotiable.data) && coupons.applynegotiable.data.code !== 0) {
        Toast.show(coupons.applynegotiable.data.info);
    }
  }

  componentWillUnmount() {
    this.props.resetApplyNegotiableCoupons();
  }

  onRebuyClick = (e) => {
    const { itemid, cartid, skuid } = e.currentTarget.dataset;
    this.props.rebuy(itemid, skuid, cartid, this.state.type);
  }

  onBuyNowClick = (e) => {
    const { shopBag } = this.props.shopBag;
    const cartIds = [];
    const isBuyable = Number(this.state.isBuyable);
    let score = 0;
    let goodsNum = 0;
    _.each(shopBag.data, (item) => {
      cartIds.push(item.id);
      score += item.num * item.elite_score;
      goodsNum += item.num;
    });

    // 购买精品券需要做积分检查, associate can change restrict
    if (Number(this.state.type) === 6 && (isBuyable === 0)) {
      if (this.state.eliteLevel !== 'Associate') {
        if ((score < constants.minBuyScore) && (goodsNum < 5)) {
          Toast.show('精品券购买个数不能小于5张或' + constants.minBuyScore + '积分，当前张数' + goodsNum + '张，当前积分' + score);
          return;
        }
      } else if (this.state.eliteLevel === 'Associate') {
        if (constants.restrictAssociateBuyScore) {
          if ((score < constants.minBuyScore) && (goodsNum < 5)) {
            Toast.show('精品券购买个数不能小于5张或' + constants.minBuyScore + '积分，当前张数' + goodsNum + '张，当前积分' + score);
            return;
          }
        }
      }
    }

    if (isBuyable === 1) {
      const jumpUrl = 'com.jimei.xlmm://app/v1/trades/purchase?cart_id=' + encodeURIComponent(cartIds.join(',')) + '&type=' + this.state.type;
      if (utils.detector.isAndroid() && typeof window.AndroidBridge !== 'undefined') {
        const appVersion = Number(window.AndroidBridge.appVersion()) || 0;
        if (appVersion >= 20161214) {
          plugins.invoke({
            method: 'jumpToNativeLocation',
            data: { target_url: jumpUrl },
          });
          return;
        }
      }
      if (utils.detector.isIOS() && utils.detector.appVersion() >= 221) {
        plugins.invoke({
          method: 'jumpToNativeLocation',
          data: { target_url: jumpUrl },
        });
        return;
      }
      window.location.href = '/mall/oc.html?cartIds=' + encodeURIComponent(cartIds.join(',')) + '&mm_linkid=' + this.state.mmLinkId;
    } else {
      _.each(shopBag.data, (item) => {
        this.props.applyNegotiableCoupons(item.item_id, item.num);
      });
    }
  }

  onApplyClick = (e) => {
    const { shopBag } = this.props.shopBag;
    const cartIds = [];
    const isBuyable = Number(this.state.isBuyable);
    let score = 0;
    let goodsNum = 0;
    _.each(shopBag.data, (item) => {
      cartIds.push(item.id);
      score += item.num * item.elite_score;
      goodsNum += item.num;
    });

    // 购买精品券需要做积分检查, associate can change restrict
    if (Number(this.state.type) === 6 && (isBuyable === 0)) {
      if (this.state.eliteLevel !== 'Associate') {
        if ((score < constants.minBuyScore) && (goodsNum < 5)) {
          Toast.show('精品券购买个数不能小于5张或' + constants.minBuyScore + '积分，当前张数' + goodsNum + '张，当前积分' + score);
          return;
        }
      } else if (this.state.eliteLevel === 'Associate') {
        if (constants.restrictAssociateBuyScore) {
          if ((score < constants.minBuyScore) && (goodsNum < 5)) {
            Toast.show('精品券购买个数不能小于5张或' + constants.minBuyScore + '积分，当前张数' + goodsNum + '张，当前积分' + score);
            return;
          }
        }
      }
    }

    _.each(shopBag.data, (item) => {
      this.props.applyNegotiableCoupons(item.item_id, item.num);
    });
  }

  onXiaolucoinBuyClick = (e) => {
    const { shopBag } = this.props.shopBag;
    const cartIds = [];
    const isBuyable = this.state.isBuyable;
    let score = 0;
    let goodsNum = 0;
    _.each(shopBag.data, (item) => {
      cartIds.push(item.id);
      score += item.num * item.elite_score;
      goodsNum += item.num;
    });

    const jumpUrl = 'com.jimei.xlmm://app/v1/trades/purchase?cart_id=' + encodeURIComponent(cartIds.join(',')) + '&type=' + this.state.type;
    if (utils.detector.isAndroid() && typeof window.AndroidBridge !== 'undefined') {
      const appVersion = Number(window.AndroidBridge.appVersion()) || 0;
      if (appVersion >= 20161214) {
        plugins.invoke({
          method: 'jumpToNativeLocation',
          data: { target_url: jumpUrl },
        });
        return;
      }
    }
    if (utils.detector.isIOS() && utils.detector.appVersion() >= 221) {
      plugins.invoke({
        method: 'jumpToNativeLocation',
        data: { target_url: jumpUrl },
      });
      return;
    }
    window.location.href = '/mall/oc.html?cartIds=' + encodeURIComponent(cartIds.join(',')) + '&mm_linkid=' + this.state.mmLinkId;
  }

  onUpdateQuantityClick = (e) => {
    const { action, id, num } = e.currentTarget.dataset;
    if (action === 'minus' && Number(num) === 1) {
      this.props.updateQuantity(id, 'delete_carts', this.state.type);
      e.preventDefault();
      return false;
    }
    switch (action) {
      case 'plus':
        this.props.updateQuantity(id, 'plus_product_carts', this.state.type);
        break;
      case 'minus':
        this.props.updateQuantity(id, 'minus_product_carts', this.state.type);
        break;
      default:
        break;
    }
    e.preventDefault();
  }

  totalPrice = () => {
    const { shopBag } = this.props.shopBag;
    let totalPrice = 0;
    _.each(shopBag.data, (item) => {
      totalPrice += item.total_fee;
    });
    return totalPrice.toFixed(2);
  }

  render() {
    const { shopBag, shopBagHistory } = this.props.shopBag;
    const { ishome } = this.props;
    return (
      <div className="shop-bag-all">
        <Header title="购物车" leftIcon="icon-angle-left" onLeftBtnClick={this.context.router.goBack} />
        <div className="content shop-bag-container">
          <If condition={!_.isEmpty(shopBag.data)}>
            <ul className="shop-bag-list shop-bag-list-white-bg">
              {_.isEmpty(shopBag.data) || shopBag.error ? null : shopBag.data.map((item) => {
                return (
                  <li key={item.id} className="row no-margin bottom-border">
                    <a className="col-xs-4 no-padding">
                      <img src={item.pic_path + constants.image.square} />
                    </a>
                    <div className="col-xs-8">
                      <p className="no-wrap">{item.title}</p>
                      <p className="font-xs font-grey-light">{item.sku_name}</p>
                      <p>
                        <span className="font-lg font-orange">{'￥' + item.price}</span>
                        <span className="font-grey-light">{'/￥' + item.std_sale_price}</span>
                        <span className="pull-right cart-quantity">
                          <i className="icon-minus icon-yellow" data-action="minus" data-id={item.id} data-num={item.num} onClick={this.onUpdateQuantityClick}></i>
                          <span>{item.num}</span>
                          <i className="icon-plus icon-yellow" data-action="plus" data-id={item.id} data-num={item.num} onClick={this.onUpdateQuantityClick}></i>
                        </span>
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </If>
          <If condition={_.isEmpty(shopBag.data) && shopBag.success}>
            <div className="text-center margin-top-lg">
              <i className="icon-bag icon-6x icon-grey"></i>
              <p className="font-grey">您的购物车空空如也～快去装满它吧</p>
              <p className="font-grey-light margin-bottom-xs">快去挑选几件喜欢的宝贝吧～</p>
              <Link className="button button-stable" to="/">随便逛逛</Link>
            </div>
          </If>
          <If condition={!_.isEmpty(shopBagHistory.data)}>
            <p className="margin-top-sm margin-left-xs font-xs">可重新购买商品</p>
            <ul className="shop-bag-list top-border">
              {_.isEmpty(shopBagHistory.data) || shopBagHistory.error ? null : shopBagHistory.data.map((item) => {
                return (
                  <li key={item.id} className="row no-margin bottom-border">
                    <a className="col-xs-4 no-padding">
                      <img src={item.pic_path + constants.image.square} />
                    </a>
                    <div className="col-xs-8">
                      <p className="no-wrap">{item.title}</p>
                      <p className="font-xs font-grey-light">{item.sku_name}</p>
                      <p>
                        <span className="font-lg font-orange">{'￥' + item.price}</span>
                        <span className="font-grey-light">{'/￥' + item.std_sale_price}</span>
                        <button className="button button-stable button-sm font-xs pull-right" type="button" data-itemid={item.item_id} data-cartid={item.id} data-skuid={item.sku_id} onClick={this.onRebuyClick}>加入购物车</button>
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </If>
        </div>
        <If condition={!_.isEmpty(shopBag.data) && shopBag.success && !ishome}>
          <BottomBar size="large">
            <p>
              <span className="font-xs">应付款金额</span>
              <span className="font-lg font-orange">{'￥' + this.totalPrice()}</span>
            </p>
            <If condition={Number(this.state.isBuyable) === 1}>
              <button className="button button-energized col-xs-12" type="button" onClick={this.onBuyNowClick}>{'购买'}</button>
            </If>
            <If condition={Number(this.state.isBuyable) === 0}>
              <button className="button button-energized col-xs-12" type="button" onClick={this.onXiaolucoinBuyClick}>{'购买'}</button>
            </If>
          </BottomBar>
        </If>
        <If condition={!_.isEmpty(shopBag.data) && shopBag.success && ishome}>
          <div className="bottom-btn1">
            <div className="has-bottom-bar1" ></div>
            <div className="bottom-bar1 top-border text-center" >
              <p>
                <span className="font-xs">应付款金额</span>
                <span className="font-lg font-orange">{'￥' + this.totalPrice()}</span>
              </p>
              <If condition={Number(this.state.isBuyable) === 1}>
                <button className="button button-energized col-xs-12" type="button" onClick={this.onBuyNowClick}>{'购买'}</button>
              </If>
              <If condition={Number(this.state.isBuyable) === 0}>
                <button className="button button-energized col-xs-12" type="button" onClick={this.onXiaolucoinBuyClick}>{'购买'}</button>
              </If>
            </div>
          </div>
        </If>
      </div>
    );
  }
}
