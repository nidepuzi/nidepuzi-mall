import React, { Component } from 'react';
import { Link } from 'react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'underscore';
import classnames from 'classnames';
import * as constants from 'constants';
import { If } from 'jsx-control-statements';
import { Header } from 'components/Header';
import { Loader } from 'components/Loader';
import { BottomBar } from 'components/BottomBar';
import { Toast } from 'components/Toast';
import { Timer } from 'components/Timer';
import { Timeline, TimelineItem } from 'components/Timeline';
import * as orderAction from 'actions/order/order';
import * as utils from 'utils';

import './index.scss';

const actionCreators = _.extend({}, orderAction);

const orderOperations = {
  2: { tag: '申请退款', action: 'apply-return-money' },
  4: { tag: '申请退货', action: 'apply-refunds' },
  3: { tag: '确认收货', action: 'confirm' },
};

@connect(
  state => ({
    order: state.order,
  }),
  dispatch => bindActionCreators(actionCreators, dispatch),
)
export default class Detail extends Component {

  static propTypes = {
    location: React.PropTypes.any,
    order: React.PropTypes.any,
    fetchOrder: React.PropTypes.func,
    deleteOrder: React.PropTypes.func,
    chargeOrder: React.PropTypes.func,
    confirmReceivedOrder: React.PropTypes.func,
    remindShipment: React.PropTypes.func,
    resetRemindShipment: React.PropTypes.func,
  };

  static contextTypes = {
    router: React.PropTypes.object,
  };

  constructor(props, context) {
    super(props);
    context.router;
  }

  state = {

  }

  componentWillMount() {
    this.props.fetchOrder(this.props.location.query.id);
  }

  componentWillReceiveProps(nextProps) {
    const { fetchOrder, chargeOrder, deleteOrder, remindShipment } = nextProps.order;
    if (fetchOrder.isLoading || chargeOrder.isLoading || deleteOrder.isLoading) {
      utils.ui.loadingSpinner.show();
    } else {
      utils.ui.loadingSpinner.hide();
    }
    if (chargeOrder.success && chargeOrder.data.code === 0 && !_.isEmpty(chargeOrder.data.charge)) {
      this.pay(chargeOrder.data.charge);
    } else if (chargeOrder.success && chargeOrder.data.info) {
      Toast.show(chargeOrder.data.info);
    }
  }

  onTradesBtnClick = (e) => {
    const dataSet = e.currentTarget.dataset;
    const { router } = this.context;
    switch (dataSet.action) {
      case constants.tradeOperations['1'].action:
        this.props.chargeOrder(dataSet.tradeid);
        break;
      case constants.tradeOperations['2'].action:
        this.props.remindShipment(dataSet.tradeid);
        break;
      default:
        break;
    }
  }

  onOrderBtnClick = (e) => {
    const dataSet = e.currentTarget.dataset;
    const { router } = this.context;
    switch (dataSet.action) {
      case orderOperations['2'].action:
        router.push(`/refunds/apply/${dataSet.tradeid}/${dataSet.orderid}`);
        break;
      case orderOperations['3'].action:
        this.props.confirmReceivedOrder(this.props.location.query.id, dataSet.orderid);
        break;
      case orderOperations['4'].action:
        router.push(`/refunds/apply/${dataSet.tradeid}/${dataSet.orderid}`);
        break;
      default:
        break;
    }
  }

  getClosedDate = (dateString) => {
    const date = new Date(dateString.replace('-', '/').replace('T', ' '));
    date.setMinutes(date.getMinutes() + 20);
    return date.toISOString();
  }

  pay = (charge) => {
    window.pingpp.createPayment(charge, (result, error) => {
      if (result === 'success') {
        window.location.replace(constants.paymentResults.success);
        // this.context.router.replace(paymentResults.success);
        return;
      }
      window.location.replace(constants.paymentResults.error);
      // this.context.router.replace(paymentResults.error);
    });
  }

