import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as actionCreators from 'actions/exam';
import { Header } from 'components/Header';
import { Toast } from 'components/Toast';
import { Image } from 'components/Image';
import * as utils from 'utils';
import moment from 'moment';
import * as plugins from 'plugins';

import './index.scss';

const shareData = {
  share_to: '',
  active_id: 13,
};

const staticBase = '//og224uhh3.qnssl.com/mall/activity/exam/';
@connect(
  state => ({
    exam: state.exam,
  }),
  dispatch => bindActionCreators(actionCreators, dispatch),
)
export default class Home extends Component {

  static propTypes = {
    prefixCls: React.PropTypes.string,
    fetchExamInfo: React.PropTypes.func,
    exam: React.PropTypes.object,
  };

  static contextTypes = {
    router: React.PropTypes.object,
  };

  static defaultProps = {
    prefixCls: 'activity-exam',
  };

  constructor(props, context) {
    super(props);
    context.router;
    moment.locale('zh-cn');
  }

  state = {

  }

  componentWillMount() {
    this.props.fetchExamInfo();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.exam.info.isLoading) {
      utils.ui.loadingSpinner.show();
    } else {
      utils.ui.loadingSpinner.hide();
    }
  }

  onShareBtnClick = (e) => {
    /* if (utils.detector.isWechat()) {
      Toast.show('点击右上角按钮分享');
      return;
    }
    plugins.invoke({
      method: 'callNativeShareFunc',
      data: shareData,
    });*/
    Toast.show('查看分享教程');
    window.location.href = '//mp.weixin.qq.com/s?__biz=MzIzODUyOTk1NA==&mid=2247483710&idx=1&sn=0395e08b6bac98cd3c95ae3ac87b8c55&chksm=e936bdf3de4134e5dc145838ca525007501d1b06229ad0647bedbde71f77c4bbeaa154471ebd#rd';
  }

  onInviteBtnClick = (e) => {
    /* if (utils.detector.isWechat()) {
      Toast.show('点击右上角按钮分享');
      return;
    }
    plugins.invoke({
      method: 'callNativeShareFunc',
      data: shareData,
    });*/
    Toast.show('点击分享按钮邀请好友');
    // this.context.router.push('/mama/invited');
    window.location.href = '/mall/mama/invited';
  }

  onTakeExamBtnClick = (e) => {
    const examInfo = this.props.exam.info.data.exam_info || {};
    if (!examInfo.is_xlmm) {
      Toast.show('您不是你的铺子会员，无法参加此次考试！');
      return;
    }
    if (examInfo.total_point > 0) {
      Toast.show('您已经参加过本次考试！');
      // return;
    }
    this.context.router.push('/activity/exam/question/1/-1');
    e.preventDefault();
  }

  formatDate(beginDateStr, endDateStr) {
    const beginDate = moment(beginDateStr);
    const endDate = moment(endDateStr);
    return beginDate.format('a') + beginDate.format('h:mm') + '-' + endDate.format('h:mm');
  }

  render() {
    const { prefixCls, exam } = this.props;
    const examInfo = exam.info.data.exam_info || {};
    return (
      <div className={`${prefixCls} clearfix`}>
        <Header title="🚄✨VIP2考试✨💪💯" leftIcon="icon-angle-left" onLeftBtnClick={this.context.router.goSmartBack} hide={utils.detector.isApp()} />
        <Image className="col-xs-12 col-sm-8 col-sm-offset-2 no-padding" src={`${staticBase}banner-1.png`} quality={50} />
        <div className="col-xs-12 col-sm-8 col-sm-offset-2 no-padding exam-date">
          <Image src={`${staticBase}date-bg.png`} quality={90} />
          <div>
            <p className="font-lg font-red">考试时间</p>
            <p>{this.formatDate(examInfo.start_time, examInfo.expire_time)}</p>
          </div>
        </div>
        <div className="col-xs-12 col-sm-8 col-sm-offset-2 no-padding">
          <Image className="col-xs-4 no-padding" src={`${staticBase}btn-left.png`} quality={50}/>
          <If condition={!moment().isBetween(examInfo.start_time, examInfo.expire_time, 'seconds')}>
            <Image className="col-xs-4 no-padding" src={`${staticBase}start-exam-btn-disabled.png`} quality={50}/>
          </If>
          <If condition={moment().isBetween(examInfo.start_time, examInfo.expire_time, 'seconds')}>
            <Image className="col-xs-4 no-padding" src={`${staticBase}start-exam-btn-normal.png`} quality={50} onClick={this.onTakeExamBtnClick}/>
          </If>
          <Image className="col-xs-4 no-padding" src={`${staticBase}btn-right.png`} quality={90}/>
        </div>
        <Image className="col-xs-12 col-sm-8 col-sm-offset-2 no-padding" src={`${staticBase}paratice-part.png`} quality={50}/>
        <div className="col-xs-12 col-sm-8 col-sm-offset-2 no-padding activity-operations">
          <div className="activity-operation-item">
            <p className="pull-left no-padding"><span>邀请好友</span><span className="margin-left-xxs font-red">{examInfo.invite_num || 0}</span><span>/8</span></p>
            <If condition={examInfo.invite_num < 8}>
              <img className="pull-right no-padding" src={`${staticBase}invite-btn.png`} onClick={this.onInviteBtnClick}/>
            </If>
            <If condition={examInfo.invite_num >= 8}>
              <img className="pull-right no-padding stamp" src={`${staticBase}stamp.png`} />
            </If>
          </div>
          <div className="activity-operation-item">
            <p className="pull-left no-padding"><span>分享好友</span><span className="margin-left-xxs font-red">{examInfo.fans_num || 0}</span><span>/20</span></p>
            <If condition={examInfo.fans_num < 20}>
              <img className="pull-right no-padding" src={`${staticBase}share-btn.png`} onClick={this.onShareBtnClick}/>
            </If>
            <If condition={examInfo.fans_num >= 20}>
              <img className="pull-right no-padding stamp" src={`${staticBase}stamp.png`} />
            </If>
          </div>
        </div>
      </div>
    );
  }
}
