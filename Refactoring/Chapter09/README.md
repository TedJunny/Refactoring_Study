# 9 데이터 조직화

## 9.1 변수 쪼개기 (Split Variable)

- 변수에는 값을 단 한번만 대입해야 함.
- 대입이 두 번 이상 이뤄진다면 여러 가지 역할을 수행한다는 신호.
- 역할이 둘 이상인 변수가 있다면 쪼개야 한다.
- 역할 하나당 변수 하나 지키자.
- `예외 : for반복문 내의 루프 변수, 수집변수에는 이 리팩토링을 적용하면 안된다.`
- `❓ 수집 변수란? 변수 선언 이후의 대입이 항상 i = i + <무언가> 인 형태의 변수`

#### 언제 변수 쪼개기를 사용할까?

- 역할을 둘 이상 하고 있는 변수를 발견한 즉시.

#### 절차

1. 변수를 선언한 곳과 값을 처음 대입하는 곳에서 변수 이름을 바꾼다.
2. 가능하면 이때 불변으로 선언한다.
3. 이 변수에 두 번째로 값을 대입하는 곳 앞까지의 모든 참조(이 변수가 쓰인 곳)를 새로운 변수 이름으로 바꾼다.
4. 두 번째 대입 시 변수를 원래 이름으로 다시 선언한.
5. 테스트
6. 반복한다. 매 반복에서 변수를 새로운 이름으로 선언하고 다음번 대입 때까지이ㅡ 모든 참조를 새 변수명으로 바꾼다. 이 과정을 마지막 대입까지 반복한다.

#### 예시 1.

```js

function distanceTrabvelled(scenario, time) {
  let result;
  let acc = scenario.primaryForce / scenario.mass; //가속도(a) = 힘(F)/질량(m)
  let primaryTime = Math.min(time, scenario.delay);
  result = 0.5 * acc * primaryTime * primaryTime; //전파된 거리
  let secondaryTime = time - scenario.delay;
  if (secondaryTime > 0) {
    //두 번째 힘을 반영해 다시 계산
    let primaryVelocity = acc * scenario.delay;
    acc = (scenario.primaryForce + scenario.secondaryTime) / scenario.mass; //acc 변수에 값이 두 번 대입되고 있음.
    result += primaryVelocity * secondaryTime + 0.5 * acc * secondaryTime * secondaryTime;
  }
  return result;
}

⬇ 리팩터링 후 ⬇

function distanceTrabvelled(scenario, time) {
  let result;
  const primaryAcceleration = scenario.primaryForce / scenario.mass; //1,2. 알맞는 이름으로 변경 + 불변으로 선언
  let primaryTime = Math.min(time, scenario.delay);
  result = 0.5 * primaryAcceleration * primaryTime * primaryTime; //3. 두번째 대입 전까지의 모든 참조를 새로운 이름으로 교체
  let secondaryTime = time - scenario.delay;
  if (secondaryTime > 0) {
    let primaryVelocity = primaryAcceleration * scenario.delay; //3. 두번째 대입 전까지의 모든 참조를 새로운 이름으로 교체
    // let acc = (scenario.primaryForce + scenario.secondaryTime) / scenario.mass; //4.두번째 대입 시 변수 재선언
    // result += primaryVelocity * acc + 0.5 * acc * secondaryTime * secondaryTime;
    const secondaryAcceleration = (scenario.primaryForce + scenario.secondaryTime) / scenario.mass; //1~3을 반복하여 주석처리 된 코드를 이와 같이 수정
    result += primaryVelocity * secondaryTime + 0.5 * acc * secondaryTime * secondaryTime;
  }
  return result;
}


⬇ 리팩터링 한 번 더 해봄 ⬇

function distanceTrabvelled(scenario, time) {
  let result;
  const primaryAcceleration = scenario.primaryForce / scenario.mass; //알맞는 이름으로 변경 + 불변으로 선언
  let primaryTime = Math.min(time, scenario.delay);
  result = getDistance(primaryAcceleration, primaryTime); //전파된 거리 (0.5 * acceleraion * time * time)을 질의 함수로 추출
  let secondaryTime = time - scenario.delay;
  if (secondaryTime > 0) {
    let primaryVelocity = primaryAcceleration * scenario.delay;
    const secondaryAcceleration = (scenario.primaryForce + scenario.secondaryTime) / scenario.mass;
    result += primaryVelocity * secondaryTime + getDistance(secondaryAcceleration, secondaryTime);
  }
  return result;
}

function getDistance(acceleration, time) {
  return 0.5 * acceleration * time * time;
}

```

#### 예시 2.

- 매개변수를 쪼개보자.
- 아래의 예시로 inputValue와 quantity를 보내고 있다.
- 예시의 inputValue는 리터럴 타입이기 때문에 inputValue를 수정해도 호출자에 영향을 주지 않는다는 점을 유의하여 보자.

