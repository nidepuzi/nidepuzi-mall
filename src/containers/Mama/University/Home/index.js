import React, { Component } from 'react';
import { Link } from 'react-router';
import { bindActionCreators } from 'redux';
import _ from 'underscore';
import * as utils from 'utils';
import * as plugins from 'plugins';
import { If } from 'jsx-control-statements';
import { connect } from 'react-redux';
import { Header } from 'components/Header';
import { Loader } from 'components/Loader';
import { Image } from 'components/Image';
import * as activityAction from 'actions/mama/activity';
import * as courseAction from 'actions/mama/course';

import './index.scss';

const actionCreators = _.extend(activityAction, courseAction);

@connect(
  state => ({
    mamaActivity: state.mamaActivity,
    mamaCourse: state.mamaCourse,
  }),
  dispatch => bindActionCreators(actionCreators, dispatch),
)
export default class List extends Component {
  static propTypes = {
    children: React.PropTypes.array,
    dispatch: React.PropTypes.func,
    isLoading: React.PropTypes.bool,
    error: React.PropTypes.bool,
    mamaActivity: React.PropTypes.any,
    mamaCourse: React.PropTypes.any,
    fetchActivity: React.PropTypes.func,
    fetchCourse: React.PropTypes.func,
    resetCourse: React.PropTypes.func,
    readCourse: React.PropTypes.func,
  };

  static contextTypes = {
    router: React.PropTypes.object,
  };

  constructor(props, context) {
    super(props);
    context.router;
  }

  state = {
    pageIndex: 1,
    pageSize: 20,
    sticky: false,
    hasMore: false,
    topTab: 'hot',
    bottomTab: 'course',
    lessonType: '',
    orderingBy: 'num_attender',
  }

  componentWillMount() {
    const { pageIndex, pageSize, lessonType, orderingBy } = this.state;
    this.props.fetchCourse(pageIndex, pageSize, lessonType, orderingBy);
  }

  componentDidMount() {
    this.addScrollListener();
  }

  componentWillReceiveProps(nextProps) {
    const { mamaActivity, mamaCourse } = nextProps;
    const { fetchCourse, readCourse } = mamaCourse;
    if (mamaActivity.isLoading || fetchCourse.isLoading || readCourse.isLoading) {
      utils.ui.loadingSpinner.show();
    } else {
      utils.ui.loadingSpinner.hide();
    }
    if (fetchCourse.success) {
      const count = fetchCourse.data.count;
      const size = fetchCourse.data.results.length;
      this.setState({ pageIndex: Math.round(size / this.state.pageSize) });
      this.setState({ hasMore: count > size });
    }
  }

  componentWillUnmount() {
    this.removeScrollListener();
  }

