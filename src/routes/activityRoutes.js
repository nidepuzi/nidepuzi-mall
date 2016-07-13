import React from 'react';
import { Route, IndexRoute } from 'react-router';
import * as utils from 'utils';

import {
  TopTen,
  A20160701,
  ExamHome,
  ExamQuestion,
  ExamResult,
  OpeningShop,
} from 'containers/Activity';

export default (
  <Route>
    <Route path="/activity/20160701" component={A20160701} />
    <Route path="/activity/topTen" component={TopTen} />
    <Route path="/activity/exam" component={ExamHome} onEnter={utils.checkAuth} />
    <Route path="/activity/exam/question/:type/:id" component={ExamQuestion} onEnter={utils.checkAuth} />
    <Route path="/activity/exam/result" component={ExamResult} onEnter={utils.checkAuth} />
    <Route path="/activity/shop/open" component={OpeningShop} onEnter={utils.checkAuth} />
  </Route>
);
