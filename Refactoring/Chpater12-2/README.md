# Chapter 12. 상속 다루기

## 12.7 서브클래스 제거하기
> 더 이상 활용하지 않는 서브클래스를 발견하면 슈퍼클래스의 필드로 대체하여 제거하자.

* 팩터리 함수를 통해서 서브 클래스의 생성자를 대체한다. 
* 그런 다음 개별 서브 클래스를 하나씩 슈퍼클래스에 흡수시킨다.

### Code Example
다음의 서브 클래스들을 살펴보자.
```js
class Person {
    constructor(name) {
        this._name = name;
    }
    get name()          {return this._name;}
    get genderCode()    {return "X";}
    // 생략
}

class Male extends Person {
    get genderCode()    {return "M";}
}

class Female extends Person {
    get genderCode()    {return "F";}
}

// 클라이언트 
const numberOfMales = people.filter(p => p instanceof Male).length;
```

서브 클래스가 하는 일이 이게 다라면 굳이 존재할 이유가 없다. 하지만 바로 제거하기 전에 이 클래스들을 사용하는 클라이언트가 있는지 살펴봐야 한다. <br>
그러고 난 후에는 서브클래스의 생성자를 팩토리 함수로 바꾸면서 리팩터링에 시작할 수 있다.

```js
function createPerson(aRecord)
    let p;
    switch (aRecord.gender) {
        case "M": p = new Male(aRecord.name); break;
        case "F": p = new Female(aRecord.name); break;
        default: p = new Person(aRecord.name);
    }
    return p;

function loadFromInput(data) {
    const result = [];
    data.forEach(aRecord => {
        result.push(createPerson(aRecord));
    });
    return result;
}

⬇ 깔끔히 청소하기 ⬇

function createPerson(aRecord) {
    switch (aRecord.gender) {
        case "M": return new Male(aRecord.name); break;
        case "F": return new Female(aRecord.name); break;
        default: return new Person(aRecord.name); break;
}

function loadFromInput(data) {
    return data.map(aRecord => createPerson(aRecord));
}
```

instanceof를 사용해서 타입을 검사하는 클라이언트 코드에서 악취가 나고 있다. 리팩터링 해주자.

```js
// 클라이언트
const numberOfMales = people.filter(p => isMale(p)).length;

function isMale(aPerson) {return aPerson instanceof Male;}

⬇ 추출한 함수 Person으로 옮기기 ⬇

// Person 클래스
get isMale() {return instance of Male;}

// 클라이언트
const numberOfMales = people.filter(p => p.isMale).length;
```

다음으로 서브 클래스의 차이를 나타낼 필드를 슈퍼 클래스에 추가하자. 생성자에서 매개변수를 받아서 설정하도록 작성한다.
```js
// Person 클래스
constructor(name, genderCode) {
        this._name = name;
        this._genderCode = genderCode || "X";
    }

    get genderCode()    {return this._genderCode;}
```

객체가 남성인지 판단하는 로직을 슈퍼클래스로 옮긴다. 이를 위해 팩토리 메서드에서도 Person을 반환하도록 수정하고 instanceof를 사용해 검사하던 코드는 성별 코드를 이용하도록 수정한다.

```js
function createPerson(aRecord) {
    switch (aRecord.gender) {
        case 'M': return new Person(aRecord.name, 'M');
        case 'F': return new Female(aRecord.name);
        default: return new Person(aRecord.name);
    }
}

// Person 클래스
get isMale() {return "M" === this._genderCode;}
```

테스트를 진행하며, 이와 같은 방식으로 서브클래스를 하나 씩 제거해나간다.

```js
function createPerson(aRecord) {
    switch (aRecord.gender) {
        case 'M': return new Person(aRecord.name, 'M');
        case 'F': return new Person(aRecord.name, 'F');
        default: return new Person(aRecord.name, 'X');
    }
}

// Person 클래스
constructor(name, genderCode) {
    this._name = name;
    this._genderCode = genderCode;
}
```
<br>

