import React, { Component } from 'react';
import { Header } from 'components/Header';

export default class Introduce extends Component {
  static propTypes = {
    children: React.PropTypes.array,
    location: React.PropTypes.object,
  };

  static contextTypes = {
    router: React.PropTypes.object,
  };

  constructor(props, context) {
    super(props);
    context.router;
  }

  render() {
    const { content } = this.props.location.query;
    return (
      <div>
        <Header title="我的团队" leftIcon="icon-angle-left" onLeftBtnClick={this.context.router.goBack}/>
        <div className="content notification-detail-container">
          <p>
          <span>
            如何拥有自己的团队？<br/><br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;通过“邀请开店”，分享加入代理邀请链接给您的好友，被邀请者点击链接验证手机后支付成功后，该用户就成为您的下属代理，并成为您代理团队中的一员。有下面3种方式发展新的团队成员<br/><br/>
            1.付188元一年平台使用费是正式会员<br/>
            2.付1元的是1元体验你的铺子会员（在1元开店创业大赛活动期间）<br/>
            3.你的1元代理妈妈续费转正成为99元半年妈妈或188元1年的正式会员妈妈<br/><br/>
            你的团队人员范围是如何计算的？<br/><br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;你下面直接1级你的铺子会员和她们下面1级的你的铺子会员都算是你的团队成员<br/><br/>
            团队有什么作用？<br/><br/>
          </span>
          <span className="font-red">
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;被邀请者成功缴费成为您的下属代理后，只要获得订单佣金，您就可以获得相应的下属订单提成。可以获得对应每周激励团队奖金！下级订单提成比率为下级订单佣金的20%
          </span>
          </p>
        </div>
      </div>
    );
  }
}
