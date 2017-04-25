import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'underscore';
import { Link } from 'react-router';
import classnames from 'classnames';
import * as utils from 'utils';
import * as constants from 'constants';
import * as plugins from 'plugins';
import { If } from 'jsx-control-statements';
import { Carousel } from 'components/Carousel';
import { Loader } from 'components/Loader';
import { Header } from 'components/Header';
import { Footer } from 'components/Footer';
import { Timer } from 'components/Timer';
import { Side } from 'components/Side';
import { Product } from 'components/Product';
import { Brand } from 'components/Brand';
import { Image } from 'components/Image';
import { ShopBag } from 'components/ShopBag';
import { Favorite } from 'components/Favorite';
import { BackTop } from 'components/BackTop';
import { DownloadAppBanner } from 'components/DownloadAppBanner';
import { Toast } from 'components/Toast';
import * as portalAction from 'actions/home/portal';
import * as mamaInfoAction from 'actions/mama/mamaInfo';
import * as mamaFocusAction from 'actions/mama/focus';
import * as wechatSignAction from 'actions/wechat/sign';
import * as shopSharingAction from 'actions/mama/shopSharing';
import * as profileCreators from 'actions/user/profile';
import * as productsAction from 'actions/home/product';
import { ProductList } from 'containers/Product';

import logo from './images/logo.png';

import './homepage.scss';

const actionCreators = _.extend(portalAction, mamaInfoAction, mamaFocusAction, wechatSignAction, shopSharingAction, profileCreators, productsAction);
const requestAction = {
  yesterday: 'yesterday',
  today: 'today',
  tomorrow: 'tomorrow',
};
const tabs = {
  yesterday: 1,
  today: 2,
  tomorrow: 3,
};

@connect(
  state => ({
    portal: {
      data: state.portal.data || {},
      isLoading: state.portal.isLoading,
      error: state.portal.error,
      success: state.portal.success,
    },
    mamaFocus: state.mamaFocus,
    mamaInfo: state.mamaInfo,
    wechatSign: state.wechatSign,
    shopSharing: state.shopSharing,
    profile: state.profile,
    products: state.products,
  }),
  dispatch => bindActionCreators(actionCreators, dispatch),
)
export default class HomePage extends Component {
  static propTypes = {
    location: React.PropTypes.any,
    children: React.PropTypes.any,
    fetchPortal: React.PropTypes.func,
    fetchMamaInfoById: React.PropTypes.func,
    focusMamaById: React.PropTypes.func,
    resetFocusMama: React.PropTypes.func,
    fetchWechatSign: React.PropTypes.func,
    fetchShopSharing: React.PropTypes.func,
    portal: React.PropTypes.any,
    mamaFocus: React.PropTypes.any,
    mamaInfo: React.PropTypes.any,
    wechatSign: React.PropTypes.object,
    shopSharing: React.PropTypes.object,
    profile: React.PropTypes.object,
    getLocationQuery: React.PropTypes.func,
    fetchProfile: React.PropTypes.func,
    fetchProduct: React.PropTypes.func,
    resetProducts: React.PropTypes.func,
    products: React.PropTypes.any,
  };

  static contextTypes = {
    router: React.PropTypes.object,
  };

  constructor(props, context) {
    super(props);
    context.router;
  }

  state = {
    menuActive: false,
    hasMore: true,
    pageIndex: 0,
    pageSize: 20,
    sticky: false,
    wxConfig: true,
    topTab: [],
    activeTab: '精品活动',
    index: 0,
  }

  componentWillMount() {
    const { pageIndex, pageSize } = this.state;
    const mmLinkId = this.props.location.query.mm_linkid;
    this.props.fetchPortal();
    if (mmLinkId) {
      this.props.fetchMamaInfoById(mmLinkId);
    }
    this.props.fetchWechatSign();
    this.props.fetchShopSharing();
    this.props.fetchProfile();
  }

  componentDidMount() {
    this.addScrollListener();
  }