```js

function discount(inputValue, quantity) {
  if (inputValue > 50) inputValue = inputValue - 2;
  if (quantity > 100) inputValue = inputValue - 1;
  return inputValue;
}

⬇ 리팩터링 후 ⬇

function new_discount(inputValue, quantity) {
  let result = inputValue;
  if (inputValue > 50) result = result - 2;
  //if문에서 result가 아닌 inputValue와 비교하게 함으로써, 이 코드가 입력 값에 기초하여 결과를 계산한다는 사실을 명확히 드러냈다.
  if (quantity > 100) result = result - 1;
  return result;
}

```

---

## 9.2 필드 이름 바꾸기 (Rename Field)

- 개발을 진행하면서 데이터를 더 잘 이해하게 되었을 때, 레코드의 필드 이름을 바꾸고 싶어질 수 있다.
- 이 때 필드의 이름을 더 적절한 것으로 바꾸는 것.
- 게터와 세터 메서드는 클래스 사용자 입장에서는 필드와 다를 바 없으므로, 게터/세터 이름 바꾸기도 레코드 구조체의 필드 이름 바꾸기와 똑같이 중요하다.
  `주의) 한 함수 안에서만 쓰이는 데이터였다면 캡슐화할 필요 없이 그저 원하는 속성들의 이름만 바꿔주면 될 일이다. 전체 과정을 적용할지는 상황에 맞게 잘 판단해야 한다.`

#### 언제 필드 이름 바꾸기를 사용할까?

- 데이터에 대한 이해가 깊어짐에 따라 그 이해도를 필드에 반영하고 싶어졌을 때. (ex: `Person class`의 필드명을 `nm` -> `name`으로 변경하고싶어졌다.)

#### 절차

1. 레코드 유효 범위가 제한적이라면 필드에 접근하는 모든 코드를 수정한 후 테스트한다. 이휴 단계는 필요 없다.
   `❓ 레코드 유효 범위가 제한적이란 것은 해당 클래스의 필드들이 private나 protected로 선언되어있어 접근 가능한 범위가 좁은 것을 말하는것인가? `
2. 레코드가 캡슐화되지 않았다면 먼저 레코드 캡슐화를 한다.
3. 캡슐화된 객체 안의 private 필드명을 변경하고, 그에 맞게 내부 메서드들을 수정한다.
4. 테스트
5. 생성자의 매개변수 중 필드와 이름이 겹치는게 있다면 함수 선언 바꾸기로 변경한다.
6. 접근자들의 이름도 바꿔준다.

#### 예시

```js

const organization = { name: 'GloZ', country: 'KR' };

⬇ 리팩터링 후 ⬇
1.
class Organization {
  constructor(data) {
    this._name = data.name;
    this._country = data.country;
  }

  get name() {return this._name;}
  set name(aString) {this._name = aString;}
  get country() {return this._country;}
  set country(aCountryCode) {this._country = aCountryCode;}


  2.
  class Organization {
  constructor(data) {
    this._title = data.title != undefined ? data.title : data.name; //안전장치
    this._country = data.country;
  }

  get name() {return this._title;} //getter, setter에서도 name -> title로 바꿔준다.
  set name(aString) {this._title = aString;}
  get country() {return this._country;}
  set country(aCountryCode) {this._country = aCountryCode;}
 }
 const organization = new Organization({ name: 'GloZ', country: 'KR' }) //이 코드를 아래 코드로 수정해준다.
 const organization = new Organization({ title: 'GloZ', country: 'KR' }) //name => title
}

3. fin.
class Organization2 {
  constructor(data) {
    this._title = data.title; //안전장치 제거
    this._country = data.country;
  }

  //getter/setter 명 수정
  get title() {return this._title;}
  set title(aString) {this._title = aString;}
  get country() {return this._country;}
  set country(aCountryCode) {this._country = aCountryCode;}

}

```

---

## 9.3 파생 변수를 질의 함수로 바꾸기 (Replace Derived Variable with Query)

