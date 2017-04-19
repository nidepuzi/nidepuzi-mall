export const baseUrl = '//m.nidepuzi.com';

export const baseEndpoint = '/rest/v2/';

export const baseEndpointV1 = '/rest/v1/';

export const offset = 250;

export const image = {
  imageUrl: '//img.nidepuzi.com',
  square: '?imageMogr2/thumbnail/200/format/jpg/quality/90/crop/200x200',
};

export const couponStatus = {
  available: 0,
  used: 1,
  unavailable: 2,
  expired: 3,
  selected: 4,
  negotiable: 5,
};

export const forum = {
  forumUrl: '//forum.nidepuzi.com/accounts/xlmm/login/',
};

export const shareType = {
  product: 'model',
  shop: 'shop',
};

export const paymentResults = {
  success: '/mall/order/success',
  error: '/mall/ol.html?type=1&paid=false',
};

export const tradeOperations = {
  1: { tag: '立即支付', action: 'pay' }, // 1: 待付款
  2: { tag: '提醒发货', action: 'remind' }, // 2: 已付款
};

export const gaPayTypes = {
  alipay_wap: 'Alipay',
  wx_pub: 'Wechat Wallet',
  budget: 'Xiaolu Wallet',
};

export const payTypeIcons = {
  wx_pub: 'icon-wechat-pay icon-wechat-green',
  alipay_wap: 'icon-alipay-square icon-alipay-blue',
};

export const downloadAppUri = '/sale/promotion/appdownload/';

export const disabledDownloadApp = [
  'activity/summer/mat/home',
  'activity/summer/mat/success',
  'activity/summer/mat/register',
  'order/redpacket',
  'mct.html',
  'mcf.html',
  'mama/agreement',
  'mama/open/succeed',
  'mama/open/failed',
  'mama/invited',
];

export const minBuyScore = 30;
export const restrictAssociateBuyScore = false;

export const transferTypes = [
  '退券',
  '转给下属',
  '买货',
  '买券',
  '下属退券',
  '退货退券',
  '系统赠送',
  '兑换订单',
  '充值',
  '用币买券',
  '退券换币',
  '取消兑换',
];
