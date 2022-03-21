class TrackingInformation {
  constructor(data) {
    this._shippingCompany = data.shippingCompany;
    this._trackingNumber = data.trackingNumber;
  }
  get shippingCompany() {
    return this._shippingCompany;
  }
  set shippingCompany(arg) {
    this._shippingCompany = arg;
  }
  get trackingNumber() {
    return this._trackingNumber;
  }
  set trackingNumber(arg) {
    this.__trackingNumber = arg;
  }
  get display() {
    return `${this.shippingCompany}: ${this.trackingNumber}`;
  }
}

class Shipment {
  constructor(data) {
    this._trackingInformation = new TrackingInformation({shippingCompany: data.company, trackingNumber: data.trackingNumber});
  }
  get trackingInformation() {
    return this._trackingInformation;
  }
  set tranckingInformation(aTrackingInformation) {
    this._trackingInformation = aTrackingInformation;
  }
}

const shipment = new Shipment({company: 'MagoInc', trackingNumber: '0012'});
//이처럼 외부에서 직접 호출하는 TrackingInformation의 메서드들을 모두 Shipment로 옮긴다.
//먼저 Shipment에 위임 함수를 만들고 클라이언트가 이를 호출하도록 수정하자.
shipment.trackingInformation.shippingCompany = 'BonInc';

class Shipment2 {
  constructor(data) {
    this._trackingInformation = new TrackingInformation({shippingCompany: data.company, trackingNumber: data.trackingNumber});
  }
  get trackingInformation() {
    return this._trackingInformation;
  }
  set tranckingInformation(aTrackingInformation) {
    this._trackingInformation = aTrackingInformation;
  }

  set shippingCompany(arg) {
    this._trackingInformation.shippingCompany = arg;
  }
}

//클라이언트
const shipment2 = new Shipment2({company: 'MagoInc', trackingNumber: '0012'});
shipment2.shippingCompany = 'BonInc';
//클라이언트에서 사용하는 TranckingInformation의 모든 요소를 이런 식으로 처리한다.
//다 고쳤다면 TrankingInformation의 모든 요소를 Shipment로 옮긴다.

class Shipment3 {
  constructor(data) {
    this._shippingCompany = data.company;
    this._trackingNumber = data.trackingNumber;
  }
  get trackingInfo() {
    return `${this.shippingCompany}: ${this.trackingNumber}`;
  }
  get shippingCompany() {
    return this._shippingCompany;
  }
  set shippingCompany(arg) {
    this._shippingCompany = arg;
  }
  get trackingNumber() {
    return this._trackingNumber;
  }
  set trackingNumber(arg) {
    this._trackingNumber = arg;
  }
}

const shipment3 = new Shipment3({company: 'MagoInc', trackingNumber: '0012'});
shipment3.shippingCompany = 'BonInc';
console.log(shipment3.trackingInfo);
