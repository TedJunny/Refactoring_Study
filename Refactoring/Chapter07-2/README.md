# 7-2 캡슐화 (7.5 ~ 7.9)

## 7.5 클래스 추출하기

- 역할이 너무 많고 복잡한 클래스의 프로퍼티/메서드들을 관련있는 것들끼리 모아 더 알맞는 클래스로 추출하는 것.

#### 언제 클래스 추출하기를 사용할까?

- 명확하게 추상화하고 소수의 주어진 역할만 처리해야 하는 클래스의 역할이 너무 많고 복잡해졌을 때.
- 일부 데이터와 메서드를 따로 묶을 수 있다면 분리하라는 신호.
- 함께 변경되는 일이 많거나 서로 의존하는 데이터들은 함께 분리.

#### 절차

1. 클래스의 역할을 분리할 방법을 정한다.
2. 분리될 역할을 담당할 클래스를 새로 만든다.
   - 분리될 놈들을 쏙쏙 빼고난 뒤, 해당 클래스의 이름을 더 적절한 것으로 바꾸는게 좋을 것 같다고 판단되면 바꾼다.
3. 원래 클래스의 생성자에서 새로운 클래스의 인스턴스를 생성하여 필드에 저장해둔다.
4. 분리될 역할에 필요한 필드들을 새 클래스로 옮긴다. 하나씩 옮길 때마다 테스트한다.
5. 메서드들도 새 클래스로 옮긴다. 이때 다른 메서드를 호출하기 보다는 호출을 당하는 일이 많은 메서드부터 옮긴다. 하나씩 옮길 때마다 테스트한다.
6. 양쪽 클래스의 인터페이스를 살펴보면서 불필요한 메서드를 제거하고, 이름도 새로운 환경에 맞게 바꾼다.
7. 새 클래스를 외부로 노출할지 정한다.

#### 예시

```js
class Person {
  constructor(data) {
    this._name = data.name;
    this._officeAreaCode = data.areaCode;
    this._officeNumber = data.number;
  }
  get name() { return this._name; }
  set name(arg) { this._name = arg; }

  get telephoneNumber() { return `(${this.officeAreaCode}) ${this.officeNumber}`; }

  get officeAreaCode() { return this._officeAreaCode; }
  set officeAreaCode(arg) { this._officeAreaCode = arg; }

  get officeNumber() { return this._officeNumber; }
  set officeNumber(arg) { this._officeNumber = arg; }
}


⬇ 리팩터링 후 ⬇


class TelephoneNumber {
  constructor(data) {
    this._areaCode = data.areaCode;
    this._number = data.number;
  }
  get areaCode() { return this._areaCode; }
  set areaCode(arg) { this._areaCode = arg; }

  get number() { return this._number; }
  set number(arg) { return (this._number = arg); }

  toString() { return `(${this.areaCode}) ${this.number}`; }
}

class Person {
  constructor(data) {
    this._name = data.name;
    this._telephoneNumber = new TelephoneNumber({areaCode: data.areaCode, number: data.number});
  }
  get name() { return this._name; }
  set name(arg) { this._name = arg; }

  get officeAreaCode() { return this._telephoneNumber.areaCode; }
  set officeAreaCode(arg) { this._telephoneNumber.areaCode = arg; }
  get officeNumber() { return this._telephoneNumber.number; }
  set officeNumber(arg) { this._telephoneNumber.number = arg; }
  get telephoneNumber() { return this._telephoneNumber.toString(); }
}
```

#### 의문점

```js
const person = new Person({name: '마고', areaCode: '010', number: '111-1131'});
person._name = '빵꾸'; // setter를 사용하지 않고 바로 프로퍼티를 변경해보았다.
console.log(person.telephoneNumber);
console.log(person.name); //=> 빵꾸

/*
person._name = '빵꾸'; 이렇게 해도 프로퍼티의 값이 변경이 된다. 
완전히 캡슐화 하려면 setter, getter를 사용하는 프로퍼티들은
#로(private) 선언해줘야 진짜로 캡슐화 하는것 아닌가? 
 */
```

