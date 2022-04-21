## Chapter 11. API 리팩토링

- API는 프로그램에서 모듈과 함수를 연결함으로써 기능이 잘 수행되록 함
- 개선할 방법이 떠오를 때마다 바로 테스트, 적용하여 개선하도록 함

### Case 1. 한 API에서 데이터 갱신과 조회 기능이 섞여있는 경우

- 좋은 API는 데이터를 갱신하는 함수와 데이터를 조회만 하는 함수가 명확히 구분되어 있어야 함

#### 11.1. 질의 함수와 변경 함수 분리하기

**기본 절차**

1. 대상 함수를 복제하고 질의 목적에 맞는 이름을 짓는다.
2. 새 질의 함수에서 부수 효과를 전부 제거한다.
3. 정적 검사를 수행한다.
4. 원래 함수(1의 대상 함수)를 호출하는 부분을 모두 찾는다. 호출하는 곳에서 질의 함수를 호출하도록 바꾸고, 원래 함수를 호출하는 코드를 바로 아래 줄에 추가한다. 수정할 때마다 테스트를 진행한다.
5. 원래 함수에서 질의 관련 코드를 제거하고 테스트를 진행한다.

**예시**

```javascript
// 0. 기존 함수
function alertForMiscreant(people) {
  for (const p of people) {
    if (p === "조커") {
      setOffAlarms();
      return "조커";
    }
    if (p === "사루만") {
      setOffAlarms();
      return "사루만";
    }
  }
  return "";
}

// 1. 새로운 질의함수 생성
function findMiscreant(people) {
  // 2. 함수 이름 변경
  for (const p of people) {
    if (p === "조커") {
      // setOffAlarms(); // 3. 부수효과 제거
      return "조커";
    }
    if (p === "사루만") {
      // setOffAlarms(); // 3. 부수효과 제거
      return "사루만";
    }
  }
  return "";
}

// 4. 함수 호출 부분 변경
// 변경 전
const found = alertForMiscreant(people);
// 변경 후
const found = findMiscreant(people);
alertForMiscreant(people);

// 5. 기존 함수에서 질의 관련 코드 제거
function alertForMiscreant(people) {
  for (const p of people) {
    if (p === "조커") {
      setOffAlarms();
      return;
    }
    if (p === "사루만") {
      setOffAlarms();
      return;
    }
  }
  return;
}

// 6. 중복 부분 제거
function alertForMiscreant(people) {
  if (findMiscreant(people) != "") setOffAlarms();
}
```

#### 11.2. 함수 매개변수화하기

- 여러 함수들이 비슷한 로직을 가지고 있을 경우, 과정 중 다른 값들만 매개변수로 받아 하나의 함수로 통일할 수 있다.
- 범위를 다루는 로직일 경우에는 중간에 해당하는 함수부터 시작하는 게 좋다.

**기본 절차**

1. 비슷한 함수 중 하나 선택
2. 함수 선언 바꾸기로 리터럴들을 매개변수로 추가
3. 2의 함수를 호출하는 곳 모두에 적절한 리터럴 값 추가, 테스트 진행
4. 매개변수로 받은 값을 사용하도록 함수 본문 수정, 수정할 때마다 테스트 진행
5. 비슷한 다른 함수들을 호출하는 코드를 찾아 매개변수화된 함수를 호출하도록 수정
6. 테스트 진행

**예시 1**

```javascript
// 리팩토링 전
function tenPercentRaise(aPerson) {
  aPerson.salary = aPerson.salary.multiply(1.1);
}

function fivePercentRaise(aPerson) {
  aPerson.salary.multiply(1.05);
}

// 리팩토링 후
function raise(aPerson, factor) {
  aPerson.salary = aPerson.salary.multiply(1 + factor);
}
```

**예시 2**

