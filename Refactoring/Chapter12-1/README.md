# 12 상속 다루기

## 12.1 메서드 올리기 (Pull Up Method)

- 여러 서브클래스에 중복된 메서드가 많은 경우 상위 클래스로 메서드를 올려 상속받도록 하는 기법

#### 언제 메서드 올리기를 사용할까?

- 무언가 중복되었다는 것은 한쪽의 변경이 다른 쪽에는 반영되지 않을 수 있다는 위험을 수반한다.
- 때문에 이러한 중복을 발견했을 때 메서드 올리기를 적용하여 중복을 제거한다.

#### 절차

1. 똑같이 동작하는 메서드인지 확인하기.
2. 메서드 안에서 호출하는 다른 메서드와 참조하는 필드들을 슈퍼클래스에서도 호출하고 참조할 수 있는지 체크.
3. 메서드 시그니처가 다르다면 함수 선언 바꾸기로 슈퍼클래스에서 사용하고 싶은 형태로 통일.
4. 슈퍼클래스에 새로운 메서드 생성 후 대상 메서드의 코드를 복사해 넣는다.
5. 서브클래스 중 하나의 메서드 제거 -> 테스트
6. 모든 서브클래스의 메서드가 없어질 때까지 다른 서브클래스의 메서드를 하나씩 제거.

#### 토막 지식 : 메소드 시그니처란❓

```
메소드 시그니처(method signature)
메소드 오버로딩의 핵심은 바로 메소드 시그니처(method signature)에 있습니다.

메소드 시그니처란 메소드의 선언부에 명시되는 매개변수의 리스트를 가리킵니다.
만약 두 메소드가 매개변수의 개수와 타입, 그 순서까지 모두 같다면,
이 두 메소드의 시그니처는 같다고 할 수 있습니다.

[출처] : http://www.tcpschool.com/java/java_usingMethod_overloading
```

#### 예시 1.

```js

1. Employee & Department class의 메소드가 똑같이 동작하는 메서드인임

class Party {
    //something..
}

class Employee extends Party {
  get annualCost() {
    return this.monthlycost * 12;
  }
}

class Department extends Party {
  get totalAnnualCost() {
    return this.monthlyCost * 12;
  }
}

3. 두 메서드의 이름이 다르므로 함수 선언 바꾸기로 이름 통일
class Employee extends Party {
  get annualCost() {
    return this.monthlycost * 12;
  }
}

class Department extends Party {
  get annualCost() { //변경
    return this.monthlyCost * 12;
  }
}

4. 슈퍼클래스에 서브클래스의 메소드 붙여넣기
5. 서브클래스 중 하나의 메서드 제거 -> 테스트 > 위 과정 반복
** 이 때 서브클래스에 monthlyCost가 없으면 에러를 던지도록 함정 메서드를 만들어두면 유용하다. **

class Party {
  get monthlyCost(){
    throw new SubclassResponsibilityError();
  }
    get annualCost() {
    return this.monthlyCost * 12;
  }
}

class Employee extends Party {
  //something else..
}

class Department extends Party {
  //something else..
}

```

---

## 12.2 필드 올리기 (Pull Up Field)

- 서브 클래스들의 필드가 중복되었을 때 해당 필드를 슈퍼클래스로 옮김으로써
- 데이터의 중복 선언을 없애고 해당 필드를사용하는 동작을 슈퍼클래스로 옮기는 기법.

#### 언제 필드 올리기를 사용할까?

- 서브 클래스들의 필드가 중복되었을 때 또는, 비슷한 방식으로 쓰이는 필드들이 있을 때 사용한다.

#### 절차

1. 후보 필드들을 사용하는 곳 모두가 그 필드들을 똑같은 방식으로 사용하는지 체크.
2. 필드들의 이름이 다르다면 똑같은 이름으로 바꾼다.
3. 슈퍼클래스에 새로운 필드 생성.

- 이 때 서브클래스에서 이 필드에 접근할 수 있도록 만든다. (ex: protected로 선언)

4. 서브클래스의 필드들 제거 -> 테스트.

#### 예시

```js
class Employee {...}

class SalesePerson extends Employee{
  private String name;
}

class Engineer extends Employee{
  private String name;
}

⬇ 리팩터링 후 ⬇

class Employee {
  protected String name;
}

class SalesePerson extends Employee{...}

class Engineer extends Employee{...}

```

---

## 12.3 생성자 본문 올리기 (Pull Up Constructor Body)

