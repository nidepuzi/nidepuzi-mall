import * as constants from 'constants';
import axios from 'axios';
import createAction from 'actions/createAction';
import qs from 'qs';

export const name = 'FETCH_COURSE';

export const fetchCourse = (pageIndex, pageSize, lessonType, orderingBy) => {
  const action = createAction(name);
  return (dispatch) => {
    dispatch(action.request());
    return axios.get(constants.baseEndpointV1 + 'lesson/lessontopic', { params: { page: pageIndex, page_size: pageSize, lesson_type: lessonType, ordering: orderingBy } })
      .then((resp) => {
        dispatch(action.success(resp.data));
      })
      .catch((resp) => {
        dispatch(action.failure(resp));
      });
  };
};

export const resetCourse = () => {
  const action = createAction(name);
  return (dispatch) => {
    dispatch(action.reset());
  };
};
