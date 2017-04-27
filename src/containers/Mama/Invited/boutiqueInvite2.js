import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { Header } from 'components/Header';
import { Carousel } from 'components/Carousel';
import { Timer } from 'components/Timer';
import { Image } from 'components/Image';
import { BottomBar } from 'components/BottomBar';
import { Popup } from 'components/Popup';
import { Toast } from 'components/Toast';
import { DownloadAppBanner } from 'components/DownloadAppBanner';
import { WechatPopup } from 'components/WechatPopup';
import { If } from 'jsx-control-statements';
import classnames from 'classnames';
import * as detailsAction from 'actions/product/details';
import * as shopBagAction from 'actions/shopBag';
import * as shareAction from 'actions/share';
import * as wechatSignAction from 'actions/wechat/sign';
import * as mamaInfoAction from 'actions/mama/mamaInfo';
import * as inviteSharingAction from 'actions/mama/inviteSharing';
import * as constants from 'constants';
import * as utils from 'utils';
import * as plugins from 'plugins';
import _ from 'underscore';

import './boutiqueInvite2.scss';

const actionCreators = _.extend(detailsAction, shopBagAction, shareAction, wechatSignAction, mamaInfoAction, inviteSharingAction);
const tabs = {
  details: 0,
  faq: 1,
};

@connect(
  state => ({
    details: state.productDetails.data,
    isLoading: state.productDetails.isLoading,
    error: state.productDetails.error,
    success: state.productDetails.success,
    shopBag: state.shopBag,
    share: state.share,
    wechatSign: state.wechatSign,
    mamaInfo: state.mamaInfo,
    inviteSharing: state.inviteSharing,
  }),
  dispatch => bindActionCreators(actionCreators, dispatch),
)
export default class BoutiqueInvite2 extends Component {

  static propTypes = {
    prefixCls: React.PropTypes.string,
    skuPopupPrefixCls: React.PropTypes.string,
    params: React.PropTypes.object,
    location: React.PropTypes.object,
    details: React.PropTypes.object,
    isLoading: React.PropTypes.bool,
    fetchProductDetails: React.PropTypes.func,
    shopBag: React.PropTypes.object,
    share: React.PropTypes.object,
    mamaInfo: React.PropTypes.object,
    inviteSharing: React.PropTypes.object,
    fetchWechatSign: React.PropTypes.func,
    wechatSign: React.PropTypes.object,
    addProductToShopBag: React.PropTypes.func,
    resetProductDetails: React.PropTypes.func,
    resetAddProductToShopBag: React.PropTypes.func,
    fetchShopBagQuantity: React.PropTypes.func,
    fetchShareInfo: React.PropTypes.func,
    fetchMamaInfoById: React.PropTypes.func,
    fetchInviteSharing: React.PropTypes.func,
  };

  static contextTypes = {
    router: React.PropTypes.object,
  };

  static defaultProps = {
    prefixCls: 'boutique-invite2',
    skuPopupPrefixCls: 'sku-popup',
  };

  constructor(props, context) {
    super(props);
    context.router;
  }

  state = {
    trasparentHeader: true,
    stickyTab: false,
    activeTab: 0,
    activeSkuPopup: false,
    num: 1,
    productId: 0,
    skuId: 0,
    favoriteStatus: false,
    confirmAddBagDisable: false,
    popupActive: false,
  }

  componentWillMount() {
    const { params } = this.props;
    const productId = params.id.match(/(\d+)/)[0];
    const mmLinkId = this.props.location.query.mm_linkid ? this.props.location.query.mm_linkid : 0;
    const wxPublic = this.props.location.query.wx_public ? Number(this.props.location.query.wx_public) : 0;
    if (mmLinkId !== 0) {
      this.props.fetchMamaInfoById(Number(mmLinkId));
    }
    this.setState({ mmLinkId: mmLinkId });
    this.setState({ wxPublic: wxPublic });

    this.props.fetchProductDetails(productId);
    this.props.fetchShopBagQuantity(0);
    this.props.fetchInviteSharing(26);
    if (utils.detector.isWechat()) {
      this.props.fetchWechatSign();
    }
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    this.addEventListener();
  }

