# 8 기능 이동 (8.1 ~ 8.4)

## 8.1 함수 옮기기

> 모듈성을 높이려면 연관된 요소를 묶고, 요소간 관계를 쉽게 찾고 이해할수 있어야 한다

- 자신이 속한 모듈 A의 요소들 보다 다른 모듈 B의 요소들을 더 많이 참조할 경우
- 다른 함수 안에서 도우미 역할로 정의된 함수 중 독립적으로도 가치가 있는 함수일 경우

#### 함수를 옮길까 말까 고민될때?!

- 대상 함수를 호출하는 함수들은 무엇인지, 대상 함수가 호출하는 함수들은 또 무엇이 있는지, 대상 함수가 사용하는 데이터는 무엇인지를 살펴봐야 한다.

### 절차

1. 선택한 함수가 현재 컨텍스트에서 사용 중인 모든 프로그램 요소를 살펴본다. 이 요소들 중에도 함께 옮겨야 할 게 있는지 고민해본다.
   - 함께 옮길 함수가 있다면 그 함수를 먼저 옮기는게 낫다
   - 영향이 적은 함수부터 옮기자
2. 선택한 함수가 다형 메서드인지 확인한다.
3. 선택한 함수를 타깃 컨텍스트로 복사 후 다듬기
4. 정적 분석 수행
5. 소스 컨텍스트에서 타깃 함수를 참조할 수 있게 반영
6. 소스 함수를 타깃 함수의 위임 함수가 되도록 수정
7. 테스트
8. 소스 함수를 인라인(6.2)할지 고민해본다.

```js
class Account {
    get overdraftCharge() { ... }
}

⬇ 리팩터링 후 ⬇

class Account {
    get overdraftCharge() {
    return this.type.overdraftCharge()
    }
}

class AccountType {
    get overdraftCharge() { ... }
}
```

#### 중첩 함수를 최상위로 옮기기

```js
function trackSummary(points) {
  const totalTime = calculateTime();
  const totalDistance = calculateDistance();
  const pace = totalTime / 60 / totalDistance;
  return {
      time: totalTime,
      distance: totalDistance,
      pace: pace
  };

  function calculateDistance() { // 총 거리 계산
    let result = 0;
    for (let i = 1; i < points.length; i++) {
        result += distance(points[i-1], points[i]);
    }
    return result;
  }

  function distance(p1, p2) { ... } // 두 지점의 거리 계산
  function radians(degrees) { ... } // 라디안 값으로 변환
  function calculateTime() { ... } // 총 시간 계산
}

⬇ 최상위 복사 후 ⬇

function trackSummary(points) {
  const totalTime = calculateTime();
  const totalDistance = calculateDistance();
  const pace = totalTime / 60 / totalDistance;
  return {
      time: totalTime,
      distance: totalDistance,
      pace: pace
  };

  function calculateDistance() {
    let result = 0;
    for (let i = 1; i < points.length; i++) {
        result += distance(points[i-1], points[i]);
    }
    return result;

    function distance(p1, p2) { ... } // 함수 내 radians 만 사용하고 있음.
    function radians(degrees) { ... } // 컨텍스트(trackSummary)의 어떤것도 사용하지 않음
  }

  function calculateTime() { ... }
}

function new_calculateDistance(points) {
  let result = 0;
  for (let i = 1; i < points.length; i++) {
    // distance 함수가 함께 옮겨야 합리적인지 판단
    result += distance(points[i-1], points[i]);
  }
  return result;

  function distance(p1, p2) { ... }
  function radians(degrees) { ... }
}

⬇ 위임 함수로 수정 후 ⬇

function trackSummary(points) {
  const totalTime = calculateTime();
  const totalDistance = calculateDistance();
  const pace = totalTime / 60 / totalDistance;
  return {
      time: totalTime,
      distance: totalDistance,
      pace: pace
  };

  function calculateDistance() {
    return new_calculateDistance(points)
  }

  function calculateTime() { ... }
}

function new_calculateDistance(points) { ... }

⬇ 변수 인라인 후 ⬇

function trackSummary(points) {
  const totalTime = calculateTime();
  const pace = totalTime / 60 / totalDistance(points);
  return {
      time: totalTime,
      distance: totalDistance(points),
      pace: pace
  };

  function calculateTime() { ... }
}

function totalDistance(points) { ... }

⬇ 이외의 중첩함수 함수 옮기기 후 ⬇

// distance, radians -> totalDistance 안의 의존하지 않아 최상위로 옮긴다
function trackSummary(points) { ... }
function totalDistance(points) { ... }
function distance(p1, p2) { ... }
function radians(degrees) { ... }
```