  renderOrders(orders = []) {
    const trade = this.props.order.fetchOrder.data || {};
    const orderOperation = orderOperations[trade.status] || {};
    return (
      <div className="order-list">
        {orders.map((order, index) => {
          return (
            <div key={order.id} className="row no-margin bottom-border">
              <If condition={order.status !== 2 && order.status !== 3 && order.status !== 4}>
                <div className="col-xs-3 no-padding">
                  <img src={order.pic_path + constants.image.square} />
                </div>
                <div className="col-xs-9 no-padding">
                  <p className="row no-margin">
                    <span>{order.title}</span>
                    <span className="pull-right">{'￥' + order.total_fee}</span>
                  </p>
                  <p className="row no-margin font-grey">
                    <span>{'尺码：' + order.sku_name}</span>
                    <span className="pull-right">{'x' + order.num}</span>
                  </p>
                </div>
              </If>
              <If condition={order.status === 2 || order.status === 3 || order.status === 4}>
                <div className="col-xs-3 no-padding">
                  <img src={order.pic_path + constants.image.square} />
                </div>
                <div className="col-xs-6 no-padding">
                  <p className="row no-margin">
                    <span>{order.title}</span>
                  </p>
                  <div className="row no-margin">
                    <p className="pull-left  font-grey">{'尺码：' + order.sku_name}</p>
                    <p className="pull-right">
                      <span className="margin-right-xxs">{'￥' + order.total_fee}</span>
                      <span className="font-grey">{'x' + order.num}</span>
                    </p>
                  </div>
                </div>
                <div className="col-xs-3 no-padding text-center" style={ { marginTop: '25.5px' } }>
                  <If condition={order.refund_status === 0}>
                    <button className="button button-sm button-light" type="button" data-action={orderOperation.action} data-tradeid={trade.id} data-orderid={order.id} onClick={this.onOrderBtnClick}>{orderOperation.tag}</button>
                  </If>
                  <If condition={order.refund_status !== 0}>
                    <div>{order.refund_status_display}</div>
                  </If>
                </div>
              </If>
            </div>
          );
        })}
      </div>
    );
  }

  renderLogistics() {
    const order = this.props.order.fetchOrder.data;
    const time = order.created || '';
    const content = '订单创建成功';
    return (
      <Link to={'/order/logistics/' + order.tid}>
      <Timeline className="logistics-info">
        <TimelineItem className="row no-margin" headColor="yellow" tailColor="yellow">
          <div className="col-xs-11 no-padding">
          <p className="font-grey">{time.replace('T', ' ')}</p>
          <p className="font-sm">{content}</p>
          </div>
          <i className="col-xs-1 no-padding margin-top-xs icon-angle-right icon-2x icon-grey pull-right"></i>
        </TimelineItem>
      </Timeline>
      </Link>
    );
  }

  render() {
    const trade = this.props.order.fetchOrder.data || {};
    const receiver = trade.user_adress || {};
    const tradeOperation = constants.tradeOperations[trade.status] || {};
    return (
      <div className="trade">
        <Header title="订单详情" leftIcon="icon-angle-left" onLeftBtnClick={this.context.router.goBack} />
        <If condition={!_.isEmpty(trade)}>
        <div className="content trade-detail">
          <p className="trade-status">
            <sapn>订单编号</sapn>
            <sapn className="margin-left-xxs font-grey">{trade.id}</sapn>
            <sapn className="pull-right font-yellow">{trade.status_display}</sapn>
          </p>
          <div className="row no-margin receiver-info">
            <div className="col-xs-2 no-padding text-center margin-top-xxs">
              <i className="icon-location icon-2x icon-yellow-light"></i>
            </div>
            <div className="col-xs-10 no-padding">
              <p><span>{receiver.receiver_name}</span><span className="margin-left-xxs">{receiver.receiver_mobile}</span></p>
              <p className="font-xs font-grey-light">{receiver.receiver_state + receiver.receiver_city + receiver.receiver_district + receiver.receiver_address}</p>
            </div>
          </div>
          {this.renderLogistics()}
          {this.renderOrders(trade.orders)}
          <div className="price-info">
            <p><span>商品金额</span><span className="pull-right font-yellow">{'￥' + Number(trade.total_fee).toFixed(2)}</span></p>
            <p><span>优惠券</span><span className="pull-right font-yellow">{'-￥' + Number(trade.discount_fee).toFixed(2)}</span></p>
            <p><span>运费</span><span className="pull-right font-yellow">{'￥' + Number(trade.post_fee).toFixed(2)}</span></p>
          </div>
           <p className="pull-right margin-top-xxs margin-right-xxs"><span>总金额 ：</span><span className="font-yellow font-lg">{'￥' + Number(trade.payment).toFixed(2)}</span></p>
          <If condition={trade.status === 1 || trade.status === 2}>
            <BottomBar>
              <If condition={trade.status === 1}>
                <div className="pull-left text-left countdown">
                  <p className="font-grey">付款剩余时间</p>
                  <p><Timer endDateString={this.getClosedDate(trade.created)} format="mm:ss" hasBeenEnd="订单已过期"/></p>
                </div>
              </If>
              <div className="pull-right">
                <button className="button button-md button-energized" type="button" data-action={tradeOperation.action} data-tradeid={trade.id} onClick={this.onTradesBtnClick}>{tradeOperation.tag}</button>
              </div>
            </BottomBar>
          </If>
        </div>
        </If>
      </div>
    );
  }
}
