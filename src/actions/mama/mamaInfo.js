import * as constants from 'constants';
import axios from 'axios';
import createAction from '../createAction';
import qs from 'qs';

export const mamaInfoNames = {
  FETCH_MAMA_INFO: 'FETCH_MAMA_INFO',
  FETCH_MAMA_INFO_BY_ID: 'FETCH_MAMA_INFO_BY_ID',
  SAVE_MAMA_INFO: 'SAVE_MAMA_INFO',
};

export const fetchMamaInfo = () => {
  const action = createAction(mamaInfoNames.FETCH_MAMA_INFO);
  return (dispatch) => {
    dispatch(action.request());
    return axios.get(`${constants.baseEndpointV1}pmt/xlmm`)
      .then((resp) => {
        dispatch(action.success(resp.data));
      })
      .catch((resp) => {
        dispatch(action.failure(resp));
      });
  };
};

export const fetchMamaInfoById = (mamaId) => {
  const action = createAction(mamaInfoNames.FETCH_MAMA_INFO_BY_ID);
  return (dispatch) => {
    dispatch(action.request());
    return axios.get(`${constants.baseEndpointV1}pmt/xlmm/${mamaId}/base_info`)
      .then((resp) => {
        dispatch(action.success(resp.data));
      })
      .catch((resp) => {
        dispatch(action.failure(resp));
      });
  };
};

// 新建一个你的铺子会员信息
export const saveMamaInfo = (params) => {
  const action = createAction(mamaInfoNames.SAVE_MAMA_INFO);
  return (dispatch) => {
    dispatch(action.request());
    return axios.post(`${constants.baseEndpointV1}pmt/xlmm/fill_mama_info`, qs.stringify(params))
      .then((resp) => {
        dispatch(action.success(resp.data));
      })
      .catch((resp) => {
        dispatch(action.failure(resp));
      });
  };
};
