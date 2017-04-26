import React, { Component } from 'react';
import classnames from 'classnames';
import { Link } from 'react-router';
import { bindActionCreators } from 'redux';
import _ from 'underscore';
import { If } from 'jsx-control-statements';
import { connect } from 'react-redux';
import { Header } from 'components/Header';
import { Loader } from 'components/Loader';
import { Image } from 'components/Image';
import { Popup } from 'components/Popup';
import { Toast } from 'components/Toast';
import { Dialog } from 'components/Dialog';
import { Timeline, TimelineItem } from 'components/Timeline';
import * as utils from 'utils';
import * as actionCreators from 'actions/refunds/apply';

import './index.scss';

const titles = {
  2: '申请退款',
  4: '申请退货',
};

const reasons = {
  0: '其他',
  1: '错拍',
  2: '缺货',
  3: '开线/脱色/脱毛/有色差/有虫洞',
  4: '发错货/漏发',
  5: '没有发货',
  6: '未收到货',
  7: '与描述不符',
  8: '退运费',
  9: '发票问题',
  10: '七天无理由退换货',
};

@connect(
  state => ({
    order: state.refundsOrder,
    apply: state.refundsApply,
  }),
  dispatch => bindActionCreators(actionCreators, dispatch),
)
export default class Apply extends Component {
  static propTypes = {
    children: React.PropTypes.array,
    location: React.PropTypes.any,
    order: React.PropTypes.any,
    apply: React.PropTypes.any,
    params: React.PropTypes.object,
    dispatch: React.PropTypes.func,
    isLoading: React.PropTypes.bool,
    error: React.PropTypes.bool,
    fetchOrderById: React.PropTypes.func,
    pushRefundsApply: React.PropTypes.func,
    resetApply: React.PropTypes.func,
    resetOrder: React.PropTypes.func,
  };

  static contextTypes = {
    router: React.PropTypes.object,
  };

  constructor(props, context) {
    super(props);
    context.router;
  }
  state = {
    submitBtnDisabled: true,
    showPopup: false,
    reason: '',
    num: 0,
    sum_price: 0,
    description: '',
    proof_pic: [],
    reasonChange: true,
    isShowDialog: false,
  }

  componentWillMount() {
    const params = this.props.params;
    this.props.fetchOrderById(params.tradeId, params.orderId);
  }