  componentWillReceiveProps(nextProps) {
    const mmLinkId = this.props.location.query.mm_linkid;
    if (nextProps.wechatSign.success && !nextProps.wechatSign.isLoading && this.state.wxConfig) {
      this.setState({ wxConfig: false });
      utils.wechat.config(nextProps.wechatSign);
    }

    if (nextProps.shopSharing.success && !nextProps.shopSharing.isLoading && !this.state.wxConfig) {
      const shareInfo = {
        success: nextProps.shopSharing.success,
        data: {
          title: nextProps.shopSharing.data.shop_info.desc,
          desc: nextProps.shopSharing.data.shop_info.desc,
          share_link: nextProps.shopSharing.data.shop_info.shop_link,
          share_img: nextProps.shopSharing.data.shop_info.first_pro_pic,
        },
      };
      utils.wechat.configShareContent(shareInfo);
    }

    if (nextProps.mamaFocus.success) {
      Toast.show(nextProps.mamaFocus.data.info);
    }
    if (nextProps.mamaFocus.error) {
      switch (nextProps.mamaFocus.status) {
        case 403:
          this.context.router.push(`/user/login?next=${this.props.location.pathname}?mm_linkid=${mmLinkId}`);
          return;
        case 500:
          Toast.show(nextProps.mamaFocus.data.detail);
          break;
        default:
          Toast.show(nextProps.mamaFocus.data.detail);
          break;
      }
    }
    if (nextProps.portal.success) {
      const topTab = [{ name: '精品活动', cid: 0 }];
      for (let i = 0; i < nextProps.portal.data.categorys.length; i++) {
        const tab = { name: nextProps.portal.data.categorys[i].name,
                      cid: nextProps.portal.data.categorys[i].id };
        topTab.push(tab);
      }
      this.setState({ topTab: topTab });
    }
    let count = 0;
    let size = 0;
    if (nextProps.products.success && !nextProps.products.isLoading) {
      count = nextProps.products.data.count;
      size = nextProps.products.data.results.length;
      this.setState({ pageIndex: Math.round(size / this.state.pageSize) });
      this.setState({ hasMore: count > size });
    }
  }

  componentDidUpdate() {

  }

  componentWillUnmount() {
    this.removeScrollListener();
    this.setState({ pageIndex: 0 });
    this.props.resetFocusMama();
  }

  onItemClick = (e) => {
    const dataSet = e.currentTarget.dataset;
    window.location.href = `/mall/product/details/${dataSet.modelid}`;
  }

  onOpenShopClick = (e) => {
    const mmLinkId = this.props.location.query.mm_linkid;
    const { protocol, host } = window.location;

    window.location.href = `${protocol}//${host}/rest/v1/users/weixin_login/?next=/mall/boutiqueinvite?mama_id=${mmLinkId}`;
    e.preventDefault();
  }

  onFocusClick = (e) => {
    const mmLinkId = this.props.location.query.mm_linkid;
    if (mmLinkId && Number(mmLinkId) > 0) {
      this.props.focusMamaById(mmLinkId);
    }
    e.preventDefault();
  }

  onTabClick = (e) => {
    const { index } = e.currentTarget.dataset;
    const { pageIndex, pageSize } = this.state;
    this.setState({ activeTab: this.state.topTab[index].name, index: index, pageIndex: 0 });
    this.props.resetProducts();
    this.props.fetchProduct('', 1, pageSize, this.state.topTab[index].cid);
    e.preventDefault();
  }

  onScroll = (e) => {
    const { pageSize, pageIndex, activeTab } = this.state;
    const scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
    const documentHeight = utils.dom.documnetHeight();
    const windowHeight = utils.dom.windowHeight();
    const tabsOffsetTop = utils.dom.offsetTop('.home-div-toptabs');
    if (scrollTop === documentHeight - windowHeight && !this.props.products.isLoading && this.state.hasMore) {
      this.props.fetchProduct('', pageIndex + 1, pageSize, this.state.topTab[this.state.index].cid, activeTab === 'price' ? 'price' : '');
    }
    if (scrollTop > tabsOffsetTop) {
      this.setState({ sticky: true });
    } else {
      this.setState({ sticky: false });
    }
  }

