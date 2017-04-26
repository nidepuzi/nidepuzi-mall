import * as constants from 'constants';
import axios from 'axios';
import qs from 'qs';
import createAction from '../createAction';

export const names = {
  FETCH_SHOP_BAG: 'FETCH_SHOP_BAG',
  FETCH_SHOP_BAG_HISTORY: 'FETCH_SHOP_BAG_HISTORY',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  REBUY_HISTORY_PRODUCT: 'REBUY_HISTORY_PRODUCT',
  ADD_PRODUCT_TO_SHOP_BAG: 'ADD_PRODUCT_TO_SHOP_BAG',
  FETCH_SHOP_BAG_QUANTITY: 'FETCH_SHOP_BAG_QUANTITY',
};

/**
* @type 商品类型；0：普通，3:团购, 5:精品汇商品, 6:精品券
**/
export const fetchShopBag = (type = 0) => {
  const action = createAction(names.FETCH_SHOP_BAG);
  return (dispatch) => {
    dispatch(action.request());
    return axios.get(constants.baseEndpoint + 'carts', { params: { type: type } })
      .then((resp) => {
        dispatch(action.success(resp.data));
      })
      .catch((resp) => {
        dispatch(action.failure(resp));
      });
  };
};

export const fetchShopBagHistory = (type = 0) => {
  const action = createAction(names.FETCH_SHOP_BAG_HISTORY);
  return (dispatch) => {
    dispatch(action.request());
    return axios.get(constants.baseEndpoint + 'carts/show_carts_history', { params: { type: type } })
      .then((resp) => {
        dispatch(action.success(resp.data));
      })
      .catch((resp) => {
        dispatch(action.failure(resp));
      });
  };
};

/**
 * @id number
 * @action 增加：plus_product_carts 减少: minus_product_carts
 *
 */
export const updateQuantity = (id, requestAction, type) => {
  const action = createAction(names.UPDATE_QUANTITY);
  return (dispatch) => {
    dispatch(action.request());
    return axios.post(constants.baseEndpoint + 'carts/' + id + '/' + requestAction)
      .then((resp) => {
        dispatch(action.success(resp.data));
        if (resp.data.code === 0) {
          dispatch(fetchShopBag(type));
          dispatch(fetchShopBagHistory(type));
        }
      })
      .catch((resp) => {
        dispatch(action.failure(resp));
      });
  };
};

export const fetchShopBagQuantity = (type = 0) => {
  const action = createAction(names.FETCH_SHOP_BAG_QUANTITY);
  return (dispatch) => {
    dispatch(action.request());
    return axios.get(constants.baseEndpoint + 'carts/show_carts_num?type=' + type)
      .then((resp) => {
        dispatch(action.success(resp.data));
      })
      .catch((resp) => {
        dispatch(action.failure(resp));
      });
  };
};

export const rebuy = (itemId, skuId, cartId, type) => {
  const action = createAction(names.REBUY_HISTORY_PRODUCT);
  return (dispatch) => {
    dispatch(action.request());
    return axios.post(constants.baseEndpoint + 'carts', qs.stringify({ item_id: itemId, sku_id: skuId, cart_id: cartId, type: type }))
      .then((resp) => {
        if (resp.data.code === 0) {
          dispatch(fetchShopBag(type));
          dispatch(fetchShopBagHistory(type));
        }
        dispatch(action.success(resp.data));
      })
      .catch((resp) => {
        dispatch(action.failure(resp));
      });
  };
};

export const addProductToShopBag = (productId, skuId, num, type) => {
  const action = createAction(names.ADD_PRODUCT_TO_SHOP_BAG);
  return (dispatch) => {
    dispatch(action.request());
    return axios.post(constants.baseEndpoint + 'carts', qs.stringify({ item_id: productId, sku_id: skuId, num: num, type: type }))
      .then((resp) => {
        dispatch(action.success(resp.data));
        if (resp.data.code === 0) {
          dispatch(fetchShopBagQuantity(type));
          dispatch(fetchShopBag(type));
        }
      })
      .catch((resp) => {
        dispatch(action.failure(resp));
      });
  };
};

export const resetAddProductToShopBag = () => {
  const action = createAction(names.ADD_PRODUCT_TO_SHOP_BAG);
  return (dispatch) => {
    dispatch(action.request());
  };
};
