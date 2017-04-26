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
import { Statusline, StatuslineItem } from 'components/Statusline';
import { Popup } from 'components/Popup';
import { LogisticsPopup } from 'components/LogisticsPopup';
import { Checkbox } from 'components/Checkbox';
import { Dialog } from 'components/Dialog';
import moment from 'moment';
import * as orderAction from 'actions/order/order';
import * as payInfoAction from 'actions/order/logistics';
import * as expressAction from 'actions/order/express';
import * as updateExpressAction from 'actions/order/updateExpress';
import * as utils from 'utils';

import './index.scss';

const actionCreators = _.extend(payInfoAction, orderAction, expressAction, updateExpressAction);

const orderOperations = {
  2: { tag: '申请退款', action: 'apply-return-money' },
  4: { tag: '申请退货', action: 'apply-refunds' },
  3: { tag: '确认收货', action: 'confirm' },
};

@connect(
  state => ({
    order: state.order,
    express: state.express,
    updateExpress: state.updateExpress,
  }),
  dispatch => bindActionCreators(actionCreators, dispatch),
)
export default class Detail extends Component {

  static propTypes = {
    location: React.PropTypes.any,
    express: React.PropTypes.any,
    updateExpress: React.PropTypes.any,
    fetchLogisticsCompanies: React.PropTypes.func,
    changeLogisticsCompany: React.PropTypes.func,
    order: React.PropTypes.any,
    fetchOrder: React.PropTypes.func,
    deleteOrder: React.PropTypes.func,
    resetDeleteOrder: React.PropTypes.func,
    chargeOrder: React.PropTypes.func,
    confirmReceivedOrder: React.PropTypes.func,
    remindShipment: React.PropTypes.func,
    resetRemindShipment: React.PropTypes.func,
    params: React.PropTypes.object,
  };

  static contextTypes = {
    router: React.PropTypes.object,
  };

  constructor(props, context) {
    super(props);
    context.router;
  }

  state = {
    logisticsPopupShow: false,
    logisticsCompanyName: '',
    logisticsCompanyCode: '',
    payTypePopupActive: false,
    isShowPopup: false,
    refundChecked: false,
    isShowDialog: false,
    isBondedGoods: false,
  }

  componentWillMount() {
    const { tid, id } = this.props.location.query;
    this.props.fetchOrder(id);
    this.props.fetchLogisticsCompanies();
  }

  componentWillReceiveProps(nextProps) {
    const { fetchOrder, chargeOrder, deleteOrder, remindShipment } = nextProps.order;
    let logisticsCompany = '';
    let addressId = '';
    if (fetchOrder.isLoading || chargeOrder.isLoading || deleteOrder.isLoading) {
      utils.ui.loadingSpinner.show();
    } else {
      utils.ui.loadingSpinner.hide();
    }
    if (chargeOrder.success && chargeOrder.data.code === 0 && !_.isEmpty(chargeOrder.data.charge)) {
      this.pay(chargeOrder.data.charge, chargeOrder.data.trade);
    } else if (chargeOrder.success && chargeOrder.data.info) {
      Toast.show(chargeOrder.data.info);
    }
    if (fetchOrder.success) {
      logisticsCompany = fetchOrder.data.logistics_company && fetchOrder.data.logistics_company.name || '推荐';
      addressId = fetchOrder.data && fetchOrder.data.user_adress.id;
      this.setState({ logisticsCompanyName: logisticsCompany, addressid: addressId });

      this.getBondedGoods(fetchOrder.data);
    }
    if (deleteOrder.success) {
      Toast.show(deleteOrder.data.info);
    }
    if (deleteOrder.success && deleteOrder.data.code === 0) {
      this.context.router.push(`/ol.html?type=1`);
    }
  }

  componentWillUnmount() {
    const { deleteOrder } = this.props.order;
    if (deleteOrder.success || deleteOrder.error) {
      this.props.resetDeleteOrder();
    }
  }

  onLogisticsCompanyChange = (e) => {
    const { value, name } = e.currentTarget.dataset;
    this.setState({ isShowDialog: true, logisticsCompanyCode: value });
    e.preventDefault();
  }