## 12.8 슈퍼클래스 추출하기

* 비슷한 일을 수행하는 두 클래스가 보이면 상속 메커니즘을 적극 활용하도록 하자. 
* 공통된 부분이 데이터이면 필드 올리기를 활용하고, 동작이라면 메서드 올리기를 활용하여 슈퍼 클래스를 추출하자.
* 중복이 되는 코드를 클래스 추출하기로도 해결할 수 있다. 이는 중복을 위임으로 해결하느냐, 또는 상속으로 해결하느냐에 따라 달라지게 된다. <br> 
슈퍼클래스 추출하기 방법이 더 간단한 경우가 많다.

### Code Example
다음의 두 클래스에서 공통된 기능을 슈퍼클래스 추출하는 기법을 통해 리팩터링 해보자.
```js
class Employee{
    constructor(name, id, monthlyCost) {
        this._id = id;
        this._name = name;
        this._monthlyCost = monthlyCost;
    }
    get monthlyCost() {return this._monthlyCost;} // 월간 비용
    get name() {return this._name} // 이름
    get id() {return this._id}

    get annualCost() {      // 연간 비용  
        return this._monthlyCost * 12;
    }
}

class Department {
    constructor(name, staff) {
        this._name = name;
        this._staff = staff;
    }
    get staff() {return this._staff.slice();}
    get name() {return this._name;} // 이름

    get totalMonthlyCost() {    // 총 월간 비용
        return this._staff
            .map(e => e.monthlyCost)
            .reduce((sum, cost) => sum + cost);
    }
    get headCount() {
        return this.staff.length;
    }
    get totalAnnualCost() {     // 총 연간 비용
        return this.totalMonthlyCost * 12;
    }
}
```

공통된 성질과 동작을 포함시킬 슈퍼클래스를 생성하고, 두 클래스가 이를 확장하도록 한다.

```js
class Party {}

class Employee extends Party {
    constructor(name, id, monthlyCost) {
        super();
        this._id = id;
        this._name = name;
        this._monthlyCost = monthlyCost;
    }
    // 생략 ...
}

class Department extends Party {
    constructor(name, staff) {
        super();
        this._name = name;
        this._staff = staff;
    }
    // 생략 ...
}
```

데이터들을 먼저 필드 올리기 기법으로 슈퍼클래스로 옮겨보자. 이때 생성자를 수정해야 한다. 그러고 나서 관련된 메서드를 올리는 리팩터링을 해보겠다.

```js
// Party 클래스 ...
constructor(name) {
    this._name = name;
}

get name() {return this._name;}

// Employee 클래스 ...
constructor (name, id, monthlyCost) {
    super(name);
    this._id = id;
    this._monthlyCost = monthlyCost;
}
// get name() 함수 삭제

// Department 클래스 ...
constructor (name, staff) {
    super(name);
    this._staff = staff;
}
// get name() 함수 삭제
```

그 다음으로 구현 로직이 비슷한 연간 비용을 계산하는 로직을 슈퍼클래스에서 구현해보자. 그 전에 서브클래스의 함수 명칭을 통일시켜주자. 

```js
// Department 클래스 ...
get annualCost() {
    return this.monthlyCost * 12;
}

get monthlyCost() {...}

// Party 클래스 ...
get annualCost() {
    return this.monthlyCost * 12;
}
```

<br>

## 12.9 계층 합치기

* 클래스 계층구조를 리팩터링하다 보면 기능들을 위로 올리거나 아래로 내리는 일은 다반사로 벌어진다.
* 어떤 클래스가 부모 클래스와 너무 비슷해져서 더는 독립적으로 존재해야 할 이유가 사라질 경우에는 둘을 하나로 합쳐라.

<br>

## 12.10 서브클래스를 위임으로 바꾸기



<br>

## 12.11 슈퍼클래스를 위임으로 바꾸기
```js
```

```js
```


```js
```


```js
```
