import React, { Component } from 'react';
import { Link } from 'react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'underscore';
import * as actionCreators from 'actions/user/profile';
import { Header } from 'components/Header';
import { Toast } from 'components/Toast';
import { Loader } from 'components/Loader';
import { If } from 'jsx-control-statements';
import classnames from 'classnames';

import './index.scss';

@connect(
  state => ({
    data: state.profile.data,
    isLoading: state.profile.isLoading,
    error: state.profile.error,
    success: state.profile.success,
  }),
  dispatch => bindActionCreators(actionCreators, dispatch),
)
export default class Profile extends Component {
  static propTypes = {
    children: React.PropTypes.array,
    data: React.PropTypes.any,
    dispatch: React.PropTypes.func,
    isLoading: React.PropTypes.bool,
    error: React.PropTypes.bool,
    fetchProfile: React.PropTypes.func,
    logout: React.PropTypes.any,
  }

  static contextTypes = {
    router: React.PropTypes.object,
  };

  constructor(props, context) {
    super(props);
    context.router;
  }

  componentWillMount() {
    this.props.fetchProfile();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.success && nextProps.data.code === 0) {
      this.context.router.push('/user/login');
    }
  }

  onLogoutBtnClick = (e) => {
    this.props.logout();
  }

  render() {
    const { children, error, isLoading } = this.props;
    const profile = this.props.data;
    const logoutBtnCls = classnames({
      ['col-xs-10 col-xs-offset-1 margin-top-xs button button-energized']: 1,
    });

    return (
      <div>
        <Header title="个人信息" leftIcon="icon-angle-left" onLeftBtnClick={this.context.router.goBack} />
        <div className="content">
          {isLoading ? <Loader/> : null}
          <ul className="user-info-list">
            <li className="bottom-border row no-margin">
              <Link to="/user/nickname">
                <p className="col-xs-4 text-left">账户昵称</p>
                <p className="text-right padding-right-15">
                  <span>{profile.nick}</span>
                  <i className="icon-angle-right font-grey-light"></i>
                </p>
              </Link>
            </li>
            <li className="bottom-border row no-margin">
              <Link to="/user/profile/phone">
                <p className="col-xs-6 text-left">绑定手机</p>
                <p className="col-xs-6 text-right">
                  <span>{profile.mobile}</span>
                  <i className="icon-angle-right font-grey-light"></i>
                </p>
              </Link>
            </li>
            <li className="bottom-border row no-margin">
              <Link to="/user/password/set">
                <p className="col-xs-6 text-left">修改密码</p>
                <p className="col-xs-6 text-right">
                  <i className="icon-angle-right font-grey-light"></i>
                </p>
              </Link>
            </li>
            <li className="bottom-border row no-margin hide">
              <Link to="">
                <p className="col-xs-6 text-left">第三方账户绑定</p>
                <p className="col-xs-6 text-right">
                  <i className="icon-angle-right font-grey-light"></i>
                </p>
              </Link>
            </li>
            <li className="bottom-border row no-margin margin-top-xs">
              <Link to="/user/address">
                <p className="col-xs-6 text-left">地址管理</p>
                <p className="col-xs-6 text-right">
                  <i className="icon-angle-right font-grey-light"></i>
                </p>
              </Link>
            </li>
            <li className="bottom-border row no-margin margin-top-xs hide">
              <Link to="">
                <p className="col-xs-6 text-left">清除缓存</p>
                <p className="col-xs-6 text-right">
                  <i className="icon-angle-right font-grey-light no-padding"></i>
                </p>
              </Link>
            </li>
            <li className="bottom-border row no-margin hide">
              <Link to="">
                <p className="col-xs-6 text-left">关于小鹿美美</p>
                <p className="col-xs-6 text-right">
                  <i className="icon-angle-right font-grey-light no-padding"></i>
                </p>
              </Link>
            </li>
          </ul>
          <div className="row no-margin">
              <button className={logoutBtnCls} type="button" onClick={this.onLogoutBtnClick}>退出</button>
          </div>
        </div>
      </div>
    );
  }
}
