# 6 기본적인 리팩터링 (6.1 ~ 6.6)

## 6.1 함수 추출하기

> 코드조각을 찾고, 기능 파악 후 독립된 함수로 추출 & 이름 붙이기

#### 언제 함수 추출하기를 사용할까?

1. 길이 기준
   - 함수 하나가 한 화면을 넘어가면 안됨
2. 재사용성 기준
   - 두 번 이상 사용될 코드는 함수로 추출, 한번만 쓰인다면 인라인 상태로 유지
3. **목적과 구현을 분리하는 방식**
   - 코드를 보고 어떤 기능인지 파악이 오래걸린다면 추출하기

#### 함수가 짧으면 성능이 느려진다?!

세상이 너무 좋아져서 괜한 걱정이다~

함수가 짧으면 캐싱하기 쉬워서 컴파일러가 최적화 하는데 유리할 때가 많다!

### 절차

1. 함수의 목적을 드러내는 이름을 붙인다
2. 추출할 코드를 새 함수에 복사
3. 참조하는 지역변수는 인수로 전달
   - 새 함수에서만 사용되는 변수는 지역변수로
   - 지역변수의 값을 변경할 경우 새 함수의 결과로 전달
4. 새로 만든 함수를 호출하는 문으로 수정

```js
function printOwing(invoice) {
  printBanner();
  let outstanding = calculateOutstanding();

  console.log(`고객명: ${invoice.customer}`);
  console.log(`채무액: ${outstanding}`);
}

⬇ 리팩터링 후 ⬇

function printOwing(invoice) {
  printBanner()
  let outstanding = calculateOutstanding()
  printDetails(outstanding)

  function printDetails(outstanding) {
    console.log(`고객명: ${invoice.customer}`)
    console.log(`채무액: ${outstanding}`)
  }
}
```

```js
function printOwing(invoice) {
  printBanner();
  const outstanding = calculateOutstanding();
  recordDueDate(invoice);
  printDetails(invoice, outstanding);
}

function printBanner() {
  console.log(`*** 고객 채무 ***`);
}

function calculateOutstanding(invoice) {
  let result = 0;
  for (const o of invoice.orders) {
    result += o.amount;
  }
  return result;
}

function recordDueDate(invoice) {
  const today = Clock.today;
  invoice.dueDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 30
  );
}

function printDetails(invoice, outstanding) {
  console.log(`고객명: ${invoice.customer}`);
  console.log(`채무액: ${outstanding}`);
  console.log(`마감일: ${invoice.dueDate.toLocaleDateString()}`);
}
```

---

## 6.2 함수 인라인하기

> 본문 코드가 함수명만큼 명확하거나 간접 호출이 과하게 많을 경우

### 절차

1. 서브 클래스에서 오버라이딩된 메서드인지 확인
   - 오버라이딩 되었다면 인라인 하지말것
2. 함수 호출위치 찾기
3. 점진적으로 호출문 인라인으로 교체

```js
function rating(aDriver) {
  return moreThanFiveLateDeliveries() ? 2 : 1
}

function moreThanFiveLateDeliveries(aDriver) {
  return aDriver.numberOfLateDeliveries > 5
}

⬇ 리팩터링 후 ⬇

function rating(aDriver) {
  return aDriver.numberOfLateDeliveries > 5 ? 2 : 1
}
```

```js
function reportLines(aCustomer) {
  const lines = []
  gatherCustomerData(lines, aCustomer)
  return lines
}

function gatherCustomerData(out, aCustomer) {
  out.puhs(["name", aCustomer.name])
  out.puhs(["location", aCustomer.location])
}

⬇ 리팩터링 후 ⬇

function reportLines(aCustomer) {
  const lines = []
  lines.puhs(["name", aCustomer.name])
  lines.puhs(["location", aCustomer.location])
  return lines
}
```

✧ 잘라내서, 붙이고, 다듬기 (항상 단계를 잘게 나눠서 처리하는게 핵심)

---

## 6.3 변수 추출하기

- 복잡한 로직을 구성하는 단계마다 변수로 추출하여 이름 붙이기
- 디버깅 break point 지정 용이함
- ❗ 문맥을 고려하여 현재 선언된 함수보다 더 넓은 문맥에서까지 의미가 된다면 함수로 추출하는 것을 권장

### 절차