  onShowLogisticsPopUpClick = (e) => {
    this.setState({ logisticsPopupShow: true });
    e.preventDefault();
  }

  onColseLogisticsPopupClick = (e) => {
    this.setState({ logisticsPopupShow: false });
    e.preventDefault();
  }

  onCancelBtnClick = (e) => {
    this.setState({ isShowDialog: false, logisticsPopupShow: false });
    e.preventDefault();
  }

  onAgreeBtnClick = (e) => {
    const { addressid } = this.state;
    const id = this.props.location.query.id;
    this.setState({
      isShowDialog: false, logisticsPopupShow: false,
    });
    this.props.changeLogisticsCompany(addressid, this.props.location.query.id, this.state.logisticsCompanyCode, Number(id));
    e.preventDefault();
  }

  onRefudWayChangeClick = (e) => {
    const dataSet = e.currentTarget.dataset;
    this.setState({ refundChannel: dataSet.channel, refundChecked: true });
  }

  onConfirmBtnClick = (e) => {
    const { tradeid, orderid, refundChannel, refundChecked } = this.state;
    const { router } = this.context;
    if (!refundChecked) {
      Toast.show('请选择退款方式！');
      return;
    }
    router.push(`/refunds/apply/${tradeid}/${orderid}?refundChannel=${refundChannel}&refundType=refundMoney`);
    e.preventDefault();
  }

  onColsePopupClick = (e) => {
    this.setState({ isShowPopup: false });
    e.preventDefault();
  }

  onTradesBtnClick = (e) => {
    const dataSet = e.currentTarget.dataset;
    const { router } = this.context;
    switch (dataSet.action) {
      case constants.tradeOperations['1'].action:
        this.togglePayTypePopupActive();
        break;
      case constants.tradeOperations['2'].action:
        this.props.remindShipment(dataSet.tradeid);
        break;
      case 'cancel':
        this.props.deleteOrder(dataSet.tradeid);
        break;
      default:
        break;
    }
  }

  onOrderBtnClick = (e) => {
    const { action, orderid, tradeid } = e.currentTarget.dataset;
    const { router } = this.context;
    const trade = this.props.order.fetchOrder.data || {};
    switch (action) {
      case orderOperations['2'].action:
        if (trade && trade.extras && trade.extras.refund_choices.length === 1) {
          router.push(`/refunds/apply/${tradeid}/${orderid}?refundChannel=${trade.extras.refund_choices[0].refund_channel}&refundType=refundMoney`);
        } else {
          this.setState({ isShowPopup: true, tradeid: tradeid, orderid: orderid });
        }
        break;
      case orderOperations['3'].action:
        this.props.confirmReceivedOrder(tradeid, orderid);
        break;
      case orderOperations['4'].action:
        router.push(`/refunds/apply/${tradeid}/${orderid}?refundType=refundGoods`);
        break;
      default:
        break;
    }
  }

  onPayTypeClick = (e) => {
    const dataSet = e.currentTarget.dataset;
    this.props.chargeOrder(dataSet.tradeid, dataSet.paytype);
  }

  onProductClick = (e) => {
    const { modelid } = e.currentTarget.dataset;
    // this.context.router.push(`/product/details/${modelid}`);
    window.location.href = `/mall/product/details/${modelid}`;
  }

  onLogisticsClick = (e) => {
    const { key, packageid, companycode, orderid } = e.currentTarget.dataset;
    if (packageid && companycode) {
      this.context.router.push(`/order/logistics?key=${key}&packageId=${packageid}&companyCode=${companycode}&id=${orderid}`);
    }
  }

  getBondedGoods = (data) => {
    let isBondedGoods = false;
    let i = 0;

    if (!data.packages || data.packages.length === 0) {
      return;
    }
    for (i = 0; i < data.packages.length; i++) {
      for (let j = 0; j < data.packages[i].orders.length; j++) {
        const item = data.packages[i].orders[j];
        if (item.is_bonded_goods) {
          isBondedGoods = true;
          break;
        }
      }
    }

    this.setState({ isBondedGoods: isBondedGoods });
  }