```javascript
// 0. 기존 함수
function baseCharge(usage) {
  if (usage < 0) return usd(0);
  const amount =
    bottomBand(usage) * 0.03 + middleBand(usage) * 0.05 + topBand(usage) * 0.07;
  return usd(amount);
}

function bottomBand(usage) {
  return Math.min(usage, 100);
}

function middleBand(usage) {
  return usage > 100 ? Math.min(usage, 200) - 100 : 0;
}

function topBand(usage) {
  return usage > 200 ? usage - 200 : 0;
}

// 1. 함수 선언 바꾸기, 호출 시점에 리터럴 입력하도록 변경
function withinBand(usage, bottom, top) {
  return usage > 100 ? Math.min(usage, 200) - 100 : 0;
}

function baseCharge(usage) {
  if (usage < 0) return usd(0);
  const amount =
    bottomBand(usage) * 0.03 +
    withinBand(usage, 100, 200) +
    topBand(usage) * 0.07;
  return usd(amount);
}

// 2. 리터럴을 매개변수로 대체
function withinBand(usage, bottom, top) {
  return usage > bottom ? Math.min(usage, top) - bottom : 0;
}

// 3. 다른 함수도 동일하게 대체
function baseCharge(usage) {
  if (usage < 0) return usd(0);
  const amount =
    withinBand(usage, 0, 100) * 0.03 +
    withinBand(usage, 100, 200) +
    withinBand(usage, 200, Infinity);
  return usd(amount);
}
```

#### 11.3. 플래그 인수 제거하기

- 플래그 인수(Flag Arguement) : 함수가 로직을 실행할 때 if-else 분기의 기준이 되는 값

```javascript
function setDimension(name, value) {
  // 여기서의 플래그 인수는 'name'
  if (name === "height") {
    this._height = value;
    return;
  }
  if (name === "width") {
    this._width = value;
    return;
  }
}
```

- 플래그 인수가 있을 경우 함수를 이해하기가 어려워지는 단점이 있다.
- 사용할 함수를 선택한 후에도 어떤 값을 넘겨야 하는지 또 알아내야 하는 번거로움이 있다. 특히 boolean 값의 경우는 인수의 의미를 정확히 해석하기 어렵다.
- 한 함수에서 플래그 인수를 두 개 이상 사용할 경우는 그만큼 만들어야 하는 함수의 양이 늘어난다는 의미이고, 함수 하나가 너무 많은 양의 일을 처리하고 있다는 뜻이다.
- 같은, 비슷한 로직을 한번에 처리할 수 있는 간단한 함수를 만드는 방법을 계속해서 고민하는 편이 좋다.

**기본 절차**

1. 매개변수로 들어가는 값 각각에 대응하는 명시적 함수들을 생성
2. 원래 함수를 호출하는 코드들을 찾아 각 리터럴 값에 대응되는 명시적 함수를 호출하도록 수정
3. 테스트 진행

**예시**

```javascript
// 리팩토링 전
function deliveryDate(anOrder, isRush) {
  if (isRush) {
    let deliveryTime;
    if (["MA", "CT"].includes(anOrder.deliveryState)) deliveryTime = 1;
    else if (["NY", "NH"].includes(anOrder.deliveryState)) deliveryTime = 2;
    else deliveryTime = 3;
    return anOrder.placedOn, plusDays(1 + deliveryTime);
  } else {
    let deliveryTime;
    if (["MA", "CT"].includes(anOrder.deliveryState)) deliveryTime = 2;
    else if (["NY", "NH"].includes(anOrder.deliveryState)) deliveryTime = 3;
    else deliveryTime = 4;
    return anOrder.placedOn, plusDays(2 + deliveryTime);
  }
}

// 리팩토링 후
function deliveryDate(anOrder) {
  if (isRush) return rushDeliveryDate(anOrder);
  else return regularDeliveryDate(anOrder);
}

function rushDeliveryDate(anOrder) {
  let deliveryTime;
  if (["MA", "CT"].includes(anOrder.deliveryState)) deliveryTime = 1;
  else if (["NY", "NH"].includes(anOrder.deliveryState)) deliveryTime = 2;
  else deliveryTime = 3;
  return anOrder.placedOn, plusDays(1 + deliveryTime);
}

function regularDeliveryDate(anOrder) {
  let deliveryTime;
  if (["MA", "CT"].includes(anOrder.deliveryState)) deliveryTime = 2;
  else if (["NY", "NH"].includes(anOrder.deliveryState)) deliveryTime = 3;
  else deliveryTime = 4;
  return anOrder.placedOn, plusDays(2 + deliveryTime);
}

// 모든 deliveryDate의 호출을 대체한 후에는 해당 함수를 제거
```