1. 추출할 표현식에 사이드이펙트가 없는지 확인
2. 상수를 하나 선언 후 표현식 대입
3. 새로 만든 변수로 교체

```js
return order.quantity * order.itemPrice - Math.max(0, order.quantity - 500) * order.itemPrice * 0.05 + Math.min(order.quantity * order.itemPrice * 0.1, 100)

⬇ 리팩터링 후 ⬇

const basePrice = order.quantity * order.itemPrice
const quantityDiscount = Math.max(0, order.quantity - 500) * order.itemPrice * 0.05
const shipping = Math.min(order.quantity * order.itemPrice * 0.1, 100)
return basePrice - quantityDiscount + shipping
```

```js
// 함수일때
function price(order) {
  const basePrice = order.quantity * order.itemPrice;
  const quantityDiscount =
    Math.max(0, order.quantity - 500) * order.itemPrice * 0.05;
  const shipping = Math.min(order.quantity * order.itemPrice * 0.1, 100);
  return basePrice - quantityDiscount + shipping;
}

//클래스일때
//공통 동작을 추상화 해두면 객체 활용시 매우 유용!
class Order {
  constructor(aRecord) {
    this._data = aRecord;
  }

  get quantity() {
    return this._data.quantity;
  }
  get itemPrice() {
    return this._data.itemPrice;
  }

  get price() {
    return this.basePrice - this.quantityDiscount + this.shipping;
  }
  get basePrice() {
    return this.quantity * this.itemPrice;
  }
  get quantityDiscount() {
    return Math.max(0, this.quantity - 500) * this.itemPrice * 0.05;
  }
  get shipping() {
    return Math.min(this.basePrice * 0.1, 100);
  }
}
```

---

## 6.4 변수 인라인하기

- 변수명이 원래 표현식과 다를바 없을 때

### 절차

1. 인라인할 표현식에 사이드이펙트가 없는지 확인
2. 상수인지 확인하고 상수로 수정 후 테스트 (값이 단 한번만 대입되는지 확인)
3. 변수를 표현식으로 교체

```js
let basePrice = anOrder.basePrice
return (basePrice > 1000)

⬇ 리팩터링 후 ⬇

return anOrder.basePrice > 1000
```

---

## 6.5 함수 선언 바꾸기

- 이름이 잘못된 함수를 발견 즉시 수정할것
- 주석으로 함수의 목적을 설명하는 방법이 이름을 짓는데 도움이 된다
- 리팩터링 복잡도에 따라 간단한 절차와 마이그레이션 절차중 선택

### 간단한 절차

> 함수 이름바꾸기, 매개변수 추가 & 제거

1. 매개변수 제거 시, 참조하는 곳이 있는지 확인
2. 메서드 선언 변경
   - 변경할 게 둘 이상이면 나눠서 처리 (이름 변경, 매개변수 추가 각각 독립적 처리)

```js
//함수 이름 바꾸기
function circum(radius) {
  return 2 * Math.PI * radius
}

⬇ 리팩터링 후 ⬇

function circumference (radius) {
  return 2 * Math.PI * radius
}
```

### 마이그레이션 절차

1. 함수 본문을 새 함수로 추출
2. 새 함수에 매개변수 추가 시 간단한 절차로 추가
3. 테스트 (assertion을 추가하여 실제로 사용하는지 검사 가능)
4. 기존 함수가 새 함수를 호출하도록 수정
5. 예전 함수를 쓰는 코드를 새 함수를 호출하도록 수정
6. 임시 이름을 붙인 새 함수를 원래 이름으로 수정

```js
//함수이름 바꾸기
function circum(radius) {
  return 2 * Math.PI * radius
}

⬇ 함수추출 후 ⬇

function circum (radius) {
  return circumference(radius)
}

function circumference (radius) {
  return 2 * Math.PI * radius
}

⬇ 테스트 후 인라인 진행 ⬇

// 예전 함수를 호출하는 부분이 모두 새 함수를 호출하면 기존 함수 삭제
function circumference (radius) {
  return 2 * Math.PI * radius
}
```

```js
//매개변수 추가하기
addReservation(customer) {
  this._reservations.push(customer)
}

⬇ 함수추출 후 매개변수 추가 ⬇

addReservation(customer) {
  new_addReservation(customer, false)
}

new_addReservation(customer, isPriority) {
  console.assert(isPriority === true, {message: '테스트 실패!'})
  this._reservations.push(customer)
}

//호출문을 전부 고쳤다면 기존함수 이름으로 수정!
```

