import React, { Component } from 'react';
import { Link } from 'react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'underscore';
import { If } from 'jsx-control-statements';
import { Header } from 'components/Header';
import { Image } from 'components/Image';
import { Checkbox } from 'components/Checkbox';
import { Input } from 'components/Input';
import { BottomBar } from 'components/BottomBar';
import { WechatPopup } from 'components/WechatPopup';
import * as invitedAction from 'actions/mama/invited';
import * as inviteSharingAction from 'actions/mama/inviteSharing';
import * as wechatSignAction from 'actions/wechat/sign';
import moment from 'moment';
import * as plugins from 'plugins';
import * as utils from 'utils';
import * as constants from 'constants';


import './index.scss';

const base = `${constants.image.imageUrl}/mall/v3/`;
const actionCreators = _.extend(invitedAction, inviteSharingAction, wechatSignAction);
const shareType = {
  full: 38,
  trial: 27,
};

@connect(
  state => ({
    invited: state.invited,
    inviteSharing: state.inviteSharing,
    wechatSign: state.wechatSign,
  }),
  dispatch => bindActionCreators(actionCreators, dispatch),
)
export default class Invited extends Component {
  static propTypes = {
    children: React.PropTypes.array,
    invited: React.PropTypes.object,
    inviteSharing: React.PropTypes.object,
    wechatSign: React.PropTypes.object,
    fetchInvited: React.PropTypes.func,
    fetchInviteSharing: React.PropTypes.func,
    fetchWechatSign: React.PropTypes.func,
  };

  static contextTypes = {
    router: React.PropTypes.object,
  };

  constructor(props, context) {
    super(props);
    context.router;
  }

  state = {
    activeTab: 'full',
    popupActive: false,
 }

  componentWillMount() {
    const { activeTab } = this.state;
    this.props.fetchWechatSign();
    this.props.fetchInvited(activeTab);
    this.props.fetchInviteSharing(shareType[activeTab]);
  }

  componentDidMount() {
    document.body.style.backgroundColor = '#FFCB00';
  }

  componentWillReceiveProps(nextProps) {
    const { inviteSharing, wechatSign } = nextProps;
    const { activeTab } = this.state;
    plugins.invoke({
      method: 'changeId',
      data: {
        id: shareType[activeTab],
        title: inviteSharing.data.title || '邀请您加入你的铺子正式会员',
      },
    });

    if (inviteSharing.success && !inviteSharing.isLoading
        && wechatSign.success && !wechatSign.isLoading
        && (this.props.inviteSharing.isLoading || this.props.wechatSign.isLoading)) {
      utils.wechat.config(wechatSign);
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
  }

  componentWillUnmount() {
    document.body.style.backgroundColor = '';
  }

  onTabItemClick = (e) => {
    const activeTab = e.currentTarget.id;
    const { inviteSharing } = this.props;
    this.setState({ activeTab: activeTab });
    this.props.fetchInvited(activeTab);
    this.props.fetchInviteSharing(shareType[activeTab]);
    plugins.invoke({
      method: 'changeId',
      data: {
        id: shareType[activeTab],
        title: inviteSharing.data.title || '邀请您加入你的铺子正式会员',
      },
    });
  }

  onShareClick = (e) => {
    const shareInfo = this.props.inviteSharing.data || {};

    if (utils.detector.isWechat()) {
      this.setState({ popupActive: true });
      return;
    }

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

  onCloseBtnClick = (e) => {
    this.setState({ popupActive: false });
  }

  render() {
    const { activeTab } = this.state;
    const { invited } = this.props;
    return (
      <div className="col-xs-12 col-sm-8 col-sm-offset-2 no-padding invited">
        <Header title="邀请开店" leftIcon="icon-angle-left" onLeftBtnClick={this.context.router.goBack} hide={utils.detector.isApp()}/>
        <div className="spec">
            <h5>正式会员享受大福利：</h5>
            <p>福利1:享有精品汇所有商品代理权，爆款销售佣金20-200元。</p>
            <p>福利2:店铺或商品轻松转发，根据会员积分升级计划更有佣金提升。社群免费天天培训。</p>
        </div>
        <div className="invited-list text-center">
          <h5>{`邀请${invited.data.count || 0}位好友`}</h5>
          <ul>
            {_.map(invited.data.results, (item, index) => {
              return (
                <li className="row no-margin margin-top-xxs" key={index}>
                  <img className="pull-left avatar" src={item.thumbnail} />
                  <div style={{ display: 'inline-block', maxWidth: '70%' }} className="no-wrap">
                    <p style={{ color: '#666' }}>{moment(item.charge_time).format('YYYY-MM-DD hh:mm:ss')}</p>
                    <p>
                      <span style={{ color: '#0095FF' }}>{item.nick}</span>
                      <span style={{ color: '#1E1E1E' }}>通过邀请加入你的铺子</span>
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        <BottomBar>
          <div className="row no-margin text-center margin-bottom-xs">
            <button className="col-xs-10 col-xs-offset-1 button button-energized" onClick={this.onShareClick}>分享</button>
          </div>
        </BottomBar>
        <WechatPopup active={this.state.popupActive} onCloseBtnClick={this.onCloseBtnClick}/>
      </div>
    );
  }
}
