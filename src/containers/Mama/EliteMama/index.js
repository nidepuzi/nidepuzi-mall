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
import * as mamaInfoAction from 'actions/mama/mamaInfo';

const actionCreators = _.extend(mamaInfoAction);

@connect(
  state => ({
    mamaInfo: state.mamaInfo,
  }),
  dispatch => bindActionCreators(actionCreators, dispatch),
)
export default class EliteMama extends Component {
  static propTypes = {
    children: React.PropTypes.array,
    dispatch: React.PropTypes.func,
    fetchMamaInfo: React.PropTypes.func,
    mamaInfo: React.PropTypes.any,
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
    this.props.fetchMamaInfo();
  }

  componentDidMount() {

  }

  componentWillReceiveProps(nextProps) {
    const mamaInfo = nextProps.mamaInfo.mamaInfo;
    if (nextProps.isLoading) {
      utils.ui.loadingSpinner.show();
    } else if (!nextProps.isLoading) {
      utils.ui.loadingSpinner.hide();
    }

  }

  componentWillUnmount() {

  }

  onLeftBtnClick = (e) => {
    /* if (utils.detector.isApp()) {
      plugins.invoke({
        method: 'callNativeBack',
      });
      return;
    }*/
    this.context.router.goBack();
  }

  render() {
    const { topTab } = this.state;
    const mamaInfo = this.props.mamaInfo.mamaInfo;

    return (
      <div className="home-root">
        <Header title="精品汇" leftIcon="icon-angle-left" onLeftBtnClick={this.onLeftBtnClick} />
        <div className="container" id="id-container">
        <h3>你的铺子｜加入精英妈妈精品汇！</h3>
          <div className="sub-title">
            <div className="sub-title-box left"><p>2016-10-16 你的铺子</p></div>
          </div>
          <div className="list-group">
            <a href="#" className="list-group-item" style={{ color: '#FF1493' }}><b>1. 什么是精品汇？</b></a>
            <a href="#" className="list-group-item">买手精心挑选的好产品（线下知名连锁门店供货），配备精致的服务（24小时内顺丰、或者三通一达发货），并有精美的外包装（送礼首选）。让客户有良好的购物体验和信任感！</a>
          </div>
          <div className="list-group">
            <a href="#" className="list-group-item" style={{ color: '#FF1493' }}><b>2. 精品汇意味着高佣金吗？</b></a>
            <a href="#" className="list-group-item">YES。 <br/><br/>每件精品汇的商品售出，<b>佣金在10元～200元！</b></a>
          </div>
          <div className="list-group">
            <a href="#" className="list-group-item" style={{ color: '#FF1493' }}><b>3. 谁可以销售精品汇商品？</b></a>
            <a href="#" className="list-group-item">只有<b>精英妈妈</b>才可销售精品汇商品。精英妈妈有权使用精品券购买精品汇商品（精品汇商品不可直接支付）。</a>
          </div>
          <div className="list-group">
            <a href="#" className="list-group-item" style={{ color: '#FF1493' }}><b>4. 什么是精品券？</b></a>
            <a href="#" className="list-group-item">精品汇商品，<b>只能使用精品券购买！</b>而精品券，只有精英妈妈可以使用和流通。下属妈妈的精品券，须通过上属妈妈发放。<br/><br/>普通用户购买，需通过精英妈妈代下单（无跑单问题）。</a>
          </div>
          <div className="list-group">
            <a href="#" className="list-group-item" style={{ color: '#FF1493' }}><b>5. 如何成为精英妈妈？</b></a>
            <a href="#" className="list-group-item">精英妈妈实行邀请制，第一批精英妈妈在现有你的铺子会员群体中由系统评估并邀请产生。<br/><br/>若您想要成为精英妈妈，请联系您的上属妈妈，或者关注你的铺子公众号直接联系管理员。</a>
          </div>
          <div className="list-group">
            <a href="#" className="list-group-item" style={{ color: '#FF1493' }}><b>6. 精品汇将带来何种变革？</b></a>
            <a href="#" className="list-group-item">小鹿精品汇，将为精英妈妈的客户带来极致的用户体验和信任！为妈妈们赢得更多的回头客和好口碑！<br/><br/>基于提升妈妈收益的初衷，精品汇将大幅提升妈妈的收益，预计将会提升10倍以上。</a>
          </div>
          <div className="list-group">
            <a href="#" className="list-group-item" style={{ color: '#FF1493' }}><b>7. 其他问题？</b></a>
            <a href="#" className="list-group-item">请关注你的铺子公众号联系管理员或上属妈妈咨询。</a>
          </div>
        </div>
      </div>
    );
  }
}
