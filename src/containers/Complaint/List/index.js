import React, { Component } from 'react';
import { Link } from 'react-router';
import { bindActionCreators } from 'redux';
import classnames from 'classnames';
import _ from 'underscore';
import { If } from 'jsx-control-statements';
import * as utils from 'utils';
import * as plugins from 'plugins';
import { connect } from 'react-redux';
import { Header } from 'components/Header';
import { Footer } from 'components/Footer';
import { Toast } from 'components/Toast';
import { Image } from 'components/Image';
import * as complaintListAction from 'actions/complaint/list';
import * as userProfileAction from 'actions/user/profile';

import './index.scss';

const actionCreators = _.extend(complaintListAction, userProfileAction);

@connect(
  state => ({
    complaint: state.complaintHistory,
    profile: state.profile,
  }),
  dispatch => bindActionCreators(actionCreators, dispatch),
)

export default class List extends Component {
  static propTypes = {
    children: React.PropTypes.array,
    dispatch: React.PropTypes.func,
    isLoading: React.PropTypes.bool,
    complaint: React.PropTypes.any,
    profile: React.PropTypes.any,
    error: React.PropTypes.bool,
    fetchComplaints: React.PropTypes.func,
    fetchProfile: React.PropTypes.func,
  };

  static contextTypes = {
    router: React.PropTypes.object,
  };

  constructor(props, context) {
    super(props);
    context.router;
  }

  state = {
    pageIndex: 0,
    pageSize: 20,
    hasMore: true,
  }

  componentWillMount() {
    const { pageIndex, pageSize } = this.state;
    this.props.fetchComplaints(pageIndex + 1, pageSize);
    if (_.isEmpty(this.props.profile.data)) {
      this.props.fetchProfile();
    }
  }

  componentDidMount() {
    this.addScrollListener();
  }

  componentWillReceiveProps(nextProps) {
    const { pageIndex, pageSize } = this.state;
    if (nextProps.complaint.success) {
      const count = nextProps.complaint.data.count;
      const size = nextProps.complaint.data.results.length;
      this.setState({ pageIndex: Math.round(size / this.state.pageSize), hasMore: count > size });
    }
    if (nextProps.complaint.isLoading || nextProps.profile.isLoading) {
      utils.ui.loadingSpinner.show();
    } else {
      utils.ui.loadingSpinner.hide();
    }
  }

  componentWillUnmount() {
    this.removeScrollListener();
  }

  onScroll = (e) => {
    const { pageSize, pageIndex } = this.state;
    const scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
    const documentHeight = utils.dom.documnetHeight();
    const windowHeight = utils.dom.windowHeight();
    if (scrollTop === documentHeight - windowHeight && !this.props.isLoading && this.state.hasMore) {
      this.props.fetchComplaints(pageIndex + 1, pageSize);
    }
  }

  onLeftBtnClick = (e) => {
    if (utils.detector.isApp()) {
      plugins.invoke({
        method: 'callNativeBack',
      });
      return;
    }
    this.context.router.goBack();
  }

  addScrollListener = () => {
    window.addEventListener('scroll', this.onScroll);
  }

  removeScrollListener = () => {
    window.removeEventListener('scroll', this.onScroll);
  }

  render() {
    const data = this.props.complaint.data && this.props.complaint.data.results || [];
    const profileData = this.props.profile.data && this.props.profile.data || [];
    return (
      <div>
        <Header title="历史记录" leftIcon="icon-angle-left" onLeftBtnClick={this.onLeftBtnClick}/>
        <div className="content">
          <ul className="complaint-reply-list">
            {data.map((complaint) => {
              if (complaint.com_content) {
                return (
                  <li className="row no-margin margin-bottom-xs" key={complaint.id}>
                    <div className="col-xs-12 padding-top-xxs">
                      <div className="col-xs-2 no-padding">
                      <Image src={profileData.thumbnail}/>
                      </div>
                      <div className="col-xs-10 no-padding">
                        <p className="no-margin font-md">{profileData.nick && profileData.nick || '你的铺子会员'}</p>
                        <p className="no-margin font-xs font-grey-light">{complaint.created_time}</p>
                      </div>
                      <p className="col-xs-12 no-margin no-padding padding-top-xxs padding-bottom-xxs font-md text-left text-range">{complaint.com_content}</p>
                    </div>
                    <If condition={complaint.reply}>
                      <div className="col-xs-11 col-xs-offset-1 reply-content">
                        <p className="no-margin padding-top-xxs">
                          <span className="font-md padding-right-xs">你的铺子</span>
                          <span className="no-margin no-padding font-xs font-grey-light">{complaint.created_time}</span>
                        </p>
                        <p className="col-xs-12 no-margin no-padding padding-top-xxs padding-bottom-xxs font-md text-left text-range">{complaint.reply}</p>
                      </div>
                    </If>
                  </li>
                );
              }
            })}
          </ul>
          <Footer/>
        </div>
      </div>
    );
  }
}