  getClosedDate = (dateString) => {
    const date = moment(dateString).toDate();
    date.setMinutes(date.getMinutes() + 20);
    return date.toISOString();
  }

  writeCerID = (e) => {
    this.context.router.push(`user/address/edit/${this.props.order.fetchOrder.data.user_adress.id}?is_bonded_goods=${this.state.isBondedGoods}`);
    e.preventDefault();
  }

  togglePayTypePopupActive = () => {
    this.setState({ payTypePopupActive: !this.state.payTypePopupActive });
  }

  pay = (charge, trade) => {
    window.pingpp.createPayment(charge, (result, error) => {
      if (result === 'success') {
        // window.location.replace(`${constants.paymentResults.success}/${trade.id}/${trade.tid}`);
        window.location.href = `${constants.paymentResults.success}/${trade.id}/${trade.tid}`;
        return;
      }
      window.location.replace(constants.paymentResults.error);
    });
  }

  renderOrders(orders = [], key, packageId, companyCode, id) {
    const trade = this.props.order.fetchOrder.data || {};
    const self = this;
    return (
      orders.map((order, index) => {
        return (
          <div key={order.id} className="row no-margin bottom-border padding-left-xxs padding-right-xxs">
            <If condition={order.status !== 2 && order.status !== 3 && order.status !== 4}>
              <div className="col-xs-3 no-padding">
                <img src={order.pic_path + constants.image.square} data-modelid={order.model_id} onClick={this.onProductClick}/>
              </div>
              <div className="col-xs-9 no-padding padding-top-xxs font-xs" data-key={key} data-packageid={packageId} data-companycode={companyCode} data-orderid={id} onClick={this.onLogisticsClick}>
                <p className="row no-margin no-wrap">{order.title}</p>
                <p className="row no-margin margin-top-xxxs font-grey">{'尺寸: ' + order.sku_name}</p>
                <p className="row no-margin margin-top-xxxs">
                  <span className="">{'￥' + (Number(order.num) > 0) ? (Number(order.total_fee) / Number(order.num)).toFixed(2) : 0}</span>
                  <span className="padding-left-xs">{'x' + order.num}</span>
                </p>
              </div>
            </If>
            <If condition={order.status === 2 || order.status === 3 || order.status === 4}>
              <div className="col-xs-3 no-padding">
                <img src={order.pic_path + constants.image.square} data-modelid={order.model_id} onClick={this.onProductClick}/>
              </div>
              <div className="col-xs-6 no-padding padding-top-xxs font-xs" data-key={key} data-packageid={packageId} data-companycode={companyCode} data-orderid={id} onClick={this.onLogisticsClick}>
                <p className="row no-margin no-wrap">{order.title}</p>
                <p className="row no-margin margin-top-xxxs font-grey">{'尺寸: ' + order.sku_name}</p>
                <p className="row no-margin margin-top-xxxs">
                  <span className="">{'￥' + (order.total_fee / order.num)}</span>
                  <span className="padding-left-xs">{'x' + order.num}</span>
                </p>
              </div>
              <div className="col-xs-3 no-padding text-center" style={ { marginTop: '25.5px' } }>
                <Choose>
                  <When condition={order.status === 2 && order.refund_status === 0 && order.can_refund}>
                    <button className="button button-sm button-light" type="button" data-action={orderOperations[order.status].action} data-tradeid={trade.id} data-orderid={order.id} onClick={self.onOrderBtnClick}>{orderOperations[order.status].tag}</button>
                  </When>
                  <When condition={order.status === 3}>
                    <button className="button button-sm button-light" type="button" data-action={orderOperations[order.status].action} data-tradeid={trade.id} data-orderid={order.id} onClick={self.onOrderBtnClick}>{orderOperations[order.status].tag}</button>
                  </When>
                  <When condition={order.status === 4 && order.refund_status === 0 && order.can_refund}>
                    <button className="button button-sm button-light" type="button" data-action={orderOperations[order.status].action} data-tradeid={trade.id} data-orderid={order.id} onClick={self.onOrderBtnClick}>{orderOperations[order.status].tag}</button>
                  </When>
                </Choose>
                <If condition={order.refund_status !== 0}>
                  <div>{order.refund_status_display}</div>
                </If>
              </div>
            </If>
          </div>
        );
      })
    );
  }

