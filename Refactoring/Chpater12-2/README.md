# Chapter 12. 상속 다루기

## 12.7 서브클래스 제거하기
> 더 이상 활용하지 않는 서브클래스를 발견하면 슈퍼클래스의 필드로 대체하여 제거하자.

* 팩터리 함수를 통해서 서브 클래스의 생성자를 대체한다. 
* 그런 다음 개별 서브 클래스를 하나씩 슈퍼클래스에 흡수시킨다.

### Code Example
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
        default: p = new Person(aRecord.name); break;
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



```js
```


```js
```


```js
```
