import * as actionTypes from 'actions/actionTypes';
import _ from 'underscore';
import * as favoriteAction from 'actions/favorite/index';

const initState = {
  fetchfavorite: {
    isLoading: false,
    error: false,
    success: false,
    data: {},
  },
  addFavorite: {
    isLoading: false,
    error: false,
    success: false,
    data: {},
  },
  unFavorite: {
    isLoading: false,
    error: false,
    success: false,
    data: {},
  },
};

export default (state = initState, action = null) => {
  switch (action.type) {
    case favoriteAction.names.FETCH_FAVORITE_LIST + '_' + actionTypes.REQUEST:
      return _.extend({}, state, {
        fetchfavorite: { isLoading: true, data: state.fetchfavorite.data, error: false, success: false },
      });
    case favoriteAction.names.FETCH_FAVORITE_LIST + '_' + actionTypes.SUCCESS:
      const payload = action.payload;
      payload.results = _.chain(state.fetchfavorite.data.results || []).union(payload.results || []).unique('id').value();
      return _.extend({}, state, {
        fetchfavorite: { isLoading: false, data: payload, error: false, success: true },
      });
    case favoriteAction.names.FETCH_FAVORITE_LIST + '_' + actionTypes.FAILURE:
      return _.extend({}, state, {
        fetchfavorite: { isLoading: false, data: action.payload, error: true, success: false },
      });
    case favoriteAction.names.FETCH_FAVORITE_LIST + '_' + actionTypes.RESET:
      return _.extend({}, state, {
        fetchfavorite: { isLoading: false, data: {}, error: false, success: false },
      });

    case favoriteAction.names.ADD_FAVORITE + '_' + actionTypes.REQUEST:
      return _.extend({}, state, {
        addFavorite: { isLoading: true, data: state.addFavorite.data, error: false, success: false },
      });
    case favoriteAction.names.ADD_FAVORITE + '_' + actionTypes.SUCCESS:
      return _.extend({}, state, {
        addFavorite: { isLoading: false, data: action.payload, error: false, success: true },
      });
    case favoriteAction.names.ADD_FAVORITE + '_' + actionTypes.FAILURE:
      return _.extend({}, state, {
        addFavorite: { isLoading: false, data: action.payload, error: true, success: false, status: action.status },
      });
    case favoriteAction.names.ADD_FAVORITE + '_' + actionTypes.RESET:
      return _.extend({}, state, {
        addFavorite: { isLoading: false, data: {}, error: false, success: false },
      });

    case favoriteAction.names.UN_FAVORITE + '_' + actionTypes.REQUEST:
      return _.extend({}, state, {
        unFavorite: { isLoading: true, data: state.unFavorite.data, error: false, success: false },
      });
    case favoriteAction.names.UN_FAVORITE + '_' + actionTypes.SUCCESS:
      return _.extend({}, state, {
        unFavorite: { isLoading: false, data: action.payload, error: false, success: true },
      });
    case favoriteAction.names.UN_FAVORITE + '_' + actionTypes.FAILURE:
      return _.extend({}, state, {
        unFavorite: { isLoading: false, data: action.payload, error: true, success: false, status: action.status },
      });
    case favoriteAction.names.UN_FAVORITE + '_' + actionTypes.RESET:
      return _.extend({}, state, {
        unFavorite: { isLoading: false, data: {}, error: false, success: false },
      });

    default:
      return state;
  }

};