- 가변 데이터는 서로 다른 두 코드를 이상한 방식으로 결합하기도 하는데, 예컨대 한 쪽 코드에서 수정한 값이 연쇄효과를 일으켜 다른 쪽 코드에 원인을 찾기 어려운 문제를 야기하기도 한다.
- 값을 쉽게 계산해낼 수 있는 변수들 모두 제거함으로써 쉽게 해낼 수 있다.
  - 예외)
    - 피연산자 데이터가 불변이라면 계산 결과도 일정하므로 역시 불변으로 만들 수 있다. 그래서 새로운 데이터 구조를 생성하는 **변형 연산**이라면 비록 계산 코드로 대체할수 있더라도 그대로 두는 것도 좋다. (?)
      ```js
      const aTen = 10;
      const aOne = 1;
      console.log(aTen + aOne); //11
      //피연산자인 aNumber는 const이므로 값을 재할당 할 수 없으므로 늘상 10임.
      //이렇듯 피연산자가 불변이면 결과도 일정할 수 밖에 없음.
      ```
      - 변형연산 case
        - 첫째 : 데이터 구조를 감싸며 그 데이터에 기초하여 계산한 결과를 속성으로 제공하는 객체.
        - 둘째 : 데이터 구조를 받아 다른 데이터 구조로 변환해 반환하는 함수.

#### 절차

1. 변수 값이 갱신되는 지점을 모두 찾는다. 필요하면 변수 쪼개기를 활용해 각 갱신 지점에서 변수를 분리한다.
2. 해당 변수의 값을 계산해주는 함수를 만든다.
3. 해당 변수가 사용되는 모든 곳에 어서션을 추가하여 함수의 계산 결과가 변수의 값과 같은지 확인한다.
4. 테스트
5. 변수를 읽는 코드를 모두 함수 호출로 대체한다.
6. 테스트
7. 변수를 선언하고 갱신하는 코드를 죽은 코드 제거하기로 없앤다.

#### 예시

```js

class ProductionPlan {
  _production = 0;
  _adjustments = [];

  get production() {
    return this._production;
  }

  applyAdjustment(anAdjustment) {
    this._adjustments.push(anAdjustment);
    this._production += anAdjustment.amount;
    //applyAdjustment함수에서 이걸 하고있는게 거슬림 + 매번 갱신하지 않고도 계산 가능하므로 리팩토링하기.
  }
}


⬇ 리팩터링 후 ⬇

1.
class ProductionPlan {
  _production = 0; // => 파생변수?
  _adjustments = [];

  /* 추가 */
  get production() {
    console.log(this._production === this.calculatedProduction); //3. 어서션 추가
    return this._production;
  }

  //2. 해당 변수의 값을 계산해주는 함수를 만든다.
  get calculatedProduction() {
    return this._adjustments.reduce((sum, a) => sum + a.amount, 0);
  }
  applyAdjustment(anAdjustment) {
    this._adjustments.push(anAdjustment);
    this._production += anAdjustment.amount; //1.변수 값이 갱신되는 지점을 모두 찾는다.
  }
}


2.
class ProductionPlan {
  //7. 코드를 죽은 코드 제거하기로 없앤다.
  // _production = 0;
  _adjustments = [];

  get production() {
    // 5. 변수를 읽는 코드를 모두 함수 호출로 대체한다.
    return this._adjustments.reduce((sum, a) => sum + a.amount, 0);
  }

  // 7.
  // get calculatedProduction() {
  //   return this._adjustments.reduce((sum, a) => sum + a.amount, 0);
  // }
  applyAdjustment(anAdjustment) {
    this._adjustments.push(anAdjustment);
    //7.
    //this._production += anAdjustment.amount;
  }
}
```

---

## 9.4 참조를 값으로 바꾸기 (Change Reference to Value)

- 필드를 값으로 다룬다면 내부 객체의 클래스를 수정하여 값 객체로 만들 수 있다.
- 값 객체는 불변이기 때문에 자유롭게 활용하기 좋다.
- 예외 ) 특정 객체를 여러 객체에서 공유해야 하는 경우, 그래서 공유 객체의 값을 변경했을 때 이를 관련 객체 모두에게 알려줘야 한다면 공유객체를 참조로 다뤄야 한다.

#### 언제 참조를 값으로 바꾸기를 사용할까?

- 값을 참조로 사용할 필요가 없을 때

#### 절차

1. 후보 클래스가 불변인지, 혹은 불변이 될 수 있는지 확인
2. 각각의 세터를 하나씩 제거한다.
3. 이 값 객체의 필드들을 사용하는 동치성(equality) 비교 메서드를 만든다.

#### 예시

