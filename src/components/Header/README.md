## API

### Header

| 参数              | 说明                                     | 类型        |  可选值 |默认值   |
|------------------|------------------------------------------|------------|-------|--------|
|title             |                                          | string     |       |        |
|leftIcon          |                                          | string     |       |        |
|rightIcon         |                                          | string     |       |        |
|leftText          |                                          | string     |       |        |
|rightText         |                                          | string     |       |        |
|dispatch          |                                          | func       |       |        |
|onLeftBtnClick    |                                          | func       |       |        |
|onRightBtnClick   |                                          | func       |       |        |
|leftBtnPressed    |                                          | bool       |       |        |
|rightBtnPressed   |                                          | bool       |       |        |

### Demo

````jsx
onRightBtnClick = (e) => {
  this.setState({ leftBtnPressed: !this.state.leftBtnPressed })  
}

<Header title="你的铺子" leftIcon="icon-bars" onLeftBtnClick={this.onMenuBtnClick} rightText="测试" onRightBtnClick={this.onRightBtnClick} leftBtnPressed={this.state.leftBtnPressed} />
````