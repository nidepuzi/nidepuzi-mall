import React, { Component } from 'react';
import { Link } from 'react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'underscore';
import { Header } from 'components/Header';
import { Checkbox } from 'components/Checkbox';
import { Input } from 'components/Input';

const banner = '//og224uhh3.qnssl.com/mall/opening-shop-banner.jpg';

export default class Agreement extends Component {
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
        <Header title="你的铺子会员一元体验条款" leftIcon="icon-angle-left" onLeftBtnClick={this.context.router.goBack} />
        <div className="col-xs-12 col-sm-8 col-sm-offset-2 content">
          <h5 >你的铺子特惠一元体验妈妈条款</h5>
          <p>服务提供方：上海己美网络科技有限公司</p>
          <p>服务享受方：所有支付</p>
          <h5>你的铺子为1元体验妈妈提供以下服务和权利：</h5>
          <p>1. 自开通之日起，享有15天的你的铺子会员数据系统使用权限，并享有正式你的铺子会员会员的推荐奖金，销售佣金，点击返现等权利和收益！</p>
          <p>2. 获得参与你的铺子全国100万妈妈的兼职创业扶持计划，享有开课奖金特权（自写或选用官方提供教材），每节课奖金30元-60元。</p>
          <p>3. 可通过分享带自己专属编号的链接，产生销售即可获得8%-30%佣金。</p>
          <p>4. 在15天的体验期内，所获收益可在升级为正式你的铺子会员会员后选择提现。</p>
          <p>5. 在结束15天的体验后，帐户自动计入15天的冻结状态, 所有佣金和奖金收益将保存于帐户。超过30天后，帐户信息不再保存。</p>
          <p>6. 在法律法规许可范围内，你的铺子保留对1元开店体验活动的最终解释权。</p>
        </div>
      </div>
    );
  }
}
