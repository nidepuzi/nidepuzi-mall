import * as pointLogAction from 'actions/user/pointLog';
import * as actionTypes from 'actions/actionTypes';
import _ from 'underscore';

const initState = {
  isLoading: false,
  error: false,
  success: false,
  data: {},
};

export default (state = initState, action = null) => {
  switch (action.type) {
    case pointLogAction.names.FETCH_POINT_LOGS + '_' + actionTypes.REQUEST:
      return _.extend({}, state, { isLoading: true, success: false, error: false });
    case pointLogAction.names.FETCH_POINT_LOGS + '_' + actionTypes.SUCCESS:
      const payload = action.payload;
      payload.results = _.chain(state.data && state.data.results || []).union(payload.results || []).unique('id').value();
      return _.extend({}, state, { isLoading: false, data: payload, success: true, error: false, status: action.status });
    case pointLogAction.names.FETCH_POINT_LOGS + '_' + actionTypes.FAILURE:
      return _.extend({}, state, { isLoading: false, data: action.payload, success: false, error: true, status: action.status });
    case pointLogAction.names.FETCH_POINT_LOGS + '_' + actionTypes.RESET:
      return _.extend({}, state, { isLoading: false, data: {}, success: false, error: false, status: action.status });
    default:
      return state;
  }

};
