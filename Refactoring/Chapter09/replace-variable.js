class Test {
  _discountedTotal = 0;
  _discount = 0;

  get discountedTotal() {
    return this._discountedTotal;
  }
  set discount(aNumber) {
    const old = this._discount;
    this._discount = aNumber;
    this._discountedTotal += old - aNumber;
  }

  // get discountedTotal(){
  //     return this._baseTotal - this._discount;
  // }
  // set discount(aNumber){
  //     this._discount = aNumber;
  // }
}

class ProductionPlan1 {
  _production = 0;
  _adjustments = [];

  get production() {
    return this._production;
  }

  applyAdjustment(anAdjustment) {
    this._adjustments.push(anAdjustment);
    this._production += anAdjustment.amount; //applyAdjustment함수에서 이걸 하고있는게 거슬림 + 매번 갱신하지 않고도 계산 가능
  }
}

class ProductionPlan2 {
  _production = 0;
  _adjustments = [];

  /* 추가 */
  get production() {
    console.log(this._production === this.calculatedProduction);
    return this._production;
  }

  /* 추가 */
  get calculatedProduction() {
    return this._adjustments.reduce((sum, a) => sum + a.amount, 0);
  }
  applyAdjustment(anAdjustment) {
    this._adjustments.push(anAdjustment);
    this._production += anAdjustment.amount;
  }
}

const test = new ProductionPlan2();

// test.applyAdjustment({ amount: 10 });
// console.log(test.production);

class ProductionPlan3 {
  // _production = 0; => 파생변수 제거?
  _adjustments = [];

  get production() {
    //   console.log(this._production === this.calculatedProduction);
    return this._adjustments.reduce((sum, a) => sum + a.amount, 0);
  }

  // get calculatedProduction() {
  //   return this._adjustments.reduce((sum, a) => sum + a.amount, 0);
  // }
  applyAdjustment(anAdjustment) {
    this._adjustments.push(anAdjustment);
    //   this._production += anAdjustment.amount;
  }
}

// const test2 = new ProductionPlan3();

// test2.applyAdjustment({ amount: 10 });
// console.log(test2.production);

//source가 2이상일 때
class ProductionPlan4 {
  constructor(production) {
    this._production = production;
    this._adjustments = [];
  }

  get production() {
    //_production의 초깃값이 0이 아닌 경우 실패하는 어서션
    console.log(this._production === this.calculatedProduction);
    return this._production;
  }

  get calculatedProduction() {
    return this._adjustments.reduce((sum, a) => sum + a.amount, 0);
  }

  applyAdjustment(anAdjustment) {
    this._adjustments.push(anAdjustment);
    this._production += anAdjustment.amount;
  }
}