```js

class Person {
  constructor() {this._telephoneNumber = new TelephoneNumber();}
  get officeAreaCode() {return this._telephoneNumber.areaCode;}
  set officeAreaCode(arg) {this._telephoneNumber.areaCode = arg;}
  get officeNumber() {return this._telephoneNumber.number;}
  set officeNumber(arg) {return (this._telephoneNumber.number = arg;}
}

class TelephoneNumber {
  get areaCode() {return this._areaCode;}
  set areaCode(arg) {this._areaCode = arg;}
  get number() {return this._number;}
  set number(arg) {this._number = arg;}
}

⬇ 리팩터링 후 ⬇


class Person {
  constructor(areaCode, number) {this._telephoneNumber = new TelephoneNumber(areaCode, number);}
  get officeAreaCode() {return this._telephoneNumber.areaCode;}
  set officeAreaCode(arg) {
    // this._telephoneNumber.areaCode = arg;
    this._telephoneNumber = new TelephoneNumber(arg, this.officeNumber);
  }
  get officeNumber() {return this._telephoneNumber.number;}
  set officeNumber(arg) {
    // return (this._telephoneNumber.number = arg);
    this._telephoneNumber = new TelephoneNumber(this.officeAreaCode, arg);
  }
}

class TelephoneNumber {
  //1. 전화번호를 불변으로 만들기
  //2. 필드들의 세터들만 제거. 제거의 첫 단계로 세터로 설정하던 두 필드를
  //생성자에서 입력받아 설정하도록 한다. (함수 선언 바꾸기)
  constructor(areaCode, number) {
    this._areaCode = areaCode;
    this._number = number;
  }

  //3. 값 객체로 인정받으려면 동치성을 값 기반으로 평가해야 한다. (리터럴은 값으로 비교하니까?)
  equls(other) {
    if (!(other instanceof TelephoneNumber)) return false;
    return this.areaCode === other.areaCode && this.number === other.number;
  }

  get areaCode() {
    return this._areaCode;
  }
  //   set areaCode(arg) {
  //     this._areaCode = arg;
  //   }
  get number() {
    return this._number;
  }
  //   set number(arg) {
  //     this._number = arg;
  //   }
}
const tel = new TelephoneNumber('312', '555-1111');
const tel2 = new TelephoneNumber('312', '555-1111');
console.log(tel.equls(tel2)); //true
```

---

## 9.5 값을 참조로 바꾸기 (Change Value to Reference)

- 논리적으로 같은 데이터를 물리적으로 복제해 사용할 때 문제는 그 데이터를 갱신해야 할 때다.
- 이런 상황이라면 복제된 데이터들을 모두 참조로 바꿔주는게 좋다. 데이터가 하나면 갱신된 내용이 모두에 곧바로 반영되기 때문이다.

#### 언제 값을 참조로 바꾸기를 사용할까?

- 데이터를 하나로 사용해야 할 때.

#### 절차

1. 같은 부류에 속하는 객체들을 보관할 저장소를 만든다. (이미 있다면 생략)
2. 생성자에서 이 부류의 객체들 중 특정 객체를 정확히 찾아내는 방법이 있는지 확인한다.
3. 호스트 객체의 생성자들을 수정하여 필요한 객체를 이 저장소에서 찾도록 한다.
4. 테스트

#### 예시

```js

class Order {
  constructor(data) {
    this._number = data.number;
    this._customer = new Customer(data.customer); //customer가 고객 id
  }
  get customer() {
    return this._customer;
  }
}

class Customer {
  constructor(id) {
    this._id = id;
  }
  get id() {
    return this._id;
  }
}

const order = new Order({ number: '1', customer: 111 });
const order2 = new Order({ number: '2', customer: 111 });
console.log(order.customer); //Customer { _id: 111 }
console.log(order2.customer); //Customer { _id: 111 }
console.log(order.customer === order2.customer); // false


⬇ 리팩터링 후 ⬇


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
console.log(order.customer); //Customer { _id: 111 }
console.log(order2.customer); //Customer { _id: 111 }
console.log(order.customer === order2.customer); // true

```

---

## 9.6 매직 리터럴로 바꾸기 (Replace Magic Literal)

- 매직 리터럴이란 소스코드에 등장하는 일반적인 리터럴값을 말함.
- 코드를 읽는 사람이 이 값의 의미를 알 수 없으면 매직 리터럴이라 할 수 있다.
- 해당 값이 쓰이는 모든 곳을 적절한 이름의 상수로 바꿔주는 방법과
- 그 상수가 특별한 비교 로직에 자주 쓰이는 경우엔 이런 방식도 있다.
  ```js
  aValue === MALE_GENDER;
  //into
  isMale(aValue);
  ```

#### 언제 매직 리터럴로 바꾸기를 사용할까?

- 이해할 수 없는 값이 자주 등장할 때.

#### 절차

1. 상수를 선언하고 매직 리터럴을 대입
2. 해당 리터럴이 사용되는 곳을 모두 찾기
3. 찾은 곳 각각에서 리터럴이 새 상수와 똑같은 의미로 쓰였는지 확인하고, 그렇다면 상수로 대체한 후 테스트.

#### 예시

```js

function potentialEnergy(mass, height){
    return mass * 9.81 * height;
}

⬇ 리팩터링 후 ⬇
const STANDARD_GRAVITY = 9.81;
function potentialEnergy(mass, height){
    return mass * STANDARD_GRAVITY * height;
}

```

---