✧ 중첩함수는 데이터 의존성이 높아질수 있으니 되도록 만들지 말것!

---

저자는 중첩함수를 되도록 사용하지 말라고 했지만 중첩함수를 사용함으로써 장점도 있다고 합니다! 여러분들의 의견이 궁금합니다!

[중첩함수를 애용하자](https://siyoon210.tistory.com/162)

---

#### 다른 클래스로 옮기기

```js
class Account {
    get bankCharge() { // 은행 이자 계산
        let result = 4.5;
        if (this._daysOverdrawn > 0) result += this.overdraftCharge;
        return result;
    }

    get overdraftCharge() { // 초과 인출 이자 계산
        if (this.type.isPremium) {
            const baseCharge = 10;
            if (this._daysOverdrawn <= 7)
                return baseCharge;
            else
                return baseCharge + (this.daysOverdrawn - 7) * 0.85;
        }
        else
            return this.daysOverdrawn * 1.75
    }
}

class AccountType { ... }

⬇ 함수 옮기기 후 ⬇

class Account {
    get bankCharge() {
        let result = 4.5;
        if (this._daysOverdrawn > 0) result += this.overdraftCharge;
        return result;
    }

    get overdraftCharge() {
        if (this.type.isPremium) {
            const baseCharge = 10;
            if (this._daysOverdrawn <= 7)
                return baseCharge;
            else
                return baseCharge + (this.daysOverdrawn - 7) * 0.85;
        }
        else
            return this.daysOverdrawn * 1.75
    }
}

class AccountType {
    // 함께 옮겨야할 함수인지 확인 (daysOverdrawn) -> 기존 유지
    overdraftCharge(daysOverdrawn) {
        if (this.isPremium) {
            const baseCharge = 10;
            if (daysOverdrawn <= 7)
                return baseCharge;
            else
                return baseCharge + (daysOverdrawn - 7) * 0.85;
        }
        else
            return daysOverdrawn * 1.75
    }
}

⬇ 위임 함수로 수정 후 ⬇

class Account {
    get bankCharge() {
        let result = 4.5;
        if (this._daysOverdrawn > 0) result += this.overdraftCharge;
        return result;
    }

    get overdraftCharge() {
        return this.type.overdraftCharge(this.daysOverdrawn)
    }
}

class AccountType { ... }

⬇ 메서드 인라인 후 ⬇

class Account {
    get bankCharge() {
        let result = 4.5;
        if (this._daysOverdrawn > 0)
            result += this.type.overdraftCharge(this.daysOverdrawn);
        return result;
    }
}

class AccountType { ... }
```

---

## 8.2 필드 옮기기

> 데이터 구조의 수정! \
> 적합한 데이터 구조를 활용하면 단순하고 직관적인 코드 작성됨

- 함수에 어떤 레코드를 넘길 때마다 또 다른 레코드의 필드도 함께 넘기고 있을 때
- 한 레코드를 변경 할 때 다른 레코드의 필드까지 변경해야 할 때
- 구조체 여러 개에 정의된 똑같은 필드들을 갱신해야 할 때

✧ 레코드 뿐만 아니라 **클래스**, **객체**도 같은 이치

### 절차

1. 소스 필드가 캡슐화되어 있지 않다면 캡슐화 진행
2. 테스트
3. 타깃 객체에 필드(와 접근자 메서드들)을 생성
4. 정적 검사 수행
5. 소스 객체에서 타깃 객체를 참조할 수 있는지 확인
6. 접근자들이 타깃 필드를 사용하도록 수정
7. 테스트
8. 소스 필드를 제거
9. 테스트

```js
class Customer {
    get plan() {
        return this._plan;
    }

    get discountRate() {
        return this._discountRate
    }
}

⬇ 리팩터링 후 ⬇

class Customer {
    get plan() {
        return this._plan;
    }

    get discountRate() {
        return this.plan.discountRate
    }
}
```

```js
class Customer {
    constructor(name, discountRate){
        this._name = name;
        this._discountRate = discountRate;
        this._contract = new CustomerContract(dateToday());
    }

    // CustomerContract로 이동예정
    get discountRate() { return this._discountRate }

    becomePreferred() {
        this._discountRate += 0.03;
        // ...
    }
    applyDiscount(amount) {
        return amount.subtract(amount.multiply(this._discountRate));
    }
}

class CustomerContract {
    constructor(startDate){
        this._startDate = startDate;
    }
}

⬇ 필드 옮기기 후 ⬇

class Customer {
    constructor(name, discountRate){
        this._name = name;
        this._contract = new CustomerContract(dateToday());
        this._setDiscountRate(discountRate);
    }

    get discountRate() { return this._contract.discountRate }
    _setDiscountRate(aNumber) { this._contract.discountRate = aNumber; }

    becomePreferred() {
        this._setDiscountRate(this.discountRate + 0.03);
        // ...
    }
    applyDiscount(amount) {
        return amount.subtract(amount.multiply(this.discountRate));
    }
}

class CustomerContract {
    constructor(startDate, discountRate){
        this._startDate = startDate;
        this._discountRate = discountRate;
    }

    get discountRate() { return this._discountRate; }
    set discountRate(arg) { this._discountRate = arg; }
}
```

#### 공유 객체로 이동하기

```js
class Account {
    constructor(number, type, interestRate){
        this._number = number;
        this._type = type;
        this._interestRate = interestRate;
    }

    get interestRate() { return this._interestRate; }
}

class AccountType {
    constructor(nameString){
        this._name = nameString;
    }
}

⬇ 필드 옮기기 후 ⬇

class Account {
    constructor(number, type){
        this._number = number;
        this._type = type;
    }

    get interestRate() { return this._type.interestRate; }
}

class AccountType {
    constructor(nameString, interestRate){
        this._name = nameString;
        this._interestRate = interestRate;
    }

    get interestRate() { return this._interestRate; }
}
```

---

## 8.3 문장 함수로 옮기기

- 특정 함수를 호출할때 앞, 뒤에서 똑같은 코드가 실행될 때
- 피호출 함수와 한 몸은 아니지만, 여전히 함께 호출되어야 할 경우
  - 문장들과 피호출 함수를 합쳐서 함수로 추출한다.

### 절차

1. 반복 코드가 함수 호출과 멀리 떨어져 있다면 문장 슬라이드하기(8.6)를 적용해 근처로 이동
2. 타깃 함수 호출하는 곳이 한 곳뿐이면, 소스 위치에서 피호출 함수로 코드 복사 후 테스트한다. (이 경우하면 나머지 단계는 무시한다.)
3. 호출자가 둘 이상이면 호출자 중 하나에서 '타깃 함수 호출 부분과 그 함수로 옮기려는 문장등을 함께' 다른 함수로 추출(6.1)한다. (임시 이름 사용)
4. 모든 호출자가 방금 추출한 함수를 사용하도록 수정. 하나씩 수정할 때마다 테스트한다.
5. 원래 함수를 새로운 함수 안으로 인라인(6.2)한 후 원래 함수 제거
6. 새로운 함수의 이름을 원래 함수의 이름으로 바꿔준다(6.5). (더 나은 이름이 있다면 그 이름을 쓴다)

```js
result.push(`<p>제목: ${person.photo.title}</p>`)
result.concat(photoData(person.photo))

function photoData(aPhoto) {
    return [
    `<p>위치: ${aPhoto.location}</p>`,
    `<p>날짜: ${aPhoto.date.toDateString()}</p>`,
    `<p>태그: ${aPhoto.tag}</p>`,
    ]
}

⬇ 리팩터링 후 ⬇

result.concat(photoData(person.photo))

function photoData(aPhoto) {
    return [
    `<p>제목: ${aPhoto.title}</p>`,
    `<p>위치: ${aPhoto.location}</p>`,
    `<p>날짜: ${aPhoto.date.toDateString()}</p>`,
    `<p>태그: ${aPhoto.tag}</p>`,
    ]
}
```

```js
//emitPhotoData 호출 전 제목을 출력하는 문장이 반복됨
function renderPerson(outStream, person) {
    const result = [];
    result.push(`<p>${person.name}</p>`);
    result.push(renderPhoto(person.photo));
    result.push(`<p>제목: ${person.photo.title}</p>`);
    result.push(emitPhotoData(person.photo));
    return result.join("\n");
}

function photoDiv(p) {
    return [
        "<div>",
        `<p>제목: ${p.title}</p>`,
        emitPhotoData(p),
        "</div>",
    ].join("\n");
}

function emitPhotoData(aPhoto) {
    const result = [];
    result.push(`<p>위치: ${aPhoto.location}</p>`);
    result.push(`<p>날짜: ${aPhoto.date.toDateString()}</p>`);
    return result.join("\n");
}

⬇ 코드 복사 후 ⬇

function renderPerson(outStream, person) {
    const result = [];
    result.push(`<p>${person.name}</p>`);
    result.push(renderPhoto(person.photo));
    result.push(newTestFunction(person.photo));
    return result.join("\n");
}

function photoDiv(p) {
    return [
        "<div>",
        newTestFunction(p),
        "</div>",
    ].join("\n");
}

function newTestFunction(p) {
    return [
        `<p>제목: ${p.title}</p>`,
        emitPhotoData(p),
    ].join("\n");
}

function emitPhotoData(aPhoto) {
    const result = [];
    result.push(`<p>위치: ${aPhoto.location}</p>`);
    result.push(`<p>날짜: ${aPhoto.date.toDateString()}</p>`);
    return result.join("\n");
}

⬇ 함수 인라인 후 ⬇

function renderPerson(outStream, person) {
    const result = [];
    result.push(`<p>${person.name}</p>`);
    result.push(renderPhoto(person.photo));
    result.push(emitPhotoData(person.photo));
    return result.join("\n");
}

function photoDiv(aPhoto) {
    return [
        "<div>",
        emitPhotoData(aPhoto),
        "</div>",
    ].join("\n");
}

//newTestFunction으로 emitPhotoData 인라인 후 이름 변경
function emitPhotoData(p) {
    return [
        `<p>제목: ${p.title}</p>`,
        `<p>위치: ${p.location}</p>`,
        `<p>날짜: ${p.date.toDateString()}</p>`,
    ].join("\n");
}
```

---

## 8.4 문장을 호출한 곳으로 옮기기

- 둘 이상의 기능이 있는 함수 중 일부 변경이 필요할 때

### 절차

1. 호출자가 한두 개뿐이고 피호출 함수도 간단한 단순한 상황이면, 피호출 함수의 처음(혹은 마지막)줄(들)을 잘라내어 호출자(들)로 복사해 넣는다(필요하면 적당히 수정한다). 테스트만 통과하면 이번 리팩토링은 여기서 끝이다.
2. 더 복잡한 상황에서는, 이동하지 '않길' 원하는 모든 문장을 함수로 추출(6.1)한 다음 임시 이름을 지어준다.
3. 원래 함수를 인라인(6.2)한다.
4. 추출된 함수의 이름을 원래 함수의 이름으로 변경한다(6.5). (더 나은 이름이 있다면 그 이름을 쓴다)

```js
emitPhotoData(outStream, person.photo)

function emitPhotoData(outStream, photo) {
    outStream.write(`<p>제목: ${photo.title}</p>\n`)
    outStream.write(`<p>위치: ${photo.location}</p>\n`)
}

⬇ 리팩터링 후 ⬇

emitPhotoData(outStream, person.photo)
outStream.write(`<p>위치: ${person.photo.location}</p>\n`)

function emitPhotoData(outStream, photo) {
    outStream.write(`<p>제목: ${photo.title}</p>\n`)
}
```

#### 호출자가 둘뿐인 단순상황

```js
function renderPerson(outStream, person) {
    outStream.write(`<p>${person.name}</p>\n`);
    renderPhoto(outStream, person.photo);
    emitPhotoData(outStream, person.photo);
}

function listRecentPhotos(outStream, photos) {
    photos
    .filter(p => p.data > recentDateCutoff())
    .forEach(p => {
        outStream.write("<div>\n");
        emitPhotoData(outStream, p);
        outStream.write("</div>\n");
    });
}

function emitPhotoData(outStream, photo) {
    outStream.write(`<p>제목: ${photo.title}</p>\n`);
    outStream.write(`<p>날짜: ${photo.date.toDateString()}</p>\n`);
    outStream.write(`<p>위치: ${photo.location}</p>\n`);
}

⬇ 이동하지 않을 함수 추출 후 ⬇

function renderPerson(outStream, person) {
    outStream.write(`<p>${person.name}</p>\n`);
    renderPhoto(outStream, person.photo);
    emitPhotoData(outStream, person.photo);
}

function listRecentPhotos(outStream, photos) {
    photos
    .filter(p => p.data > recentDateCutoff())
    .forEach(p => {
        outStream.write("<div>\n");
        emitPhotoData(outStream, p);
        outStream.write("</div>\n");
    });
}

function emitPhotoData(outStream, photo) {
    notMoving(outStream, photo)
    outStream.write(`<p>위치: ${photo.location}</p>\n`);
}

function notMoving(outStream, photo) {
    outStream.write(`<p>제목: ${photo.title}</p>\n`);
    outStream.write(`<p>날짜: ${photo.date.toDateString()}</p>\n`);
}

⬇ 피호출 함수 인라인 후 ⬇

function renderPerson(outStream, person) {
    outStream.write(`<p>${person.name}</p>\n`);
    renderPhoto(outStream, person.photo);
    notMoving(outStream, person.photo);
    outStream.write(`<p>위치: ${person.photo.location}</p>\n`);
}

function listRecentPhotos(outStream, photos) {
    photos
    .filter(p => p.data > recentDateCutoff())
    .forEach(p => {
        outStream.write("<div>\n");
        notMoving(outStream, p);
        outStream.write(`<p>위치: ${p.location}</p>\n`);
        outStream.write("</div>\n");
    });
}

function emitPhotoData(outStream, photo) {
    notMoving(outStream, photo)
    outStream.write(`<p>위치: ${photo.location}</p>\n`);
}

function notMoving(outStream, photo) {
    outStream.write(`<p>제목: ${photo.title}</p>\n`);
    outStream.write(`<p>날짜: ${photo.date.toDateString()}</p>\n`);
}

⬇ 원래함수 지우기 + 임시함수 이름 수정 후 ⬇

function renderPerson(outStream, person) {
    outStream.write(`<p>${person.name}</p>\n`);
    renderPhoto(outStream, person.photo);
    emitPhotoData(outStream, person.photo);
    outStream.write(`<p>위치: ${person.photo.location}</p>\n`);
}

function listRecentPhotos(outStream, photos) {
    photos
    .filter(p => p.data > recentDateCutoff())
    .forEach(p => {
        outStream.write("<div>\n");
        emitPhotoData(outStream, p);
        outStream.write(`<p>위치: ${p.location}</p>\n`);
        outStream.write("</div>\n");
    });
}
//notMoving -> emitPhotoData
function emitPhotoData(outStream, photo) {
    outStream.write(`<p>제목: ${photo.title}</p>\n`);
    outStream.write(`<p>날짜: ${photo.date.toDateString()}</p>\n`);
}
```