## 7.6 클래스 인라인하기

- 특별히 클래스로 남아있을 필요가 없어진 클래스를 가장 많이사용하는 클래스로 흡수시키는 것.

#### 언제 클래스 인라인하기를 사용할까?

- 역할을 옮기는 리팩터링을 하고 나서 특정 클래스에 남은 역할이 거의 없을 때, 더 이상 제 역할을 못하는 클래스는 인라인 해버린다.
  - 이럴 땐 이 불쌍한 클래스를 가장 많이 사용하는 클래스로 흡수 시킨다.
- 두 클래스의 기능을 지금과 다르게 배분하고 싶을 때도 클래스를 인라인한다. 클래스를 인라인 해서 하나로 합친 뒤 새로운 클래스를 추출하는 게 쉬울 수도 있기 때문.

#### 절차

1. 소스 클래스의 각 public 메서드에 대응하는 메서드들을 타깃 클래스에 생성한다.
2. 소스 클래스의 메서드를 사용하는 코드를 모두 타깃 클래스의 위임 메서드를 사용하도록 바꾼다. 하나씩 바꿀 때마다 테스트한다.
3. 소스 클래스의 메서드와 필드를 모두 타깃 클래스로 옮긴다. 하나씩 옮길 때마다 테스트한다.
4. 소스 클래스를 삭제한다.

#### 예시

- 현재 TrackingInformation클래스는 Shipment 클래스의 일부처럼 사용된다.
- 예전엔 어땠을지 몰라도 지금은 특별히 유용한 기능을 하고있지 않으므로, 인라인 해버리겠다.

```js
class TrackingInformation {
  constructor(data) {
    this._shippingCompany = data.shippingCompany;
    this._trackingNumber = data.trackingNumber;
  }
  get shippingCompany() { return this._shippingCompany; }
  set shippingCompany(arg) { this._shippingCompany = arg; }
  get trackingNumber() { return this._trackingNumber; }
  set trackingNumber(arg) { this.__trackingNumber = arg; }
  get display() { return `${this.shippingCompany}: ${this.trackingNumber}`; }
}

class Shipment {
  constructor(data) {
    this._trackingInformation = new TrackingInformation({shippingCompany: data.company, trackingNumber: data.trackingNumber});
  }
  get trackingInformation() { return this._trackingInformation; }
  set tranckingInformation(aTrackingInformation) { this._trackingInformation = aTrackingInformation; }
}


⬇ 리팩터링 후 ⬇


class Shipment {
  constructor(data) {
    this._shippingCompany = data.company;
    this._trackingNumber = data.trackingNumber;
  }
  get trackingInfo() { return `${this.shippingCompany}: ${this.trackingNumber}`; }
  get shippingCompany() { return this._shippingCompany; }
  set shippingCompany(arg) { this._shippingCompany = arg; }
  get trackingNumber() { return this._trackingNumber; }
  set trackingNumber(arg) { this._trackingNumber = arg; }
}

```

## 7.7 위임 숨기기

- `manager = aPerson.department.manager;` => `department` 가 위임 객체.
- 위임 객체의 인터페이스가 바뀌면 이 인터페이스를 사용하는 모든 클라이언트가 코드를 수정해야 한다.
- 이러한 의존성을 없애기 위해 위임 메서드를 만들어 위임 객체의 존재를 숨기는 것.

#### 절차

1. 위임 객체의 각 메서드에 해당하는 위임 메서드를 서버에 생성한다.
2. 클라이언트가 위임 객체 대신 서버를 호출하도록 수정한다. 하나씩 바꿀 때마다 테스트한다.
3. 모두 수정했다면, 서버로부터 위임 객체를 얻는 접근자를 제거한다.
4. 테스트한다.