- 공통된 필드를 초기화 하는 생성자를 슈퍼클래스로 옮기는 기법

#### 언제 생성자 본문 올리기를 사용할까?

- 서브클래스들이 공통 필드를 각각 초기화 하고 있음을 발견했을 때 사용.

#### 절차

1. 슈퍼클래스에 생성자가 없다면 하나 정의하고, 서브클래스의 생성자들에서 이 생성자가 호출되는지 체크.
2. 문장 슬라이드하기로 공통 문장 모두를 `super()`호출 직후로 옮긴다.
3. 공통 코드를 슈퍼클래스에 추가하고, 서브클래스에서는 제거한다. 생성자 매개변수 중 공통 코드에서 참조하는 값들을 모두 super()로 건넨다. -> 테스트
4. 생성자 시작 부분으로 옮길 수 없는 공통 코드에는 함수 추출하기와 메서드 옮기기를 차례로 적용한다.

####예시 1.

```js
// this._name = name; 이 공통 코드를 올려보자.

class Party {

}

class Employee extends Party {
  constructor(name, id, monthlyCost) {
    super();
    this._id = id;
    this._name = name;
    this._monthlyCost = monthlyCost;
  }
}

class Department extends Party {
  constructor(name, staff) {
    super();
    this._name = name;
    this._staff = staff;
  }
}

⬇ 리팩터링 후 ⬇

class Party {
  constructor(name) {
    this._name = name;
  }
}

class Employee extends Party {
  constructor(name, id, monthlyCost) {
    super(name);
    this._id = id;
    this._monthlyCost = monthlyCost;
  }
}

class Department extends Party {
  constructor(name, staff) {
    super(name);
    this._staff = staff;
  }
}

```

#### 예시 2.

- 생성자는 대부분 (`super()`를 호출하여) 공통 작업을 먼저 처리 후,
- 각 서브클래스에 필요한 추가 작업을 처리하는 식으로 동작하는데, 이따금 공통 작업이 뒤에 오는 경우가 있다.
- 아래 예시에서 `isPrivilieged()`는 `grade`필드에 값이 대입된 후에야 호출될 수 있고, 서브클래스만이 이 필드에 값을 대입할 수 있다.
- 이런 경우라면 먼저 공통 코드를 함수로 추출한다.

```js
class Employee extends Party {
  constructor(name) {
    this._name = name;
  }
  get isPrivilieged() {...}
  assignCar() {...}
}


class Manager extends Employee {
  constructor(name,grade) {
    super(name);
    this._grade = grade;
    if (this.isPrivilieged) this.assignCar(); //이 부분이 모든 서브클래스의 공통 작업이라고 가정.
  }

  get isPrivilieged() {
    return this._grade > 4;
  }
}

⬇ 리팩터링 후 ⬇

class Employee extends Party {
  constructor(name, grade) {
    this._name = name;
    this._grade = grade;
    this.finishConstruction();
  }

  finishConstruction() {
    if (this.isPrivilieged) this.assignCar();
  }
  get isPrivilieged() {...}
  assignCar() {...}
}

class Manager extends Employee {
  constructor(name, grade) {
    super(name, grade);
  }
}

```

---

## 12.4 메서드 내리기 (Pull Down Method)

- 특정 서브클래스 하나와만 관련된 메서드가 슈퍼클래스에 있을 때, 해당 메서드를 서브클래스로 내리는 기법.

#### 언제 메서드 내리기를 사용할까?

- 해당 기능을 제공하는 서브클래스가 정확히 무엇인지 호출자가 알고 있을 때만 적용해야 함.

#### 절차

1. 대상 메서드를 모든 서브클래스에 복사한다.
2. 슈퍼클래스에서 그 메서드를 제거 -> 테스트
3. 이 메서드를 사용하지 않는 모든 서브클래스에서 제거한다. -> 테스트.

```js

class Employee {
  get quota {...}
}

class Engineer extends Employee {...}
class Salesperson extends Employee {...}

⬇ 리팩터링 후 ⬇

class Employee {...}

class Engineer extends Employee {...}
class Salesperson extends Employee {
  get quota {...}
}

```

---

## 12.5 필드 내리기 (Pull Down Field)

- 슈퍼클래스의 필드를 서브클래스로 내리는 기법.

#### 언제 메서드 내리기를 사용할까?

- 특정 서브클래스에서만 사용되는 필드를 발견했을 때.

#### 절차