  onScroll = (e) => {
    const { pageIndex, pageSize, lessonType, orderingBy, activeTab, sticky, bottomTab } = this.state;
    const scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
    const documentHeight = utils.dom.documnetHeight();
    const windowHeight = utils.dom.windowHeight();
    let courseTabOffsetTop = 0;
    if (scrollTop === documentHeight - windowHeight && !this.props.mamaCourse.fetchCourse.isLoading && this.state.hasMore) {
      this.props.fetchCourse(pageIndex + 1, pageSize, lessonType, orderingBy);
    }
    if (bottomTab === 'course') {
      courseTabOffsetTop = utils.dom.offsetTop('.course-tab');
    }
    if (scrollTop > courseTabOffsetTop) {
      this.setState({ sticky: true });
    } else {
      this.setState({ sticky: false });
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

  onTabClick = (e) => {
    const { pageIndex, pageSize, lessonType, orderingBy } = this.state;
    const { id, type } = e.currentTarget.dataset;
    if (type === 'course') {
      this.props.resetCourse();
      switch (id) {
        case 'newb':
          this.setState({
            topTab: id,
            lessonType: 3,
            orderingBy: '',
          });
          this.props.fetchCourse(1, pageSize, 3, '');
          break;
        case 'hot':
          this.setState({
            topTab: id,
            lessonType: '',
            orderingBy: 'num_attender',
          });
          this.props.fetchCourse(1, pageSize, '', 'num_attender,-order_weight');
          break;
        case 'newest':
          this.setState({
            topTab: id,
            lessonType: '',
            orderingBy: 'created',
          });
          this.props.fetchCourse(1, pageSize, '', 'created');
          break;
        default:
      }
    }
    if (type === 'base') {
      this.setState({
        bottomTab: id,
      });
    }
    switch (id) {
      case 'course':
        this.props.fetchCourse(1, pageSize, 3, '');
        break;
      case 'activity':
        this.props.fetchActivity();
        break;
      default:
    }
    e.preventDefault();
  }

  onCourseItemClick = (e) => {
    const { id, to } = e.currentTarget.dataset;
    const appUrl = `com.jimei.xlmm://app/v1/webview?is_native=1&url=${to}`;
    this.props.readCourse(id);
    if (utils.detector.isAndroid() && typeof window.AndroidBridge !== 'undefined') {
      window.AndroidBridge.jumpToNativeLocation(appUrl);
      return;
    }
    if (utils.detector.isIOS()) {
      plugins.invoke({
        method: 'jumpToNativeLocation',
        data: { target_url: appUrl },
        callback: (resp) => {},
      });
      return;
    }
    e.preventDefault();
  }

  addScrollListener = () => {
    window.addEventListener('scroll', this.onScroll);
  }

  removeScrollListener = () => {
    window.removeEventListener('scroll', this.onScroll);
  }

  renderActivities(activities) {
    return (
      <ul className="margin-bottom-lg">
        {activities.map((activity, index) => {
          return (
            <a href={activity.act_link} key={activity.id}>
              <li className="row no-margin margin-top-xs">
                <Image className="col-xs-12 no-padding" src={activity.act_img} key={index}/>
                <p className="col-xs-12 no-margin no-padding padding-top-xs padding-bottom-xs content-white-bg">
                  <span className="col-xs-8 text-left no-wrap">{activity.title}</span>
                  <span className="col-xs-4 text-right font-orange">{activity.total_member_num + '人参与'}</span>
                </p>
              </li>
            </a>
          );
        })}
      </ul>
    );
  }

  renderCourses(courses) {
    return (
      <ul className="course-list">
        {courses.map((course, index) => {
          return (
            <li className="row no-margin bottom-border content-white-bg" data-id={course.id} data-to={course.content_link} onClick={this.onCourseItemClick}>
              <div className="col-xs-4">
                <Image className="col-xs-12 no-padding" src={course.cover_image || '//og224uhh3.qnssl.com/mall/university/v1/banner.png'}/>
              </div>
              <div className="col-xs-8">
                <p className="col-xs-12 no-margin no-padding no-wrap padding-top-xxs">{course.title}</p>
                <p className="col-xs-12 no-margin no-padding padding-top-xxs font-xxs font-grey-light">
                  <span className="col-xs-7 no-padding text-left no-wrap">{course.click_num_show + '人阅读'}</span>
                  <span className="col-xs-5 no-padding text-right">你的铺子</span>
                </p>
              </div>
            </li>
        );})}
      </ul>
    );
  }

  render() {
    const { topTab, bottomTab, sticky } = this.state;
    const activityData = this.props.mamaActivity.data || [];
    const courseData = this.props.mamaCourse.fetchCourse.data && this.props.mamaCourse.fetchCourse.data.results || [];
    const hasHeader = !utils.detector.isApp();
    return (
      <div>
        <Header title="教程" leftIcon="icon-angle-left" onLeftBtnClick={this.onLeftBtnClick}/>
        <div className="content university-container">
          <If condition={bottomTab === 'activity'}>
            <div className="activity-container">
              <If condition={!_.isEmpty(activityData)}>
               {this.renderActivities(activityData)}
              </If>
            </div>
          </If>
          <If condition={bottomTab === 'course'}>
            <div className="margin-bottom-lg course-container">
              <div className="row no-margin">
                <img src="//og224uhh3.qnssl.com/mall/university/v1/banner.png"/>
              </div>
              <div className={'text-center bottom-border course-tab ' + (sticky ? 'sticky ' : '') + (hasHeader ? 'has-header' : '')}>
                <ul className="row no-margin">
                  <li key={1} data-type="course" data-id="newb" onClick={this.onTabClick}>
                    <p className={'col-xs-4 no-margin no-padding' + (topTab === 'newb' ? ' active' : '')}>
                      <span>新人</span>
                    </p>
                  </li>
                  <li key={2} data-type="course" data-id="hot" onClick={this.onTabClick}>
                    <p className={'col-xs-4 no-margin no-padding' + (topTab === 'hot' ? ' active' : '')}>
                      <span>热门</span>
                    </p>
                  </li>
                  <li key={3} data-type="course" data-id="newest" onClick={this.onTabClick}>
                    <p className={'col-xs-4 no-margin no-padding' + (topTab === 'newest' ? ' active' : '')}>
                      <span>最新</span>
                    </p>
                  </li>
                </ul>
              </div>
              <If condition={!_.isEmpty(courseData)}>
                {this.renderCourses(courseData)}
              </If>
            </div>
          </If>
          <div className="row no-margin top-border base-tab">
            <ul className="row no-margin">
              <li key={1} data-type="base" data-id="course" onClick={this.onTabClick}>
                <div className={'col-xs-6 no-margin' + (bottomTab === 'course' ? ' active' : '')}>
                  <i className="col-xs-4 text-right icon-course"></i>
                  <p className="no-margin padding-left-xxs padding-top-xxs">课堂知识</p>
                </div>
              </li>
              <li key={2} data-type="base" data-id="activity" onClick={this.onTabClick}>
                <div className={'col-xs-6 no-margin' + (bottomTab === 'activity' ? ' active' : '')}>
                  <i className="col-xs-4 text-right icon-activity"></i>
                  <p className="no-margin padding-left-xxs padding-top-xxs">参加活动</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}
