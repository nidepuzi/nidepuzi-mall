import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'underscore';
import { Link } from 'react-router';
import classnames from 'classnames';
import * as utils from 'utils';
import * as constants from 'constants';
import { If } from 'jsx-control-statements';
import { Loader } from 'components/Loader';
import { InputHeader } from 'components/InputHeader';
import { Timer } from 'components/Timer';
import { Product } from 'components/Product';
import { Image } from 'components/Image';
import { ShopBag } from 'components/ShopBag';
import { Favorite } from 'components/Favorite';
import { BackTop } from 'components/BackTop';
import * as actionCreators from 'actions/product/categories';

import './index.scss';

@connect(
  state => ({
    categories: {
      data: state.categories.data,
      isLoading: state.categories.isLoading,
      error: state.categories.error,
      success: state.categories.success,
    },
  }),
  dispatch => bindActionCreators(actionCreators, dispatch),
)
export default class ProductCategory extends Component {
  static propTypes = {
    location: React.PropTypes.object,
    fetchProductCategories: React.PropTypes.func,
    categories: React.PropTypes.any,
  };

  static contextTypes = {
    router: React.PropTypes.object,
  };

  constructor(props, context) {
    super(props);
    context.router;
  }

  state = {
    selectCid: '120',
    sticky: false,
  }

  componentWillMount() {
    this.props.fetchProductCategories();
  }

  componentDidMount() {
    this.addScrollListener();
  }

  componentWillReceiveProps(nextProps) {
    let { cid } = this.props.location.query;
    if (!cid) {
      cid = '120';
    }

    if (nextProps.categories.success) {
      const selectCid = this.getFirstCategory(cid, nextProps.categories.data);
      this.setState({ selectCid: selectCid });
    }
  }

  componentWillUnmount() {
    this.removeScrollListener();
  }

  onItemClick = (e) => {
    const dataSet = e.currentTarget.dataset;
    const productType = this.props.location.query.product_type;
    if (productType && productType === 'coupon') {
      window.location.href = `/mall/trancoupon/list?cid=${dataSet.cid}`;
    } else {
      window.location.href = `/mall/product/list?cid=${dataSet.cid}&title=${dataSet.name}`;
    }
  }

  onTabItemClick = (e) => {
    const { cid } = e.currentTarget.dataset;
    this.setState({ selectCid: cid });
  }

  onLeftBtnClick = (e) => {
    this.context.router.goBack();
  }

  onInputClick = (e) => {
    this.context.router.push('/product/search');
  }

  onScroll = (e) => {
    const { cid } = this.props.location.query;
    const scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
    const documentHeight = utils.dom.documnetHeight();
    const windowHeight = utils.dom.windowHeight();
    const tabsOffsetTop = utils.dom.offsetTop('.cat-pic-list');

    if (scrollTop > tabsOffsetTop) {
      this.setState({ sticky: true });
    } else {
      this.setState({ sticky: false });
    }
  }

  getFirstCategory = (cid, categoryData) => {
    let firstCategory = 1;
    if ((!cid) || (!categoryData) || (categoryData === [])) return firstCategory;
    categoryData.map((item) => {
      if (item.cid === cid) {
          firstCategory = item.cid;
      } else if (item.childs) {
        item.childs.map((secondItem) => {
          if (secondItem.cid === cid) {
            firstCategory = item.cid;
          }
          return;
        });
      }
      return;
    });
    return firstCategory;
  }

  getSecondCategory = (cid) => {
    const { categories } = this.props;
    const categoryData = categories.success ? (categories.data || []) : [];
    let secondCategory = [];

    if ((!cid) || (categoryData === [])) return secondCategory;

    categoryData.map((item) => {
      if (item.cid === cid && item.childs.length > 0) {
        secondCategory = item.childs[0].childs.concat();
      }
      return;
    });

    return secondCategory;
  }

  addScrollListener = () => {
    window.addEventListener('scroll', this.onScroll);
  }

  removeScrollListener = () => {
    window.removeEventListener('scroll', this.onScroll);
  }

  render() {
    const { categories } = this.props;
    let { title } = this.props.location.query;
    const categoryData = categories.success ? (categories.data || []) : [];
    const hasHeader = !utils.detector.isApp();
    const { activeTab, sticky, selectCid } = this.state;
    const secondCategory = this.getSecondCategory(selectCid);

    if (!title) {
      title = '分类';
    }

    return (
      <div className="product-categories">
        <InputHeader placeholder=" 输入查询的商品" onInputClick={this.onInputClick} leftIcon="icon-angle-left" onLeftBtnClick={this.onLeftBtnClick} />
        <div className=" row">
          <div className={'cat-list col-xs-3 '}>
            <ul className="cat-list-ul no-margin">
              <If condition= {categoryData && categoryData.length > 0}>
              { categoryData.map((item) => {
                  return <li className={'cat-name no-margin bottom-border text-center font-xs' + (item.cid === selectCid ? ' active' : '')} key={item.cid} data-cid={item.cid} onClick={this.onTabItemClick}>{item.name}</li>;
                })
              }
              </If>
            </ul>
          </div>
          <div className="cat-pic-list col-xs-9">
            <ul className="cat-pic-ul">
            <If condition= {secondCategory && (secondCategory.length > 0)}>
            {secondCategory.map((item) => {
              return (<li className="cat-pic-p col-xs-4 margin-top-xxs" key={item.cid}>
                      <Image className="cat-pic" src={item.cat_pic} data-cid={item.cid} data-name={item.name} onClick = {this.onItemClick} quality={90}/>
                      <p className="text-center font-xxs">{item.name}</p>
                     </li>);
              })
            }
            </If>
            </ul>
          </div>
        </div>
        {categories.isLoading ? <Loader/> : null}
      </div>
    );
  }
}