#### 예시

- 먼저 person과 person이 속한 department를 다음처럼 정의했다.

```js
class Person {
  constructor(data) {
    this._name = data.name;
    this._department = new Department({chargeCode: data.chargeCode, department: data.department, manager: data.manager});
  }
  get name() { return this._name; }
  set name(arg) { this._name = arg; }
  get department() { return this._department; }
  set department(arg) { return (this._department = arg); }
}


class Department {
  constructor(data) {
    this._chargeCode = data.chargeCode;
    this._department = data.department;
    this._manager = data.manager;
  }
  get chargeCode() { return this._chargeCode; }
  set chargeCode(arg) { this._chargeCode = arg; }

  get manager() { return this._manager; }
  set manager(arg) { this._manager = arg; }
}
.
```

1. 클라이언트에서 어떤 사람이 속한 부서의 관리자를 알고 싶다고 하자. 그러기 위해선 부서 객체부터 얻어와야 한다.

```js
const person = new Person({name: 'bon', chargeCode: '123', department: 'rnd', manager: 'Mago'});
const manager = person.department.manager;
console.log(manager); //=> Mago
```

2. 이 경우, 클라이언트는 부서 클래스의 작동 방식, 즉 부서 클래스가 관리자 정보를 제공한다는 사실을 알고 있어야 한.

- 이러한 의존성을 줄이려면 클라이언트가 부서 클래스를 볼 수 없게 숨기고, 대신 사람 클래스에 간단한 위임 메서드를 만들면 된다.

3. 이제 모든 클라이언트가 이 메서드를 사용하도록 고친다.
4. 클라이언트 코드를 다 고쳤다면 person 클래스의 department() 접근자를 삭제한다.

```js

⬇ 리팩터링 후 ⬇

class Person {
  constructor(data) {
    this._name = data.name;
    this._department = new Department({chargeCode: data.chargeCode, department: data.department, manager: data.manager});
  }
  get name() { return this._name; }
  set name(arg) { this._name = arg; }
  //get department() { return this._department; } 삭제 (4번)
  set department(arg) { return (this._department = arg); }
  get manager() { return this._department.manager; } // 위임 메서드 추가 (2번)
}

const person = new Person({name: 'bon', chargeCode: '123', department: 'rnd', manager: 'Mago'});
const manager = person.manager; // person.department.manager => person.manager (3번)
```

## 7.8 중개자 제거하기

- 너무 많아진 위임 매서드를 제거하는 것.

#### 언제 중개자 제거하기를 사용할까?

- 내부 정보를 가능한 한 숨기고 밀접한 모듈과만 상호작용하여 결합도를 낮추자는 원칙으로 '위임 숨기기'와 같은 리팩터링을 적용했는데, 이 과정에서 위임 혹은 wrapper 매서드가 너무 늘어나는 등의 부작용이 생길 수 있다.
- 클라이언트가 위임 객체의 또 다른 기능을 사용하고 싶을 때마다 서버에 위임 메서드를 추가해야 하는데,
  이렇게 기능을 추가하다 보면 단순히 전달만 하는 위임 메서드들이 너무 많아진다. 그러면 서버 클래스는 그저 중재자(middle man)역할로 전락하여, 차라리 클라이언트가 위임 객체를 직접 호출하는게 나을 수도 있다.
- 위와 같은 상황에서 적절하게 중개자 제거하기를 사용한다.

```
💡 위임 숨기기와 중개자 제거하기를 적당히 섞어도 된다.
   자주 쓰는 위임은 그대로 두는 편이 클라이언트 입장에서 편하다. 상황에 맞게 처리하자.
```

#### 절차

1. 위임 객체를 얻는 게터를 만든다.
2. 위임 메서드를 호출하는 클라이언트가 모두 이 게터를 거치도록 수정한다. 하나식 바꿀 때마다 테스트한다.
3. 모두 수정했다면 위임 메서드를 삭제한다.