  componentWillReceiveProps(nextProps) {
    const { inviteSharing, wechatSign, mamaInfo } = nextProps;
    const { shopBag } = nextProps.shopBag;
    let cartId = '';
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

    if (nextProps.isLoading) {
      utils.ui.loadingSpinner.show();
    } else if (!nextProps.isLoading) {
      utils.ui.loadingSpinner.hide();
    }
    if (nextProps.shopBag.addProduct.success && nextProps.shopBag.addProduct.data.code === 0) {
      Toast.show(nextProps.shopBag.addProduct.data.info);
      this.setState({ activeSkuPopup: false });
    }
    if (nextProps.shopBag.addProduct.success && nextProps.shopBag.addProduct.data.info) {
      Toast.show(nextProps.shopBag.addProduct.data.info);
      if (nextProps.shopBag.addProduct.data.code === 6) {
        this.context.router.push(`/shop/bag?type=0&mm_linkid=${this.state.mmLinkId}`);
      }
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

    if (!_.isEmpty(nextProps.details) && nextProps.details.custom_info) {
      this.setState({ favoriteStatus: nextProps.details.custom_info.is_favorite });
    }

    if ((shopBag.success || shopBag.error) && this.props.shopBag.shopBag.isLoading) {
      this.setState({ confirmAddBagDisable: false });
    }

    if (shopBag.success && !_.isEmpty(shopBag.data) && this.props.shopBag.shopBag.isLoading) {
      cartId = shopBag.data[0].id;
        // 特卖抢购商品直接进入支付页面
        // if (utils.detector.isApp()) {
        //   const jumpUrl = 'com.danlai.ndpz://app/v1/trades/purchase?cart_id=' + cartId + '&type=' + shopBag.data[0].type;
        //   plugins.invoke({
        //     method: 'jumpToNativeLocation',
        //     data: { target_url: jumpUrl },
        //   });
        // } else {
      window.location.href = `/mall/oc.html?cartIds=${encodeURIComponent(cartId)}&mm_linkid=${this.state.mmLinkId}`;
        // }
    }
  }

  componentWillUnmount() {
    this.removeEventListener();
    this.props.resetAddProductToShopBag();
    this.props.resetProductDetails();
  }

  onWindowResize = (e) => {
    this.setState({ windowWidth: utils.dom.windowWidth() });
  }

  onScroll = (e) => {
    const scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
    const carouselHeight = Number((utils.dom.windowHeight() * 0.7).toFixed(0));
    if (scrollTop >= carouselHeight) {
      this.setState({ trasparentHeader: false });
    } else if (scrollTop < carouselHeight) {
      this.setState({ trasparentHeader: true });
    }
  }

  onShopbagClick = (e) => {
    if (utils.detector.isApp()) {
      const jumpUrl = 'com.danlai.ndpz://app/v1/shopping_cart';
      if (utils.detector.isAndroid() && typeof window.AndroidBridge !== 'undefined') {
        if (utils.detector.isApp()) {
          plugins.invoke({
            method: 'jumpToNativeLocation',
            data: { target_url: jumpUrl },
          });
          return;
        }
      }
      if (utils.detector.isIOS() && utils.detector.isApp()) {
        plugins.invoke({
          method: 'jumpToNativeLocation',
          data: { target_url: jumpUrl },
        });
        return;
      }

      /* plugins.invoke({
        method: 'jumpToNativeLocation',
        data: { target_url: 'com.danlai.ndpz://app/v1/shopping_cart' },
        callback: (resp) => {},
      });*/
    } else {
      this.context.router.push('/shop/bag');
    }
    e.preventDefault();
  }

  onShareBtnClick = (e) => {
    const shareInfo = this.props.share.data;
    if (this.props.share.success && shareInfo) {
      plugins.invoke({
        method: 'callNativeUniShareFunc',
        data: {
          share_title: shareInfo.title,
          share_to: '',
          share_desc: shareInfo.desc,
          share_icon: shareInfo.share_img,
          share_type: 'link',
          link: shareInfo.share_link,
        },
      });
    }
  }

  onBackBtnClick = (e) => {
    // 活动中只有一个商品，打开的是一个详情页，那么会退要调用app的back函数
    if (utils.detector.isApp()) {
      plugins.invoke({ method: 'callNativeBack' });
    } else {
      this.context.router.goSmartBack();
    }
    // this.context.router.goSmartBack();
    e.preventDefault();
  }

  onPopupOverlayClick = (e) => {
    this.setState({ activeSkuPopup: false });
    e.preventDefault();
  }

  onAddToShopBagClick = (e) => {
    const { details } = this.props;
    const { type } = e.currentTarget.dataset;
    const skus = details.sku_info;
    this.setState({ type: Number(type) });

    if (utils.detector.isApp()) {
      Toast.show('只能在微信环境购买，请在微信点击你的铺子会员分享的链接购买');
      return;
    }
    if ((this.state.wxPublic === 0) && (this.state.mmLinkId === undefined || this.state.mmLinkId === 0 || isNaN(this.state.mmLinkId))) {
      Toast.show('请填写推荐人ID');
      return;
    }

    if (type === '单独购买') {
      this.props.addProductToShopBag(skus[0].product_id, skus[0].sku_items[0].sku_id, 1);
      return;
    }

    let defaultSku = {};
    for (const skuIndex in skus) {
      let sum = 0;
      for (const itemIndex in skus[skuIndex].sku_items) {
        sum += skus[skuIndex].sku_items[itemIndex].free_num;
      }
      if (sum > 0) {
        defaultSku = skus[skuIndex];
        break;
      }
    }
    let skuId = 0;
    for (const index in defaultSku.sku_items) {
      if (defaultSku.sku_items[index].free_num > 0) {
        skuId = defaultSku.sku_items[index].sku_id;
        break;
      }
    }
    this.setState({
      productId: defaultSku.product_id,
      skuId: skuId,
      activeSkuPopup: true,
    });
    e.preventDefault();
  }

  onSkuItemClick = (e) => {
    const dataset = e.currentTarget.dataset;
    if (dataset.disabled === 'true') {
      return false;
    }
    if (dataset.productid) {
      const productId = Number(dataset.productid);
      const product = this.getProduct(productId);
      this.setState({
        productId: productId,
        skuId: product.sku_items[0].sku_id,
      });
    }
    if (dataset.skuid) {
      this.setState({ skuId: Number(dataset.skuid) });
    }
    e.preventDefault();
  }

  onUdpateQuantityClick = (e) => {
    const dataset = e.currentTarget.dataset;
    if (this.state.num <= 1 && dataset.action === 'minus') {
      return;
    }
    switch (dataset.action) {
      case 'minus':
        this.setState({ num: this.state.num - 1 });
        break;
      case 'plus':
        this.setState({ num: this.state.num + 1 });
        break;
      default:
        break;
    }
    e.preventDefault();
  }

  onConfirmAddToShopBagClick = (e) => {
    const { details } = this.props;
    const { productId, skuId, num } = this.state;
    this.setState({ confirmAddBagDisable: true });
    if (details && details.detail_content.is_boutique) {
      this.props.addProductToShopBag(productId, skuId, num, 5);
    } else {
      this.props.addProductToShopBag(productId, skuId, num, 0);
    }

    e.preventDefault();
  }

  onClickJumpToBuyCoupon = (e) => {
    const { url } = e.currentTarget.dataset;
    const prefix = 'com.danlai.ndpz://app/v1/webview?';
    let param = '';
    if (url) {
      param = url.substring(prefix.length);
      const params = param.split('&');
      let jumpUrl = '';
      if (params[0].indexOf('is_native') >= 0) {
        jumpUrl = params[1].substring(4);
      } else {
        jumpUrl = params[0].substring(4);
      }
      window.location.href = jumpUrl;
    }
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

  onShareClick = (e) => {
    const shareInfo = this.props.inviteSharing.data || {};
    if (utils.detector.isWechat()) {
      this.setState({ popupActive: true });
      return;
    }

    if (utils.detector.isApp()) {
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
  }

  onAdministratorClick = (e) => {
    this.context.router.push('/mama/open/succeed');
    e.preventDefault();
  }

  onCloseBtnClick = (e) => {
    this.setState({ popupActive: false });
  }

  getProduct = (productId) => {
    const skus = this.props.details.sku_info;
    let product = {};
    _.each(skus, (sku) => {
      if (sku.product_id === Number(productId)) {
        product = sku;
      }
    });
    return product;
  }

  getAddToShopBagBtnText = (detail) => {
    if (detail.sale_state === 'will') {
      return '即将开售';
    }
    if (detail.sale_state === 'off') {
      return '已下架';
    }
    if (detail.sale_state === 'on' && detail.is_sale_out) {
      return '已抢光';
    }
    if (detail.is_boutique || detail.is_onsale) {
      return '立即购买';
    }
    return '加入购物车';
  }

  addEventListener = () => {
    window.addEventListener('resize', this.onWindowResize);
    window.addEventListener('scroll', this.onScroll);
  }

  removeEventListener = () => {
    window.removeEventListener('resize', this.onWindowResize);
    window.removeEventListener('scroll', this.onScroll);
  }

  renderCarousel(images) {
    const windowWidth = utils.dom.windowWidth();
    const carouselHeight = Number((utils.dom.windowHeight() * 0.7).toFixed(0));
    return (
      <Carousel >
      {images.map((image, index) => {
        return (
          <div key={index}>
            <Image className="head-image" quality={90} style={{ width: windowWidth, height: carouselHeight }} thumbnail={windowWidth} crop={ windowWidth + 'x' + carouselHeight } src={image} />
          </div>
        );
      })}
      </Carousel>
    );
  }

  renderProductInfo(details) {
    const { favoriteStatus } = this.state;
    const info = details.detail_content;

    return (
      <div>
        <div className="product-info bottom-border bg-white">
          <div className="row no-margin">
            <p className="col-xs-12 no-padding font-md">{info.name}</p>
          </div>
          <div className="row no-margin">
            <p className="col-xs-8 no-padding">
              <span className="font-32">{'￥' + info.lowest_agent_price}</span>
              <span className="font-grey">/</span>
              <span className="font-xs font-grey-light text-line-through">{'￥' + info.lowest_std_sale_price}</span>
            </p>
          </div>
        </div>
        <If condition={info.is_boutique && this.props.shopBag.shopBagQuantity.success && this.props.shopBag.shopBagQuantity.data}>
          <p className="boutique_buy_coupon bottom-border bg-white margin-bottom-xxs">
            <span>精品商品</span>
            <span className="pull-right font-orange" data-url={details.buy_coupon_url} onClick={this.onClickJumpToBuyCoupon}>前往购券></span>
          </p>
        </If>
      </div>
    );
  }

  renderPromotion() {
    return (
      <div className="row no-margin text-center bg-white">
        <div className="col-xs-3 no-padding">
          <i className="icon-new icon-3x icon-red"></i>
          <p>天天上新</p>
        </div>
        <div className="col-xs-3 no-padding">
          <i className="icon-shield icon-3x icon-red"></i>
          <p>100%正品</p>
        </div>
        <div className="col-xs-3 no-padding">
          <i className="icon-truck-o icon-3x icon-red"></i>
          <p>全国包邮</p>
        </div>
        <div className="col-xs-3 no-padding">
          <i className="icon-seven-o icon-3x icon-red"></i>
          <p>七天退货</p>
        </div>
      </div>
    );
  }

  renderProductProps(attributes = []) {
    return (
      <div className="product-spec bg-white margin-top-xxs">
        <p className="font-md font-weight-700">商品参数</p>
        {attributes.map((attribute, index) => (
          <p key={index}><span>{attribute.name}</span><span className="margin-left-xxs font-grey-light">{attribute.value}</span></p>
        ))}
      </div>
    );
  }

  renderRow(cells) {
    return (
      <tr>
        {cells.map((cell, cellIndx) => {
          return (<th key={cellIndx} className="text-center font-weight-200">{cell}</th>);
        })}
      </tr>
    );
  }

  renderProductSpec(rows, index) {
    const self = this;
    return (
      <div className="table-container" key={index}>
        <table className="table">
          <thead>{self.renderRow(rows[0])}</thead>
          <tbody>
          {rows.map((cells, rowIndex) => {
            if (rowIndex > 0) {
              return self.renderRow(cells);
            }
          })}
          </tbody>
        </table>
      </div>
    );
  }

  renderDetails(images) {
    const { stickyTab, activeTab } = this.state;
    return (
      <div className="bg-white">
        <div className="details">
          {images.map((image, index) => {
            return (<Image key={index} quality={90} className="col-xs-12 no-padding" thumbnail={640} src={image} />);
          })}
        </div>
      </div>
    );
  }

  renderSkuHeader() {
    const { skuPopupPrefixCls, details } = this.props;
    const { productId, skuId } = this.state;
    const product = this.getProduct(productId);
    return (
      <div className={`row bottom-border ${skuPopupPrefixCls}-header`}>
        <Image className="col-xs-3 no-padding" thumbnail={200} crop="200x200" src={product.product_img} quality={90}/>
        {product.sku_items.map((item) => {
          if (item.sku_id === skuId) {
            return (
              <div className="col-xs-9 no-padding">
                <p className="product-name">{details.detail_content.name + '/' + product.name + '/' + item.name}</p>
                <p>
                  <span className="font-26">{'￥' + item.agent_price.toFixed(2)}</span>
                  <span className="font-grey-light">{'/￥' + item.std_sale_price.toFixed(2)}</span>
                </p>
              </div>
            );
          }
        })}
      </div>
    );
  }

  renderSkuColor() {
    const { productId, skuId } = this.state;
    const skus = this.props.details.sku_info;
    const product = this.getProduct(productId);
    return (
      <div className="row no-margin sku-list">
        <div className="col-xs-2 no-padding">颜色</div>
        <ul className="col-xs-10 no-padding">
        {skus.map((sku) => {
          let sum = 0;
          _.each(sku.sku_items, (skuItem) => {
            sum += skuItem.free_num;
          });
          const skuItemCls = classnames({
            ['sku-item no-wrap']: true,
            ['active']: product.product_id === sku.product_id,
            ['disabled']: sum <= 0,
          });
          return (
            <li onClick={this.onSkuItemClick} key={sku.product_id} data-productid={sku.product_id} data-disabled={sum <= 0}>
              <lable className={skuItemCls}>{sku.name}</lable>
            </li>
          );
        })}
        </ul>
      </div>
    );
  }

  renderSkuSize() {
    const { productId, skuId } = this.state;
    const product = this.getProduct(productId);
    return (
      <div className="row no-margin sku-list">
        <div className="col-xs-2 no-padding">尺寸</div>
        <ul className="col-xs-10 no-padding">
        {product.sku_items.map((item) => {
          const skuItemCls = classnames({
            ['sku-item no-wrap']: true,
            ['active']: item.sku_id === skuId,
            ['disabled']: item.free_num <= 0,
          });
          return (
            <li onClick={this.onSkuItemClick} key={item.sku_id} data-skuid={item.sku_id} data-disabled={item.free_num <= 0}>
              <lable className={skuItemCls}>{item.name}</lable>
            </li>
          );
        })}
        </ul>
      </div>
    );
  }

  render() {
    const self = this;
    const { prefixCls, skuPopupPrefixCls, details, shopBag, mamaInfo } = this.props;
    const { trasparentHeader, activeSkuPopup, num, productId, skuId } = this.state;
    let badge = 0;
    if (shopBag.shopBagQuantity.data) {
      badge = shopBag.shopBagQuantity.data.result;
    }
    const { preview } = this.props.location.query;
    let disabled = false;
    if (!_.isEmpty(details.detail_content)) {
      disabled = (details.detail_content.sale_state === 'will' || details.detail_content.sale_state === 'off' || (details.detail_content.sale_state === 'on' && details.detail_content.is_sale_out));
    }

    return (
      <div className={`${prefixCls}`}>
        <Header title="邀请您加入小鹿" leftIcon="icon-angle-left" onLeftBtnClick={this.context.router.goBack} />
        <If condition={!_.isEmpty(details.detail_content)}>
          <div className="content">
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
            <If condition={!_.isEmpty(details.comparison)}>
              {details.comparison.tables.map((spec, tableIndex) => {
                return self.renderProductSpec(spec.table, tableIndex);
              })}
            </If>
            {this.renderDetails(details.detail_content.content_imgs)}
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
            <button className="button button-energized col-xs-4 no-padding col-xs-offset-1" type="button" data-type={0} onClick={this.onAddToShopBagClick} disabled={disabled}>
              {this.getAddToShopBagBtnText(details.detail_content)}
            </button>
          </BottomBar>
          <If condition={activeSkuPopup}>
            <Popup className={`${skuPopupPrefixCls}`} active={activeSkuPopup} onPopupOverlayClick={this.onPopupOverlayClick}>
              {this.renderSkuHeader()}
              {this.renderSkuColor()}
              {this.renderSkuSize()}
              <div className="row no-margin quantity">
                <div className="col-xs-2 no-padding">个数</div>
                <p className="col-xs-10 no-padding">
                  <span className="minus" data-action="minus" onClick={this.onUdpateQuantityClick}>-</span>
                  <span>{num}</span>
                  <span className="plus" data-action="plus" onClick={this.onUdpateQuantityClick}>+</span>
                </p>
              </div>
              <BottomBar size="medium">
                <button className="button button-energized col-xs-10 col-xs-offset-1 no-padding" type="button" onClick={this.onConfirmAddToShopBagClick} disabled={this.state.confirmAddBagDisable}>确定</button>
              </BottomBar>
            </Popup>
          </If>
          <WechatPopup active={this.state.popupActive} onCloseBtnClick={this.onCloseBtnClick}/>
        </If>
      </div>
    );
  }
}
