import React, { Component } from 'react';
import classnames from 'classnames';
import { Link } from 'react-router';
import { bindActionCreators } from 'redux';
import _ from 'underscore';
import { If } from 'jsx-control-statements';
import { connect } from 'react-redux';
import { Header } from 'components/Header';
import { Toast } from 'components/Toast';
import { Timeline, TimelineItem } from 'components/Timeline';
import * as expressInfoAction from 'actions/refunds/expressInfo';
import * as refundsDetailsAction from 'actions/refunds/detail';
import * as refundsLogisticsAction from 'actions/refunds/logistics';

import './index.scss';

const actionCreators = _.extend(expressInfoAction, refundsDetailsAction, refundsLogisticsAction);

@connect(
  state => ({
    express: state.expressInfo,
    refundsDetails: state.refundsDetails,
    refundsLogistics: state.refundsLogistics,
  }),
  dispatch => bindActionCreators(actionCreators, dispatch),
)
export default class Order extends Component {
  static propTypes = {
    location: React.PropTypes.any,
    children: React.PropTypes.array,
    params: React.PropTypes.object,
    dispatch: React.PropTypes.func,
    error: React.PropTypes.bool,
    refundsDetails: React.PropTypes.object,
    express: React.PropTypes.object,
    refundsLogistics: React.PropTypes.any,
    fetchRefundsDetail: React.PropTypes.func,
    pushExpressInfo: React.PropTypes.func,
    fetchRefundsLogistics: React.PropTypes.func,
    resetRefundsLogistics: React.PropTypes.func,
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
  }

  componentWillMount() {
    const { type, packageId, companyName } = this.props.location.query;
    const { refundsid } = this.props.params;
    if (_.isEmpty(this.props.refundsDetails.data)) {
      this.props.fetchRefundsDetail(refundsid);
    }
    if (refundsid && packageId && companyName) {
      this.props.fetchRefundsLogistics(refundsid, packageId, companyName);
    }
  }

  componentDidMount() {
    this.props.resetRefundsLogistics();
  }

  componentWillReceiveProps(nextProps) {
    const { express } = nextProps;
    if (express.success) {
      Toast.show(express.data.info);
    }
    if (express.success && express.data.code === 0) {
      this.context.router.push('/refunds/details/' + this.props.params.refundsid);
    }
  }

  onSubmitBtnClick = (e) => {
    const props = this.props;
    const params = { company: props.params.name, id: props.params.orderid, modify: 2, sid: this.state.logisticsNUmber };
    this.props.pushExpressInfo(params);
    e.preventDefault();
  }

  onExpressChooseBtnClick = (e) => {
    const { refundsid, orderid } = this.props.params;
    this.context.router.replace(`/refunds/express/company/${refundsid}/${orderid}`);
  }

  onLogisticsNumberChange = (e) => {
    this.setState({
      logisticsNUmber: e.currentTarget.value,
      submitBtnDisabled: false,
    });
    e.preventDefault();
  }

  renderRefunsLogistics = (logisticsList) => {
    return (
      <div className="row no-margin margin-top-xs padding-left-xs bottom-border">
        <Timeline className="margin-left-xxs">
          {logisticsList.map((item, index) => {
            return (
              <TimelineItem key={index} headColor="grey" tailColor="grey">
                <p className="font-grey">{item.time.replace('T', ' ')}</p>
                <p className="font-sm">{item.content}</p>
              </TimelineItem>
            );
          })}
        </Timeline>
      </div>
    );
  }

  render() {
    const { type, packageId, companyName } = this.props.location.query;
    const bindPhoneBtnCls = classnames({
      ['col-xs-10 col-xs-offset-1 margin-top-xs button button-energized']: 1,
      ['pressed']: this.state.submitBtnPressed,
    });
    const { refundsDetails, params, refundsLogistics } = this.props;
    const refundsDetailsData = refundsDetails.data || {};
    const refundsLogisticsData = refundsLogistics.data || {};
    return (
      <div className="fill-logistics-info">
        <Header title="填写快递单" leftIcon="icon-angle-left" onLeftBtnClick={this.context.router.goBack}/>
        <div className="content">
          <div className="row express-item refunds-address border">
            <p className="text-center font-xlg font-weight-800 margin-top-xs">收货地址</p>
            <If condition={refundsDetailsData.return_address}>
              <div className="bottom-border">
                <p className="text-left no-margin">
                  <span className="margin-right-xs">{'收货人：' + refundsDetailsData.return_address.split('，')[2]}</span>
                  <span>{'联系电话：' + refundsDetailsData.return_address.split('，')[1]}</span>
                </p>
                <p className="no-margin font-grey-light">{refundsDetailsData.return_address.split('，')[0]}</p>
              </div>
            </If>
            <div>
              <p>为提高您的退货退款效率，请注意一下事项</p>
              <p>1.填写退货单or小纸条一并寄回，写明您的<span className="font-orange">微信昵称、联系电话、退换货原因</span></p>
              <p>2.勿发顺丰或EMS高等邮费快递</p>
              <p>3.请先支付邮费，拒收到付件。收货验收后，货款和运费将分开退还到您的相应帐户</p>
              <p>4.请保持衣服吊牌完整，不影响商品后续处理</p>
            </div>
          </div>
          <If condition={type === 'fill'}>
            <div className="row no-margin bottom-border express-item">
              <div className="select-express" onClick={this.onExpressChooseBtnClick}>
                <p className="col-xs-6 no-margin">{params.name}</p>
                <i className="col-xs-6 icon-angle-right font-grey-light text-right"></i>
              </div>
            </div>
            <div className="row no-margin bottom-border express-item">
              <input className="col-xs-12 info-item" type="text" placeholder={'请输入快递单号'} onChange={this.onLogisticsNumberChange} />
            </div>
            <div className="row no-margin">
              <button className={bindPhoneBtnCls} type="button" onClick={this.onSubmitBtnClick} disabled={this.state.submitBtnDisabled}>提交</button>
            </div>
          </If>
          <If condition={!_.isEmpty(refundsLogisticsData) && type === 'find'}>
            {this.renderRefunsLogistics(refundsLogisticsData.data)}
          </If>
        </div>
      </div>
    );
  }
}
