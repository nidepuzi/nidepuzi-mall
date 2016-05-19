import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as actionCreators from 'actions/user/coupon';
import * as utils from 'utils';
import { Header } from 'components/Header';
import { Toast } from 'components/Toast';
import { Image } from 'components/Image';
import activity from './activity';

import './index.scss';

const setupWebViewJavascriptBridge = function(callback) {
  if (window.WebViewJavascriptBridge) {
    return callback(window.WebViewJavascriptBridge);
  }
  if (window.WVJBCallbacks) {
    return window.WVJBCallbacks.push(callback);
  }
  window.WVJBCallbacks = [callback];
  const WVJBIframe = document.createElement('iframe');
  WVJBIframe.style.display = 'none';
  WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__';
  document.documentElement.appendChild(WVJBIframe);
  setTimeout(function() {
    document.documentElement.removeChild(WVJBIframe);
  }, 0);
};


@connect(
  state => ({
    data: state.coupon.data,
    isLoading: state.coupon.isLoading,
    success: state.coupon.success,
  }),
  dispatch => bindActionCreators(actionCreators, dispatch),
)
export default class A20160520 extends Component {

  static propTypes = {
    data: React.PropTypes.any,
    isLoading: React.PropTypes.bool,
    location: React.PropTypes.object,
    fetchCoupon: React.PropTypes.func,
  };

  static contextTypes = {
    router: React.PropTypes.object,
  };

  constructor(props, context) {
    super(props);
    context.router;
  }

  state = {
    redpacketOpened: false,
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.success) {
      if (nextProps.data.code === 0) {
        this.toggleRedpacketOpenedState();
      }
      Toast.show(nextProps.data.res);
    }
    if (!nextProps.success && !nextProps.isLoading) {
      this.context.router.replace(`/user/login?next=${this.props.location.pathname}`);
    }
  }

  onCouponClick = (e) => {
    this.props.fetchCoupon(activity.couponIds);
  }

  onProductClick = (e) => {
    const dataSet = e.currentTarget.dataset;
    const modelId = Number(dataSet.modelid);
    const appUrl = 'com.jimei.xlmm://app/v1/products/modelist?model_id=' + modelId;

    if (utils.detector.isAndroid() && typeof window.AndroidBridge !== 'undefined') {
      window.AndroidBridge.jumpToNativeLocation(appUrl);
    } else if (utils.detector.isIOS() && !utils.detector.isWechat()) {
      setupWebViewJavascriptBridge(function(bridge) {
        bridge.callHandler('jumpToNativeLocation', {
          target_url: appUrl,
        }, function(response) {});
      });
    } else {
      this.context.router.push(`/product/details/${modelId}`);
    }
  }

  onShareBtnClick = (e) => {
    const data = {
      share_to: '',
      active_id: activity.activityId,
    };
    if (utils.detector.isIOS() && !utils.detector.isWechat()) {
      setupWebViewJavascriptBridge(function(bridge) {
        bridge.callHandler('callNativeShareFunc', data, function(response) {});
      });
    } else if (utils.detector.isAndroid() && typeof window.AndroidBridge !== 'undefined') {
      window.AndroidBridge.callNativeShareFunc(data.share_to, data.active_id);
    }
  }

  toggleRedpacketOpenedState = (e) => {
    this.setState({ redpacketOpened: !this.state.redpacketOpened });
  }

  render() {
    return (
      <div>
        <Header title="六一提前Go" leftIcon="icon-angle-left" onLeftBtnClick={this.context.router.goBack} hide={utils.detector.isApp()} />
        <div className="content content-white-bg activity-md clearfix col-md-4 col-md-offset-4 no-padding">
          <Image className="col-xs-12 no-padding" src={activity.banner} />
          <Image className="col-xs-12 no-padding" src={activity.coupon} onClick={this.onCouponClick} />
          <Image className="col-xs-12 no-padding" src={activity.couponFooter} />
          {activity.groups.map((group, index) => {
            return (
              <div key={index}>
                <img className="col-xs-12 no-padding margin-top-sm" src={group.header} />
                <ul>
                {group.products.map((product, i) => {
                  return (
                    <li className="col-xs-6 activity-product" key={product.modleId} data-modelid={product.modleId} onClick={this.onProductClick}>
                      <Image src={product.pic} />
                    </li>
                  );
                })}
                </ul>
              </div>
            );
          })}
          <Image className="col-xs-12 no-padding" src={activity.footer} />
        </div>
        <If condition={this.state.redpacketOpened}>
          <div className="activity-popup">
            <div className="popup-content col-md-4 col-md-offset-4 no-padding">
              <img className="col-xs-12" src={activity.redpacket} />
              <img className="col-xs-12" src={activity.shareBtn} onClick={this.onShareBtnClick}/>
              <img className="col-xs-2 col-xs-offset-5 margin-top-xs" src={activity.closeBtn} onClick={this.toggleRedpacketOpenedState} />
            </div>
            <div className="popup-overlay"></div>
          </div>
        </If>
      </div>
    );
  }
}