**예시(매개변수를 까다로운 방식으로 사용할 때)**

```javascript
// 래핑 함수 적용 전
function deliveryDate(anOrder, isRush) {
  let result;
  let deliveryDate;
  if (anOrder.deliveryState === "MA" || anOrder.deliveryState === "NH")
    deliveryTime = isRush ? 1 : 2;
  else if (anOrder.deliveryState === "NY" || anOrder.deliveryState === "NH") {
    deliveryTime = 2;
    if (anOrder.deliveryState === "NH" && !isRush) deliveryTime = 3;
  } else if (isRush) deliveryTime = 3;
  else if (anOrder.deliveryState === "ME") deliveryTime = 3;
  else deliveryTime = 4;
  result = anOrder.placedOn.plusDays(2 + deliveryTime);
  if (isRush) result = result.minusDays(1);
  return result;
}

// 래핑 함수 적용 후
function rushDeliveryDate(anOrder) {
  return deliveryDate(anOrder, true);
}
function regularDeliveryDate(anOrder) {
  return deliveryDate(anOrder, false);
}
```

### Case 2. 데이터가 지나치게 많은 함수를 거치며 분해될 경우

#### 11.4. 객체 통째로 넘기기

- 하나의 레코드에서 특정한 값을 몇 개 가져오는 것보다 레코드를 통째로 넘길 때 변화에 대응하기가 쉽다.
- 또한 레코드의 값을 처리하는 함수가 여러 개일 경우 발생하는 로직 중복도 없앨 수 있다.
- 다른 객체의 메소드를 호출하면서 객체 자신이 가진 데이터도 필요로 할 때는 아예 객체 자신의 참조만 건넬 수도 있다.(javascript의 경우 this)
- 단, 함수가 레코드에 의존하기를 원치 않을 때, 레코드와 함수가 서로 다른 모듈에 속해 있는 상황일 때는 적용하지 않는다.

**기본 절차**

1. 매개변수들을 원하는 형태로 받는 빈 함수 생성
2. 새 함수의 본문에서 원래 함수를 호출하도록 하고, 새 매개변수와 원래 함수의 매개변수 매핑
3. 정적 검사 수행
4. 모든 호출자가 새 함수를 사용하게 수정, 테스트
5. 호출자를 모두 수정한 후 원래 함수를 인라인
6. 새 함수의 이름을 적절히 수정하고 모든 호출자에 반영, 테스트

```javascript
// 호출자
const low = aRoom.daysTempRange.low;
const high = aRoom.daysTempRange.high;
if (!aPlan.withinRange(low, high))
alerts.push("방 온도가 지정 범위를 벗어났습니다.");

// 0. 클래스
withinRange(bottom, top) {
  return (bottom >= this._temperatureRange.low) && (top <= this._temperatureRange.high);
}

// 1. 메서드 생성, 기존 매개변수와 매핑
xxNewwithinRange(aNumberRange) {
  return this.withinRange(aNumberRange.low, aNumberRange.high);
}

// 2. 호출자 수정
const low = aRoom.daysTempRange.low;
const high = aRoom.daysTempRange.high;
if (!aPlan.xxNewwithinRange(aRoom.daysTempRange))
alerts.push("방 온도가 지정 범위를 벗어났습니다.");

// 3. 죽은 코드 제거
if (!aPlan.xxNewwithinRange(aRoom.daysTempRange))
alerts.push("방 온도가 지정 범위를 벗어났습니다.");

// 4. 기존 함수 인라인
xxNewwithinRange(aNumberRange) {
  return (bottom >= this._temperatureRange.low) && (top <= this._temperatureRange.high);
}

// 5. 함수 이름 변경
withinRange(aNumberRange) {
  return (bottom >= this._temperatureRange.low) && (top <= this._temperatureRange.high);
}
```