#### 예시

1. 먼저 위임 객체(department)를 얻는 게터를 만들자.
2. 각 클라이언트가 부서 객체를 직접 사용하도록 고친다.
3. 클라이언트를 모두 고쳤다면 Person의 manager()매서드를 삭제한다. Person에 단순한 위임 메서드가 더는 남지 않을 때까지 이 작업을 반복한다.

```js
class Person {
  constructor(data) {
    this._name = data.name;
    this._department = new Department({chargeCode: data.chargeCode, department: data.department, manager: data.manager});
  }
  get name() { return this._name; }
  set name(arg) { this._name = arg; }
  set department(arg) { return (this._department = arg); }
  get manager() { return this._department.manager; }
}

const person = new Person({name: 'bon', chargeCode: '123', department: 'rnd', manager: 'Mago'});
const manager = person.manager;

⬇ 리팩터링 후 ⬇

class Person {
  constructor(data) {
    this._name = data.name;
    this._department = new Department({chargeCode: data.chargeCode, department: data.department, manager: data.manager});
  }
  get name() { return this._name; }
  set name(arg) { this._name = arg; }
  get department() { return this._department; } //위임 객체 얻는 게터 추가(1번)
  set department(arg) { return (this._department = arg); }
  //get manager() { return this._department.manager; } // 위임 메서드 삭제(3번)
}

const manager = person.department.manager; //  person.manager => person.department.manager (2번)
```

## 7.9 알고리즘 교체하기

- 더 간명한 방법을 찾아내면 복잡한 기존 코드를 간명한 방식으로 고치는 것.
- 내 코드와 똑같은 기능을 제공하는 라이브러리를 찾았을 때도 마찬가지.
- 이 작업에 착수하려면 반드시 메서드를 가능한 한 잘게 나눴는지 확인한다.
- 거대하고 복잡한 알고리즘을 교체하기란 어려우니, 알고리즘을 간소화하는 작업부터 해야 교체가 쉬워진다.

#### 절차

1. 교체할 코드를 함수 하나에 모은다.
2. 이 함수만을 이용해 동작을 검증하는 테스트를 마련한다.
3. 대체할 알고리즘을 준비한다.
4. 정적 검사 수행.
5. 기존 알고리즘과 새 알고리즘의 결과를 비교하는 테스트를 수행한다. 두 결과가 같다면 리팩터링이 끝난다.
   그렇지 않다면 기존 알고리즘을 참고해서 새 알고리즘을 테스트하고 디버깅한다.

#### 예시

```js
export function foundPerson(people) {
  for (let i = 0; i < people.length; i++) {
    if (people[i] === 'Don') {
      return 'Don';
    }
    if (people[i] === 'John') {
      return 'John';
    }
    if (people[i] === 'Kent') {
      return 'Kent';
    }
  }
  return '';
}


⬇ 기존 함수 테스트 ⬇

const people = ['Harry', 'John', 'Kent'];
describe('founcPerson', () => {
  it('should return one of these names. : Don, John, Kent', () => {
    const old = foundPerson(people);
    assert.equal(old, 'John');
  });
});


⬇ 대체할 알고리즘 준비 ⬇

export function foundPersonNew(people) {
  const candiates = ['Don', 'John', 'Kent'];
  return people.find((p) => candiates.includes(p)) || '';
}


⬇ 기존 알고리즘과 새 알고리즘의 결과 비교하는 테스트 ⬇

const people = ['Harry', 'John', 'Kent'];
describe('founcPerson', () => {
  it('should return one of these names. : Don, John, Kent', () => {
    const old = foundPerson(people);
    assert.equal(old, 'John');
  });
  it('old and newFunc return value should be same.', () => {
    const old = foundPerson(people);
    const newfunc = foundPersonNew(people);
    assert.equal(old, newfunc);
  });
});

```