  componentDidMount() {
    this.props.resetApply();
    this.props.resetOrder();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.order.success) {
      this.setState({ num: nextProps.order.data.num || 0 });
    }
    if (nextProps.apply.success) {
      Toast.show(nextProps.apply.data.info);
      if (nextProps.apply.data.code === 0) {
        this.context.router.goBack();
      }
    }
    if (nextProps.order.isLoading || nextProps.apply.isLoading) {
      utils.ui.loadingSpinner.show();
    } else {
      utils.ui.loadingSpinner.hide();
    }
  }

  onSubmitBtnClick = (e) => {
    const { order } = this.props;
    const state = this.state;
    const channel = this.props.location.query.refundChannel;
    const params = {
      id: order.data.id,
      reason: state.reasonIndex,
      num: state.num,
      sum_price: order.data.sum_price,
      description: state.description,
      proof_pic: '',
      refund_channel: channel,
    };
    if (channel === 'budget') {
      this.setState({ isShowDialog: true });
    } else {
      this.props.pushRefundsApply(params);
    }
    e.preventDefault();
  }

  onReasonChange = (e) => {
    const reason = e.target.textContent;
    const index = e.target.dataset.reasonIndex;
    this.setState({ reason: reason, showPopup: false, reasonIndex: Number(index), reasonChange: false });
    e.preventDefault();
  }

  onDesciptionChange = (e) => {
    this.setState({ description: e.target.value });
    e.preventDefault();
  }

  onCancelBtnClick = (e) => {
    this.setState({ isShowDialog: false, isShowPopup: true });
    e.preventDefault();
  }

  onAgreeBtnClick = (e) => {
    const { order } = this.props;
    const state = this.state;
    const channel = this.props.location.query.refundChannel;
    const params = {
      id: order.data.id,
      reason: state.reasonIndex,
      num: state.num,
      sum_price: order.data.sum_price,
      description: state.description,
      proof_pic: '',
      refund_channel: channel,
    };
    this.setState({ isShowDialog: false });
    this.props.pushRefundsApply(params);
    e.preventDefault();
  }

  numMinus = (e) => {
    if (this.state.num >= 2) {
      this.setState({ num: this.state.num - 1 });
    }
    e.preventDefault();
  }

  numPlus = (e) => {
    if (this.state.num < this.props.order.data.num) {
      this.setState({ num: this.state.num + 1 });
    }
    e.preventDefault();
  }

  hidePopup = (e) => {
    this.setState({ showPopup: false });
    e.preventDefault();
  }

  showPopup = (e) => {
    this.setState({ showPopup: true });
    e.preventDefault();
  }

  render() {
    const { isLoading, order } = this.props;
    const { refundChannel, refundType } = this.props.location.query;
    let statusList = [];
    const reasonCls = classnames('col-xs-6 text-right', {
      'font-grey-light': this.state.reasonChange,
    });
    if (!_.isEmpty(order.data.status_shaft)) {
      statusList = order.data.status_shaft.reverse();
    }
    let refundWay = {};
    if (order.data && order.data.extras) {
      refundWay = _.where(order.data.extras.refund_choices, { refund_channel: refundChannel })[0] || {};
    }
    return (
      <div className="refunds-apply">
        <Header title={titles[order.data.status] || ''} leftIcon="icon-angle-left" onLeftBtnClick={this.context.router.goBack}/>
        <div className="content refunds-apply">
          <div className="row no-margin bottom-border content-white-bg">
            <If condition={refundType === 'refundMoney'}>
              <If condition={refundWay.refund_channel === 'budget'}>
                <i className="col-xs-3 margin-top-xxs icon-3x text-left icon-refund-top-speed font-refund-top-speed"></i>
              </If>
              <If condition={refundWay.refund_channel !== 'budget'}>
                <i className="col-xs-3 margin-top-xxs no-padding icon-3x text-center icon-refund-common font-refund-common"></i>
              </If>
              <div className="col-xs-9 margin-top-xxs margin-bottom-xxs no-padding">
                <p className="row no-margin">{refundWay.name}</p>
                <p className="row no-margin padding-right-xxs font-xxs font-grey">{refundWay.desc}</p>
              </div>
            </If>
            <If condition={refundType === 'refundGoods'}>
              <i className="col-xs-3 no-padding icon-3x text-center icon-refund-common font-refund-common"></i>
              <div className="col-xs-9 margin-top-xxs margin-bottom-xxs no-padding">
                <p className="row no-margin">退货退款</p>
                <p className="row no-margin margin-top-xxs padding-right-xxs font-xxs font-grey">已收到货，需要退商品。</p>
              </div>
            </If>
          </div>
          <div className="row no-margin margin-top-xs padding-top-xxs padding-bottom-xxs bottom-border content-white-bg">
            <div className="col-xs-3">
              <Image className="border" thumbnail={60} crop={60 + 'x' + 60} quality={100} src={order.data.pic_path}/>
            </div>
            <div className="col-xs-9">
              <p className="row no-margin margin-top-xxs margin-bottom-xxs">
                <span className="col-xs-9 no-padding no-wrap">{order.data.title}</span>
                <span className="col-xs-3 no-padding text-right">{'¥' + order.data.total_fee}</span>
              </p>
              <p className="row font-grey-light">
                <span className="col-xs-9">尺码: {order.data.sku_name}</span>
                <span className="col-xs-3 text-right">x1</span>
              </p>
            </div>
          </div>
          <div className="row no-margin margin-top-xs padding-top-xs padding-bottom-xs bottom-border content-white-bg">
            <p className="col-xs-6 no-margin">申请数量</p>
            <p className="col-xs-6 no-margin text-right font-grey-light">
              <i className="icon-minus padding-right-xxs font-orange" onClick={this.numMinus}></i>
              <span className="padding-right-xxs">{this.state.num}</span>
              <i className="icon-plus font-orange" onClick={this.numPlus}></i>
            </p>
          </div>
          <div className="row no-margin padding-top-xs padding-bottom-xs bottom-border content-white-bg">
            <p className="col-xs-4 no-margin">可退金额</p>
            <p className="col-xs-8 no-margin text-right font-orange">{'¥' + order.data.payment}</p>
          </div>
          <div className="row no-margin bottom-border refund-reason content-white-bg" onClick={this.showPopup}>
            <p className="col-xs-4 no-margin">退款原因</p>
            <div className={ reasonCls } onChange={this.onVerifyCodeChange}>{this.state.reason}</div>
            <i className="col-xs-2 icon-angle-down font-grey-light text-right"></i>
          </div>
          <div className="row no-margin padding-top-xs padding-bottom-xs bottom-border refunds-desc content-white-bg">
            <textarea className="col-xs-12 border-none" type="text" placeholder="请输入退款说明" onChange={this.onDesciptionChange} />
          </div>
          <Popup className="popup" active={this.state.showPopup}>
            <div className="refunds-address-info">
              <p className="no-margin text-center bottom-border" data-reason-index="1" onClick={this.onReasonChange}>{reasons[1]}</p>
              <p className="no-margin text-center bottom-border" data-reason-index="2" onClick={this.onReasonChange}>{reasons[2]}</p>
              <p className="no-margin text-center bottom-border" data-reason-index="3" onClick={this.onReasonChange}>{reasons[3]}</p>
              <p className="no-margin text-center bottom-border" data-reason-index="4" onClick={this.onReasonChange}>{reasons[4]}</p>
              <p className="no-margin text-center bottom-border" data-reason-index="5" onClick={this.onReasonChange}>{reasons[5]}</p>
              <p className="no-margin text-center bottom-border" data-reason-index="6" onClick={this.onReasonChange}>{reasons[6]}</p>
              <p className="no-margin text-center bottom-border" data-reason-index="7" onClick={this.onReasonChange}>{reasons[7]}</p>
              <p className="no-margin text-center bottom-border" data-reason-index="8" onClick={this.onReasonChange}>{reasons[8]}</p>
              <p className="no-margin text-center bottom-border" data-reason-index="9" onClick={this.onReasonChange}>{reasons[9]}</p>
              <p className="no-margin text-center bottom-border" data-reason-index="10" onClick={this.onReasonChange}>{reasons[10]}</p>
              <p className="no-margin text-center bottom-border" data-reason-index="0" onClick={this.onReasonChange}>{reasons[0]}</p>
              <div className="row no-margin">
                <button className="col-xs-10 col-xs-offset-1 margin-top-xs button button-energized" type="button" onClick={this.hidePopup}>取消</button>
              </div>
            </div>
          </Popup>
          <Dialog active={this.state.isShowDialog} title="极速退款说明" content="极速退款，款项将快速返回至你的铺子零钱帐户。该退款能用于购买商品，也可提现。" onCancelBtnClick={this.onCancelBtnClick} onAgreeBtnClick={this.onAgreeBtnClick}/>
          <div className="row no-margin">
            <button className="col-xs-10 col-xs-offset-1 margin-top-xs button button-energized" type="button" onClick={this.onSubmitBtnClick}>提交</button>
          </div>
        </div>
      </div>
    );
  }
}
