import BaseModel from './BaseModel';

export default class TrackOrderDetailsModel extends BaseModel {
  /**
   * TrackOrderDetailsModel Model
   * @param {String} orderId
   * @param {String} merchantOrderId
   * @param {String} orderDate
   * @param {String} orderStatus
   * @param {<DetailsShippingModel>} shipping
   * @param {<DetailsBillingModel>} billing
   * @param {<OrderSummaryModel>} orderSummary
   * @param {<OrderItemModel[]>} items
   *
   */

  constructor(ds) {
    super();
    this.orderId = ds.orderId;
    this.merchantOrderId = ds.merchantOrderId;
    this.orderDate = ds.orderDate;
    this.orderStatus = ds.orderStatus;
    this.shipping = ds.shipping;
    this.billing = ds.billing;
    this.orderSummary = ds.orderSummary;
    this.items = ds.items;
  }
}