1. 대상 필드를 모든 서브클래스에 정의한다.
2. 슈퍼클래스에서 그 필드를 제거 -> 테스트
3. 이 필드를 사용하지 않는 모든 서브클래스에서 제거. -> 테스트

```js
class Employee {
  private String quota;
}

class Engineer extends Employee{...}
class Salesperson extends Employee{...}

⬇ 리팩터링 후 ⬇

class Employee {...}

class Engineer extends Employee{...}
class Salesperson extends Employee{
  protected String quota;
}
```

---

## 12.6 타입 코드를 서브클래스로 바꾸기 (Replace Type Code with Subclasses)

- 비슷한 대상들을 특정 특성에 따라 구분해야 할 때 타입별 서브클래스를 만들어주는 기법.

#### 언제 이 기법을 사용할까?

- 타입 별 동작이 달라져야 하는 경우, 타입 별 서브클래스를 만들어 각 타입 별 객체가 하는 일을 명확하게 만들어 줄 수 있다.

#### 절차

1. 타입 코드 필드를 자가 캡슐화한다.
2. 타입 코드 값 하나를 선택하여 그 값에 해당하는 서브클래스를 만든다.
   타입 코드 게터 메서드를 오버라이드하여 해당 타입 코드의 리터럴 값을 반환하게 한다.
3. 매개변수로 받은 타입 코드와 방금 만든 서브클래스를 매핑하는 선택 로직을 만든다.

- 직접 상속일 때 : 생성자를 팩터리 함수로 바꾸기를 적용하고 선택 로직을 팩터리에 넣는다.
- 간접 상속일 때 : 선택 로직을 생성자에 둔다.

4. 테스트 후 타입 코드 값 각각에 대해 서브클래스 생성과 선택 로직 추가를 반복한다. -> 테스트
5. 타입 코드 필드 제거. -> 테스트
6. 타입 코드 접근자를 이용하는 메서드 모두에 메서드 내리기와 조건부 로직을 다형성으로 바꾸기를 적용한다.

#### 예시 1. 직접 상속일 때

```js
class Employee {
  constructor(name, type) {
    this.validateType(type);
    this._name = name;
    this._type = type;
  }

  validateType(arg) {
    if (!['engineer', 'manager'].includes(arg)) throw new Error(`${arg}라는 직원 유형은 없습니다.`);
  }

  toString() {
    return `${this._name} (${this._type})`;
  }
}

⬇ 리팩터링 후 ⬇

class Employee {
  constructor(name) {
    this._name = name;
  }

  toString() {
    return `${this._name} (${this.type})`;
  }
}

class Engineer extends Employee {
  get type() {
    return 'engineer';
  }
}
.
.
.

function createEmployee(name, type) {
  switch (type) {
    case 'engineer': return new Engineer(name);
    case 'manager': return new Manager(name);
  }
}

```

#### 예시 2. 간접 상속일 때

```js
class Employee {
  constructor(name, type) {
    this.validateType(type);
    this._name = name;
    this._type = type;
  }

  validateType(arg) {
    if (!['engineer', 'manager'].includes(arg)) throw new Error(`${arg}라는 직원 유형은 없습니다.`);
  }

  get type() {return this._type;}

  set type(arg) {this._type = arg;}

  get capitalizedType() {
    return this._type.charAt(0).toUpperCase() + this._type.substr(1).toLowerCase();
  }

  toString() {
    return `${this._name} (${this.capitalizedType})`;
  }
}

⬇ 리팩터링 후 ⬇
//각 타입이 다른 인스턴스는, get type을 통해 해당 type에만 있는 기능을 호출 할 수 있게 됨

class Employee {
  constructor(name, type) {
    this.validateType(type);
    this._name = name;
    this._type = type;
  }

  validateType(arg) {
    if (!['engineer', 'manager'].includes(arg)) throw new Error(`${arg}라는 직원 유형은 없습니다.`);
  }

  get typeString() {return this._type.toString();}

  get type() {return this._type;}

  set type(arg) {this._type = Employee.createEmployeeType(arg);}

  static createEmployeeType(aString) {
    switch (aString) {
      case 'engineer':
        return new Engineer();
      case 'manager':
        return new Manager();
      default:
        throw new Error(`${aString}라는 직원 유형은 없습니다.`);
    }
  }

  get capitalizedType() {
    return this.typeString.charAt(0).toUpperCase() + this.typeString.substr(1).toLowerCase();
  }

  toString() {
    return `${this._name} (${this.capitalizedType})`;
  }


```