  addScrollListener = () => {
    window.addEventListener('scroll', this.onScroll);
  }

  removeScrollListener = () => {
    window.removeEventListener('scroll', this.onScroll);
  }

  toggleMenuActive = () => {
    this.setState({
      menuActive: this.state.menuActive ? false : true,
    });
  }

  enterMamahome = () => {
    const { profile } = this.props;
    if (profile && profile.success && profile.data.xiaolumm
      && profile.data.xiaolumm.id > 0 && profile.data.xiaolumm.status === 'effect') {
      // this.context.router.push('/mama/home');
      window.location.href = '/mall/mama/home';
      return;
    }
    if (profile && profile.success && (profile.data.xiaolumm === null)) {
      Toast.show('您还不是你的铺子会员，请关注你的铺子公众号了解更多信息');
      return;
    }
    if (profile && profile.success && (profile.data.xiaolumm.status !== 'effect')) {
      Toast.show('您的你的铺子会员账号异常，请关注你的铺子公众号联系客服');
      return;
    }
    if (profile && (!profile.success || profile.error)) {
      Toast.show('您还没有登录，请登录后进入');
      return;
    }
  }

  render() {
    const { portal, children } = this.props;
    const mamaInfo = this.props.mamaInfo.mamaInfo;
    const activities = portal.data.activitys || [];
    const categories = portal.data.categorys || [];
    const posters = portal.data.posters || [];
    const brands = portal.data.promotion_brands || [];
    const { activeTab, sticky } = this.state;
    const mainCls = classnames({
      ['menu-active']: this.state.menuActive,
    });
    const hasHeader = !utils.detector.isApp();
    const products = this.props.products.data.results || [];

    return (
      <div className={mainCls}>
        <Header title={"你的铺子"} titleType="text" hide={!hasHeader}/>
        <div className="homepage-container">
          <div className="content content-white-bg">
            <div className={'home-div-toptabs ' + (sticky ? 'sticky ' : '')}>
              <ul className="row no-margin home-toptabs">
                {this.state.topTab.map((item, index) => {
                    return (
                      <li key={index} className="home-toptab" data-index={index} onClick={this.onTabClick}>
                        <p className={'no-margin no-padding text-center ' + (activeTab === item.name ? 'active' : '')}>
                          <span>{item.name}</span>
                        </p>
                      </li>
                    );
                  })}
              </ul>
            </div>
            <If condition={ this.state.activeTab === '精品活动'}>
            <div className="home-poster">
              {portal.isLoading ? <Loader/> : null}
              <Carousel>
                {posters.map((item, index) => {
                  return (
                    <div key={index} >
                      <a href={item.item_link}>
                        <Image src={item.pic_link} quality={90}/>
                      </a>
                    </div>
                  );
                })}
              </Carousel>
            </div>
            <If condition={ portal.isLoading || !_.isEmpty(activities)}>
              <div className="home-activities">
                {portal.isLoading ? <Loader/> : null}
                <ul className="row no-margin">
                  {activities.map((item, index) => {
                    return (
                      <li key={item.id}>
                        <a href={item.act_link}>
                          <Image style={{ padding: '10px 0px' }} className="col-xs-12 no-padding bottom-border" quality={90} src={item.act_img} />
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </If>
            <If condition={ portal.isLoading || !_.isEmpty(brands)}>
              <div className="home-brands">
                {portal.isLoading ? <Loader/> : null}
                <ul className="row no-margin">
                  {brands.map((brand, index) => {
                    return (<Brand data={brand} key={index}/>);
                  })}
                </ul>
              </div>
            </If>
            </If>
            <If condition={ this.state.activeTab !== '精品活动' }>
              <div className="product-list-p" >
                <div className="margin-top-xxs" ></div>
                {products.map((item) => {
                  return <Product key={item.id} product={item} onItemClick = {this.onItemClick} />;
                })}
              </div>
            </If>
            <Footer />
            <div style={{ height: '44px' }}></div>
          </div>
        </div>
      </div>
    );
  }
}
