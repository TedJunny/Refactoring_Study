// class Order {
//   constructor(data) {
//     this._number = data.number;
//     this._customer = new Customer(data.customer); //customer가 고객 id
//   }
//   get customer() {
//     return this._customer;
//   }
// }

class Customer {
  constructor(id) {
    this._id = id;
  }
  get id() {
    return this._id;
  }
}

//1. 항상 물리적으로 똑같은 고객 객체를 사용하고 싶다면 먼저 이 유일한 객체를 저장해둘 곳을 만들어야 함.
let _repositoryData;

export function initialize() {
  _repositoryData = {};
  _repositoryData.customers = new Map();
}
initialize();

export function registerCustomer(id) {
  if (!_repositoryData.customers.has(id)) _repositoryData.customers.set(id, new Customer(id));
  return findCustomer(id);
}

export function findCustomer(id) {
  return _repositoryData.customers.get(id);
}

// 2. 올바른 고객 객체를 얻어오는 방법 찾기 + 3. 수정
class Order {
  constructor(data) {
    this._number = data.number;
    this._customer = registerCustomer(data.customer); //customer가 고객 id
  }
  get customer() {
    return this._customer;
  }
}

const order = new Order({ number: '1', customer: 111 });
const order2 = new Order({ number: '2', customer: 111 });
console.log(order.customer);
console.log(order2.customer);
console.log(order.customer === order2.customer); // true
