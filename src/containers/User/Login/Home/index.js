import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import * as constants from 'constants';
import * as utils from 'utils';
import classnames from 'classnames';
import * as actionCreators from 'actions/user/login';
import { Header } from 'components/Header';
import { Image } from 'components/Image';
import { Toast } from 'components/Toast';

import './index.scss';

const loginSplash = '//oon0iwvsw.bkt.clouddn.com/192_192.jpg';
const loginType = {
  password: 0,
  wechat: 1,
};

@connect(
  state => ({
    data: state.login.data,
    isLoading: state.login.isLoading,
    error: state.login.error,
    success: state.login.success,
  }),
  dispatch => bindActionCreators(actionCreators, dispatch),
)
export default class Home extends Component {
  static propTypes = {
    prefixCls: React.PropTypes.string,
    dispatch: React.PropTypes.func,
    data: React.PropTypes.any,
    isLoading: React.PropTypes.bool,
    error: React.PropTypes.bool,
    login: React.PropTypes.func,
    location: React.PropTypes.object,
  };

  static contextTypes = {
    router: React.PropTypes.object,
  };

  static defaultProps = {
    prefixCls: 'login-home',
  };

  constructor(props, context) {
    super(props);
    context.router;
  }

  state = {

  }

  componentWillReceiveProps(nextProps) {
    const { router } = this.context;
    const { query } = this.props.location;
    if (!nextProps.success) {
      return;
    }
    switch (nextProps.data.rcode) {
      case 0:
        Toast.show(nextProps.data.msg);
        window.location.replace(this.next(true));
        break;
      default:
        Toast.show(nextProps.data.msg);
        break;
    }
  }

  onWechatLoginBtnClick = (e) => {
    window.location.replace(constants.baseEndpointV1 + 'users/weixin_login/?next=' + encodeURIComponent(this.next(true)));
    e.preventDefault();
  }

  onLinkClick = (e) => {
    const link = e.currentTarget.dataset.to;
    this.context.router.replace(link);
  }

  next = (withBaseUrl) => {
    const { query } = this.props.location;
    if (query.next && query.next.indexOf('http') >= 0) {
      return query.next;
    }
    if (withBaseUrl) {
      return query.next ? utils.url.getBaseUrl() + query.next : utils.url.getBaseUrl();
    }
    return query.next ? query.next : '/';
  }

  render() {
    const { prefixCls } = this.props;
    const imgHeight = (utils.dom.windowHeight() * 0.56).toFixed(0);
    const imgWidth = utils.dom.windowWidth();
    return (
      <div className={`${prefixCls}`}>
        <Header trasparent title="登录" leftIcon="icon-angle-left" onLeftBtnClick={this.context.router.goBack} />
        <div className="content">
          <div style={{ height: imgHeight, width: imgWidth }}>
          <Image className="login-banner" thumbnail={imgWidth} crop={imgWidth + 'x' + imgHeight} quality={100} src={loginSplash}/>
          </div>
          <If condition= {utils.detector.isWechat()}>
            <div className="row no-margin">
              <button className="col-xs-10 col-xs-offset-1 margin-top-sm button button-no-padding button-success" type="button" onClick={this.onWechatLoginBtnClick}>
                <i className="icon-wechat" data-type={loginType.wechat}></i>
                <span>微信登录</span>
              </button>
            </div>
          </If>
          <div className="row no-margin margin-bottom-sm">
            <button className="col-xs-4 col-xs-offset-1 button button-stable text-center login-mobile" data-to={`/user/login/password?next=${encodeURIComponent(this.next())}`} onClick={this.onLinkClick}>密码登录</button>
            <button className="col-xs-4 col-xs-offset-2 button button-stable text-center login-sms" data-to={`/user/login/sms?next=${encodeURIComponent(this.next())}`} onClick={this.onLinkClick}>验证码登录</button>
          </div>
        </div>
      </div>
    );
  }
}
