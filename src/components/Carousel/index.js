import React, { Component, PropTypes } from 'react';
import _ from 'underscore';
import Swipe from 'swipe-js-iso';

import './index.scss';

export class Carousel extends Component {
  static propTypes = {
    children: React.PropTypes.any,
    id: React.PropTypes.string,
    swipeOptions: React.PropTypes.any,
  };

  static defaultProps = {
    swipeOptions: {
      startSlide: 0,
      speed: 400,
      auto: 3000,
      continuous: true,
      disableScroll: false,
      stopPropagation: false,
    },
  };

  componentDidMount() {
    const self = this;
    let { swipeOptions } = this.props;
    swipeOptions = _.extend({}, swipeOptions, { transitionEnd: this.setActive });
    // Must be delayed 700 ms, otherwise it will not correctly load component
    _.delay(() => {
      self.swipe = new Swipe(this.refs.carousel, swipeOptions);
    }, 700);
  }

  componentWillUnmount() {
    this.swipe && this.swipe.kill();
    this.swipe = null;
  }

  setActive = (index, el) => {

  }

  getPos() {
    return this.swipe.getPos();
  }

  getNumSlides() {
    return this.swipe.getNumSlides();
  }

  next() {
    this.swipe.next();
  }

  prev() {
    this.swipe.prev();
  }

  slide(...args) {
    this.swipe.slide(...args);
  }

  render() {
    const { children, id } = this.props;
    return (
      <div ref="carousel" id={id} className="carousel">
        <div className="carousel-wrap">
          {React.Children.map(children, child => {
            return React.cloneElement(child, { className: 'carousel-item' });
          })}
        </div>
      </div>
    );
  }
}