#### 11.5. 매개변수를 질의 함수로 바꾸기

- 다른 중복과 마찬가지로 매개변수의 중복 역시 최대한 피하는 것이 좋다.
- 함수가 쉽게 결정할 수 있는 값을 매개변수로 넘기는 것도 일종의 중복으로 볼 수 있다. 함수가 결정할 수 있는 값이라면 굳이 매개변수에 포함시킬 이유가 없다.
- 다른 매개변수에서 얻을 수 있는 값 역시 굳이 매개변수에 포함시킬 이유가 없다.
- 단, 이 과정에서 함수에 원치 않는 의존성이 생길 경우는 진행하지 않는다. 또한 리팩토링을 진행하며 함수가 같은 값을 넣었을 때 동일한 결과가 나올 수 있도록(참조 투명) 한다.

**기본 절차**

1. 필요하다면 대상 매개변수의 값을 계산하는 코드를 별도 함수로 추출
2. 함수 본문에서 대상 매개변수로 참조되는 값을 모두 찾아서 해당 값을 만들어주는 표현식을 참조하도록 변경
3. 함수 선언 바꾸기로 대상 매개변수 제거

**예시**

```javascript
// 리팩토링 적용 전
get finalPrice() {
  const basePrice = this.quantity * this.itemPrice;
  let discountLevel;
  if (this.quantity > 100) discountLevel = 2;
  else discountLevel = 1;
  return this.discountedPrice(basePrice, discountLevel);
}

discountedPrice(basePrice, discountLevel) {
  switch (discountLevel) {
    case 1: return basePrice * 0.95;
    case 2: return basePrice * 0.9;
  }
}

// 리팩토링 적용 후
get finalPrice() {
  const basePrice = this.quantity * this.itemPrice;
  return this.discountedPrice(basePrice);
}

get discountLevel() {
  return (this.quantity > 100) ? 2: 1;
}

discountedPrice(basePrice) {
  switch (this.discountLevel) {
    case 1: return basePrice * 0.95;
    case 2: return basePrice * 0.9;
  }
}
```

#### 11.6. 질의 함수를 매개변수로 바꾸기

- 전역변수나 모듈 안에서 제거하고 싶은 참조를 매개변수로 바꿉니다.
- 해당 과정을 진행하며 모듈이나 함수를 다루거나 테스트하기 쉽게 만들 수 있다는 장점이 있다.
- 하지만 질의 함수를 매개변수로 변경할 경우 호출자가 복잡해질 뿐만 아니라, 어떤 값을 넘길지를 호출자 쪽에서 알아내야 한다.

**기본 절차**

1. 변수 추출하기로 질의 코드를 함수 본문의 나머지 코드와 분리
2. 함수 본문에서 해당 질의를 호출하지 않는 코드들을 별도 함수로 추출
3. 2에서 만든 변수를 인라인해 제거
4. 원래 함수도 인라인 진행
5. 새 함수의 이름을 원래 함수의 이름으로 수정

**예시**

```javascript
// 리팩토링 적용 전
get targetTemperature() {
  if (thermostat.selectedTemperature > this._max) return this._max;
  else if (thermostat.selectedTemperature < this._min) return this._min;
  else return thermostat.selectedTemperature;
}

if (thePlan.targetTemperature > thermostat.currentTemperature) setToHeat();
else if (thePlan.targetTemperature < thermostat.currentTemperature) setToCool();
else setOff();

// 리팩토링 적용 후
if (thermostat.selectedTemperature > thermostat.currentTemperature) setToHeat();
else if (thermostat.selectedTemperature < thermostat.currentTemperature) setToCool();
else setOff();

targetTemperature(selectedTemperature) {
  if (selectedTemperature > this._max) return this._max;
  else if (selectedTemperature < this._min) return this._min;
  else return selectedTemperature;
}
```
