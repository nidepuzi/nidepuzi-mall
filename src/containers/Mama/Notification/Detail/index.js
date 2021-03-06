import React, { Component } from 'react';
import { Header } from 'components/Header';
import * as utils from 'utils';

import './index.scss';

export default class Detail extends Component {
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
        <Header title="通知详情" leftIcon="icon-angle-left" onLeftBtnClick={this.context.router.goBack} hide={utils.detector.isApp()}/>
        <div className="content notification-detail-container">
          <p>{decodeURIComponent(content)}</p>
        </div>
      </div>
    );
  }
}