```js
//매개변수 속성으로 바꾸기
function inNewEngland(aCustomer) {
  return ['MA', 'CT', 'ME', 'VT', 'NH', 'RI'].includes(aCustomer.address.state)
}

//호출문
const newEnglands = someCustomers.filter(c => inNewEngland(c))

⬇ 함수추출 후 ⬇

function inNewEngland(aCustomer) {
  return new_inNewEngland(aCustomer.address.state)
}

function new_inNewEngland(stateCode) {
  return ['MA', 'CT', 'ME', 'VT', 'NH', 'RI'].includes(stateCode)
}

⬇ 인라인 + 함수 선언 바꾸기 후 ⬇

function inNewEngland(stateCode) {
  return ['MA', 'CT', 'ME', 'VT', 'NH', 'RI'].includes(stateCode)
}

//호출문
const newEnglands = someCustomers.filter(c => inNewEngland(c.address.state))
```

---

## 6.6 변수 캡슐화하기

- 접근 범위가 넓은 데이터를 그 데이터로의 접근을 독점하는 함수로 캡슐화
  - 추가 로직을 쉽게 작성가능(데이터 변경전 & 변경 후 검증)
  - 데이터 결합도 높아지지 않음
- 불변 데이터는 데이터 변경 여지가 없어 캡슐화 불필요함

### 절차

1. 변수의 접근과 갱신을 전담하는 함수 선언
2. 정적 검사 수행
3. 변수에 직접 참조하던 부분을 모두 캡슐화 함수 호출로 수정 (수정할 때마다 테스트)
4. 변수의 접근 범위를 제한 (같은 모듈에서 접근함수만 export)
5. 테스트
6. 원본 데이터의 변경이 필요할 때
7. getter에서 데이터 복제 후 전달
8. 레코드 캡슐화하기 (클레스로 감싸기)
9. 주의 nested object일 경우 불충분할 수 있음

#### 데이터 구조로 참조 캡슐화

```js
let defaultOwner = {firstName: '마틴', lastName: '파울러'}

//참조코드
spaceship.Owner = defaultOwner

//갱신코드
defaultOwner = {firstName: '레베카', lastName: '파슨스'}

⬇ 함수정의 후 ⬇

function getDefaultOwner () { return defaultOwner }
function setDefaultOwner (arg) { return defaultOwner = arg }

⬇ 참조하는 코드 수정 후 ⬇

//참조코드
spaceship.Owner = getDefaultOwner()

//갱신코드
setDefaultOwner({firstName: '레베카', lastName: '파슨스'})

⬇ 범위제한 후 ⬇

let defaultOwner = {firstName: '마틴', lastName: '파울러'}
export function getDefaultOwner () { return defaultOwner }
export function setDefaultOwner (arg) { return defaultOwner = arg }
```

#### 값 캡슐화

- 기본 캡슐화는 구조로 접근이나 구조 자체를 다시 대입하는 행위 제어할수 있으나, 필드값 변경 행위는 제어할 수 없다

```js
const owner1 = getDefaultOwner();
console.log(owner1.lastName); // 파울러
const owner2 = getDefaultOwner();
owner2.lastName = "파슨스";
console.log(owner1.lastName); // 파슨스
```

변수값 수정까지 제어하고 싶을때

1. 값을 바꿀 수 없게 만들자 (데이터 복제본을 반환하도록 할 것)

```js
let defaultOwner = { firstName: "마틴", lastName: "파울러" };
export function getDefaultOwner() {
  return Object.assign({}, defaultOwner);
}
export function setDefaultOwner(arg) {
  return (defaultOwner = arg);
}
```

2. 레코드 캡슐화 하기

```js
let defaultOwner = { firstName: "마틴", lastName: "파울러" };
export function getDefaultOwner() {
  return new Person(defaultOwner);
}
export function setDefaultOwner(arg) {
  return (defaultOwner = arg);
}

class Person {
  constructor(data) {
    this._lastName = data.lastName;
    this._firstName = data.firstName;
  }

  get lastName() {
    return this._lastName;
  }
  get firstName() {
    return this._firstName;
  }
}

//defaultOwner 다시 대입하는 연산은 모두 무시된다
```

❗복제본 만들기 & 클래스로 감싸기 방식은 깊이가 1인 속성들까지만 효과가 있음
