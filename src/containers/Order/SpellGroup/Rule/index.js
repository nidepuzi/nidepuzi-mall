import React, { Component } from 'react';
import { Link } from 'react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'underscore';
import { Header } from 'components/Header';
import { Input } from 'components/Input';


export default class SpellGroupRule extends Component {
  static propTypes = {
    children: React.PropTypes.array,
  };

  static contextTypes = {
    router: React.PropTypes.object,
  };

  constructor(props, context) {
    super(props);
    context.router;
  }

  componentWillMount() {

  }

  render() {
    return (
      <div>
        <Header title="你的铺子拼团条款" leftIcon="icon-angle-left" onLeftBtnClick={this.context.router.goBack} />
        <div className="col-xs-12 col-sm-8 col-sm-offset-2 content">
          <h5 >你的铺子拼团条款</h5>

          <h3>1.拼团有效期</h3>
          <p>拼团有效期是自开团时刻起的24小时内，如果距离商品失效时间小于24小时，则以商品的结束时间为准。</p>
          <h3>2.拼团失败</h3>
          <p>超过成团有效期，未达成相应参团人数的团，则该团失败。</p>
          <p>在团有效期内，商品已提前售罄，若还未拼团成功，则该团失败。</p>
          <p>高峰期间，同时支付的人过多，团人数有限制，小鹿以接收第三方支付信息时间先后为准，超出该团人数限制的部分用户则会拼团失败。</p>
          <p>拼团失败的订单，系统会在1个工作日内处理退回至小鹿零钱中。</p>
          <h3>3.可以退款退货么</h3>
          <p>由于团购都是以极低的价格出售，因此不支持退款退货，各位亲注意。收到货物后如有质量问题可以申请退货。</p>
          <p>在法律法规许可范围内，你的铺子保留对拼团活动的最终解释权。</p>
        </div>
      </div>
    );
  }
}