  renderPackages(packages = []) {
    const trade = this.props.order.fetchOrder.data || {};
    const { tid, id } = this.props.location.query;
    const self = this;
    return (
      <div className="order-list">
      {_.map(packages, function(item, key) {
        return (
          <div key={key}>
            <If condition={!(item.id === '' || item.assign_status_display === '已取消')}>
              <div className="row no-margin bottom-border">
                <Link to={`/order/logistics?key=${key}&packageId=${item.out_sid}&companyCode=${item.logistics_company && item.logistics_company.code}&id=${id}`}>
                  <p className="pull-left padding-top-xxs padding-left-xs font-grey">{'包裹' + (Number(key) + 1)}</p>
                  <p className="pull-right padding-top-xxs padding-right-xs font-orange">
                    <span>{item.assign_status_display}</span>
                    <i className="padding-top-xxs icon-angle-right icon-grey"></i>
                  </p>
                </Link>
              </div>
            </If>
            {self.renderOrders(item.orders, key, item.out_sid, item.logistics_company && item.logistics_company.code, id)}
          </div>
        );
      })}
      </div>
    );
  }

  render() {
    const { express } = this.props;
    const trade = this.props.order.fetchOrder.data || {};
    const receiver = trade.user_adress || {};
    const tradeOperation = constants.tradeOperations[trade.status] || {};
    const channels = trade.extras ? (trade.extras.channels || []) : [];
    const logisticsCompanies = express.data || [];
    const packages = trade.packages || {};
    const type = Number(this.props.location.query.type);
    const refundStatusList = {
      0: { display: '订单创建' },
      1: { display: '等待支付' },
      2: { display: '支付成功' },
      3: { display: '产品发货' },
      4: { display: '产品签收' },
      5: { display: '交易成功' },
    };
    return (
      <div className="trade">
        <Header title="订单详情" leftIcon="icon-angle-left" onLeftBtnClick={this.context.router.goBack} />
        <If condition={!_.isEmpty(trade)}>
        <div className="content trade-detail">
          <If condition={trade.status !== 6 && trade.status !== 7}>
          <div className="trade-status-list">
            <table className="margin-bottom-xxs">
              <thead><tr>
                {_.map(refundStatusList, function(item, key) {
                  const index = Number(key);
                  return (
                    <Choose>
                      <When condition={index === trade.status}>
                        <th key={index} className="font-xxs font-weight-200 font-orange text-center">
                          {item.display}
                        </th>
                      </When>
                      <When condition={index !== trade.status}>
                        <th key={index} className="font-xxs font-weight-200 text-center">
                          {item.display}
                        </th>
                      </When>
                    </Choose>
                  );
                })}
              </tr></thead>
            </table>
            <Statusline width={480 + 'px'}>
              {_.map(refundStatusList, function(item, key) {
                const index = Number(key);
                return (
                  <div className="inline-block">
                    <If condition={index === trade.status}>
                      <StatuslineItem key={index} headColor="yellow" tailColor="yellow">
                        <p/>
                      </StatuslineItem>
                    </If>
                    <If condition={index !== trade.status}>
                      <StatuslineItem key={index} headColor="grey" tailColor="grey">
                        <p/>
                      </StatuslineItem>
                    </If>
                  </div>
                );
              })}
            </Statusline>
          </div>
          </If>
          <div className="row no-margin margin-bottom-xs receiver-info">
            <div className="col-xs-2 no-padding text-center margin-top-xxs">
              <i className="icon-location icon-2x icon-yellow-light"></i>
            </div>
            <div className="col-xs-10 no-padding">
              <p><span>{receiver.receiver_name}</span><span className="margin-left-xxs">{receiver.receiver_mobile}</span></p>
              <p className="font-xs font-grey-light">{receiver.receiver_state + receiver.receiver_city + receiver.receiver_district + receiver.receiver_address}</p>
            </div>
          </div>
          <div className="row no-margin bottom-border margin-top-xs logistics-company">
            <p className="col-xs-5 no-margin no-padding">物流配送</p>
            <If condition={trade.status_display === '已付款'}>
              <div className="col-xs-7 no-padding" onClick={this.onShowLogisticsPopUpClick}>
                <p className="col-xs-11 no-margin no-padding text-right">{this.state.logisticsCompanyName}</p>
                <i className="col-xs-1 no-padding margin-top-28 text-right icon-angle-right icon-grey"></i>
              </div>
            </If>
            <If condition={trade.status_display !== '已付款'}>
              <p className="col-xs-7 no-margin no-padding text-right">{this.state.logisticsCompanyName}</p>
            </If>
          </div>
          <If condition={!_.isEmpty(packages)}>
            {this.renderPackages(packages)}
          </If>
          <div className="price-info bottom-border">
            <p><sapn>订单编号</sapn><sapn className="pull-right">{trade.tid}</sapn></p>
            <p>
              <span>支付方式</span>
              <If condition={trade.channel === 'wx'}>
                <i className="pull-right icon-1x icon-wechat-pay font-green"></i>
              </If>
              <If condition={trade.channel === 'alipay' || trade.channel === 'alipay_wap'}>
                <i className="pull-right icon-1x icon-alipay-square font-blue"></i>
              </If>
              <If condition={trade.channel === 'budget'}>
                <i className="pull-right icon-1x icon-xiaolu font-orange"></i>
              </If>
            </p>
            <p><span>商品金额</span><span className="pull-right font-yellow">{'￥' + Number(trade.total_fee).toFixed(2)}</span></p>
            <p><span>优惠券</span><span className="pull-right font-yellow">{'-￥' + Number(trade.discount_fee).toFixed(2)}</span></p>
            <p><span>运费</span><span className="pull-right font-yellow">{'￥' + Number(trade.post_fee).toFixed(2)}</span></p>
            <p><span>零钱支付</span><span className="pull-right font-yellow">{'-￥' + Number(trade.payment - trade.pay_cash).toFixed(2)}</span></p>
          </div>
          <div>
            <If condition={type === 1}>
              <p className="margin-top-xxs margin-left-xs margin-right-xs">
                <span>应付金额</span>
                <span className="pull-right font-yellow">{'￥' + Number(trade.total_fee).toFixed(2)}</span>
              </p>
            </If>
            <If condition={type === 0 || type === 2}>
              <p className="margin-top-xxs margin-left-xs margin-right-xs">
                <span>实付金额</span>
                <span className="pull-right font-yellow">{'￥' + Number(trade.pay_cash).toFixed(2)}</span>
              </p>
            </If>
          </div>
          <If condition={Number(trade.order_type) === 3}>
            <a href={`/mall/order/spell/group/${trade.tid}?from_page=order_detail`}>
              <div className="row no-margin content-white-bg">
                <button className="col-xs-10 col-xs-offset-1 margin-top-xs margin-bottom-xs button button-energized" type="button">查看拼团进度</button>
              </div>
            </a>
          </If>
          <If condition={trade.status === 1}>
            <BottomBar>
              <If condition={trade.status === 1}>
                <div className="pull-left text-left countdown">
                  <p className="font-grey">付款剩余时间</p>
                  <p><Timer endDateString={this.getClosedDate(trade.created)} format="mm:ss" hasBeenEnd="订单已过期"/></p>
                </div>
              </If>
              <div className="pull-right">
                <If condition={trade.status === 1}>
                  <button className="button button-md button-light margin-right-xxs" type="button" data-action="cancel" data-tradeid={trade.id} onClick={this.onTradesBtnClick}>取消订单</button>
                </If>
                <button className="button button-md button-energized" type="button" data-action={tradeOperation.action} data-tradeid={trade.id} onClick={this.onTradesBtnClick}>{tradeOperation.tag}</button>
              </div>
            </BottomBar>
          </If>
          <If condition={trade.status === 2 && this.state.isBondedGoods}>
            <div className="write-cerid">
              <p className="font-xs">由于海关政策要求，保税区发货包裹需要提供身份证。请填写身份证，信息加密保存，仅用于海关清关。</p>
              <div>
              <button className="col-xs-8 col-xs-offset-2 button button-energized font-xs" onClick={this.writeCerID}>填写收件人身份证号码</button>
              </div>
            </div>
          </If>
        </div>
        </If>
        <Popup active={this.state.payTypePopupActive} className="pay-type-popup">
          <div className={`row no-margin bottom-border `}>
            <i className="col-xs-1 padding-left-xxs padding-top-xxs icon-close font-orange" onClick={this.togglePayTypePopupActive}></i>
            <div className="col-xs-11">
              <p className="no-margin text-center font-xs">应付款金额</p>
              <p className="no-margin text-center font-lg font-orange">{'￥' + Number(trade.pay_cash).toFixed(2)}</p>
            </div>
          </div>
          {channels.map((channel) => {
            if (!channel.payable) {
              return null;
            }
            return (
              <div className="bottom-border pay-type-item" key={channel.id} data-tradeid={trade.id} data-paytype={channel.id} onClick={this.onPayTypeClick}>
                <i className={`${constants.payTypeIcons[channel.id]} icon-2x margin-right-xxs`}></i>
                <span className="inline-block margin-top-xxs">{channel.name}</span>
              </div>
            );
          })}
        </Popup>
        <Popup active={this.state.isShowPopup}>
          <div className="col-xs-12 bottom-border padding-bottom-xxs">
            <i className="col-xs-1 margin-top-xxs no-padding icon-1x text-left icon-close font-orange" onClick={this.onColsePopupClick}></i>
            <p className="col-xs-11 no-margin padding-top-xxs text-center font-lg">退款方式</p>
          </div>
          <If condition={!_.isEmpty(trade.extras && trade.extras.refund_choices)}>
            <ul>
            {trade.extras.refund_choices.map((item, index) => {
              return (
                <li key={index} className="row bottom-border" data-pic={item.pic} data-desc={item.desc} data-name={item.name} data-channel={item.refund_channel} onClick={this.onRefudWayChangeClick}>
                  <If condition={item.refund_channel === 'budget'}>
                    <i className="col-xs-3 margin-top-xs no-padding icon-3x text-center icon-refund-top-speed font-refund-top-speed"></i>
                  </If>
                  <If condition={item.refund_channel !== 'budget'}>
                    <i className="col-xs-3 margin-top-xs no-padding icon-3x text-center icon-refund-common font-refund-common"></i>
                  </If>
                  <div className="col-xs-7 margin-top-xxs margin-bottom-xxs no-padding">
                    <p className="no-margin">{item.name}</p>
                    <p className="no-margin font-xxs font-grey">{item.desc}</p>
                  </div>
                  <div className="col-xs-2 margin-top-xs">
                    <Checkbox className="col-xs-4 padding-top-xs no-padding" value={item.refund_channel} checked={this.state.refundChannel === item.refund_channel}/>
                  </div>
                </li>
              );
            })}
            </ul>
            <div className="row no-margin">
              <button className="col-xs-10 col-xs-offset-1 margin-top-xs button button-energized" type="button" onClick={this.onConfirmBtnClick}>确定</button>
            </div>
          </If>
        </Popup>
        <LogisticsPopup active={this.state.logisticsPopupShow} companies={logisticsCompanies} onItemClick={this.onLogisticsCompanyChange} onColsePopupClick={this.onColseLogisticsPopupClick}/>
        <Dialog active={this.state.isShowDialog} title="提醒" content="部分商品是供应商直接发货，只能尽量满足您选择的快递公司，如需确认能否满足您的快递需求，请联系客服。" onCancelBtnClick={this.onCancelBtnClick} onAgreeBtnClick={this.onAgreeBtnClick}/>
      </div>
    );
  }
}
