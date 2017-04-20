import React, { Component } from 'react';

import './index.scss';

export class Footer extends Component {
  static propTypes = {
    children: React.PropTypes.any,
  };

  render() {
    return (
      <footer className="text-center clearfix font-xxs footer">
        <p>Copyright © 2017-2018 你的铺子，All Rights Reserved</p>
        <p> 沪ICP备17016131号-1</p>
      </footer>
    );
  }
}
