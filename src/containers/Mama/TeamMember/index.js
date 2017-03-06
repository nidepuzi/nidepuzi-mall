import React, { Component } from 'react';
import { Link } from 'react-router';
import { bindActionCreators } from 'redux';
import _ from 'underscore';
import * as utils from 'utils';
import * as plugins from 'plugins';
import * as constants from 'constants';
import { If } from 'jsx-control-statements';
import { connect } from 'react-redux';
import { Header } from 'components/Header';
import { Loader } from 'components/Loader';
import { Image } from 'components/Image';
import * as mamaBaseInfoAction from 'actions/mama/mamaDetailInfo';

import './index.scss';

const actionCreators = _.extend(mamaBaseInfoAction);

@connect(
  state => ({
    mamaBaseInfo: state.mamaDetailInfo,
  }),
  dispatch => bindActionCreators(actionCreators, dispatch),
)
export default class MamaTeamMember extends Component {
  static propTypes = {
    children: React.PropTypes.array,
    dispatch: React.PropTypes.func,
    mamaBaseInfo: React.PropTypes.any,
    fetchMamaFortune: React.PropTypes.func,
    fetchMamaTeamMember: React.PropTypes.func,
  };

  static contextTypes = {
    router: React.PropTypes.object,
  };

  constructor(props, context) {
    super(props);
    context.router;
  }

  state = {

    sticky: false,
    hasMore: false,

  }

  componentWillMount() {
    this.props.fetchMamaFortune();
    this.props.fetchMamaTeamMember();
  }

  componentDidMount() {
    this.addScrollListener();
  }

  componentWillReceiveProps(nextProps) {
    const { mamaFortune, mamaTeamMember } = this.props.mamaBaseInfo;

    if (mamaFortune.isLoading || mamaTeamMember.isLoading) {
      utils.ui.loadingSpinner.show();
    }

    if (!nextProps.mamaBaseInfo.mamaFortune.isLoading || !nextProps.mamaBaseInfo.mamaTeamMember.isLoading) {
      utils.ui.loadingSpinner.hide();
    }
  }

  componentWillUnmount() {
    this.removeScrollListener();
  }

  onScroll = (e) => {
  }

  onLeftBtnClick = (e) => {
    this.context.router.goBack();
  }

  onJumpClick = (e) => {
    this.context.router.push('/mama/inoutcoupon');
    e.preventDefault();
  }

  addScrollListener = () => {
    window.addEventListener('scroll', this.onScroll);
  }

  removeScrollListener = () => {
    window.removeEventListener('scroll', this.onScroll);
  }

  renderMember = (member, index) => {

    return (
      <li key={index} className="col-xs-12 member-item bottom-border" data-index={index} >
        <div className="col-xs-3 member-img-div no-padding no-margin">
          <Image className="member-img no-padding no-margin" src={member.thumbnail} quality={70} />
        </div>
        <div className="col-xs-3 no-padding no-margin member-name">
          <p className="text-center font-xs no-margin">{member.nick.length <= 10 ? member.nick : member.nick.substring(0, 9)}</p>
          <p className="text-center font-xs no-margin">{'ID:' + member.mama_id}</p>
        </div>
        <div className="col-xs-3 no-padding no-margin member-mobile">
          <p className="text-left font-xs no-margin">{member.mobile}</p>
        </div>
        <div className="col-xs-3 member-score no-padding no-margin">
          <p className="text-center font-xs no-margin">{member.elite_score + '积分' }</p>
        </div>
      </li>
    );
  }

  render() {
    const { mamaFortune, mamaTeamMember } = this.props.mamaBaseInfo;
    return (
      <div className="teammember-container no-padding">
        <Header title="我的精品团队" leftIcon="icon-angle-left" onLeftBtnClick={this.onLeftBtnClick}/>
        <div className="my-level bottom-border">
          <div className="col-xs-3">
            <img className="my-thumbnail" src ={(mamaFortune.success && mamaFortune.data.mama_fortune) ? mamaFortune.data.mama_fortune.extra_info.thumbnail : ''} />
          </div>
          <div className="col-xs-9">
            <p className="my-mama-id">{'我的ID:' + ((mamaFortune.success && mamaFortune.data.mama_fortune) ? mamaFortune.data.mama_fortune.mama_id : '')}</p>
          </div>
        </div>
        <div className="team-members bg-white">
          <If condition={mamaTeamMember.success && mamaTeamMember.data && mamaTeamMember.data.length > 0}>
            <ul>
            {mamaTeamMember.data.map((item, index) => this.renderMember(item, index))
            }
            </ul>
          </If>
          <If condition={mamaTeamMember.success && mamaTeamMember.data && mamaTeamMember.data.length === 0}>
            <div className="no-team-members bg-white">
              <p className="font-blue font-xs" onClick={this.onJumpClick} >您的精英团队还没有成员加入，团队越大收益越高，赶紧去招募吧>>></p>
            </div>
          </If>
        </div>
      </div>
    );
  }
}
