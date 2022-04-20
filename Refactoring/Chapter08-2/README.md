# 기능 이동

모듈과 기능 이동



## 인라인 코드를 함수 호출로 바꾸기

> 인라인 코드를 대체할 함수가 이미 존재하고 있는 상황에서의 리팩토링  

```js
// bad
let appliesToMass = false
for (const s of states) {
  if (s === 'MA') appliesToMass = true
}

// good
appliesToMass = states.includes('MA')
```

함수를 쓰면 좋은 점
1. 여러 동작을 하나로 묶어준다.
2. 함수 이름으로 코드 이해가 쉬워진다.
3. 중복도 없애준다.

이미 존재하는 함수와 똑같은 일을 하는 코드를 발견하면 보통은 함수 호출로 대체하길 원할 것이다.

인라인 코드를 함수로 바꾸지 않아야하는 경우도 있다.  
같은 기능을 하는 함수를 수정하더라도 이 코드의 동작은 바뀌지 않아야 할 때이다.

이런 케이스인지 어떻게 판단하는가?  
-> 인라인 코드에 이미 존재하는 함수 이름을 넣었을 때 말이 되지 않는 경우



---



## 문장 슬라이드하기

```js
// bad
const pricingPlan = retrievePricingPlan()
const order = retrieveOrder()
let charge
const chargePerUnit = pricingPlan.unit

// good
const pricingPlan = retrievePricingPlan()
const chargePerUnit = pricingPlan.unit
const order = retrieveOrder()
let charge
```

관련된 코드들이 가까이 모여 있다면 이해하기가 더 쉽다.  
하나의 데이터 구조를 이용하는 문장들은 한데 모여 있으면 자연스레 읽으면서 볼 수 있다.

```
저자는 변수를 선언하고 사용할 때 함수 첫머리에 모아두는 것 보다 처음 사용할 때 선언하는 스타일을 선호한다고 함
```

코드들이 모여 있지 않다면 함수 추출은 수행할 수 없다.  
그래서 준비 단계로 관련 코드끼리 모으는 작업이 행해진다.



### 절차

```
1. 코드 조각을 이동할 목표 위치를 찾는다. 코드 조각의 원래 위치와 목표 위치 사이의 코드들을 훑어보면서, 조각을 모으고 나면 동작이 달라지는 코드가 있는지 살핀다. 다음과 같은 간섭이 있다면 이 리팩토링을 포기한다.
   - 코드 조각에서 참조하는 요소를 선언하는 문장 앞으로는 이동할 수 없다.
   - 코드 조각을 참조하는 요소의 뒤로는 이동할 수 없다.
   - 코드 조각에서 참조하는 요소를 수정하는 문장을 건너뛰어 이동할 수 없다.
   - 코드 조각이 수정하는 요소를 참조하는 요소를 건너뛰어 이동할 수 없다.
2. 코드 조각을 원래 위치에서 잘라내어 목표 위치에 붙여 넣는다.
3. 테스트한다.
```

테스트가 실패한다면 더 작게 나눠서 시도  
이동 거리를 줄이는 방법과 한 번에 옮기는 조각의 크기를 줄이는 방법이 있다.



### 예시

코드 조각을 슬라이드할 때는 두 가지를 확인해야 한다.
- 무엇을 슬라이드 할지
- 슬라이드할 수 있는지

무엇을 슬라이드 할지는 맥락과 관련이 깊다. 단순하게는 요소를 선언하는 곳과 사용하는 곳을 가까이 두기위해 선언 코드를 슬라이드하여 처음 사용하는 곳까이 끌어내린다.

코드 조각을 슬라이드하기로 했다면, 실제로 가능한지 점검  
코드들의 순서가 바뀌면 프로그램의 겉보기 동작이 달라지는가?

**코드 예시**

```js
const pricingPlan = retrievePricingPlan()
const order = retrieveOrder()
const baseCharge = pricingPlan.base
let charge
const chargePerUnit = pricingPlan.unit
const units = order.units
let discount
charge = baseCharge + units * chargePerUnit
let discountableUnits = Math.max(units - pricingPlan.discountThreshold, 0)
discount = discountableUnits * pricingPlan.discountFactor
if (order.isRepeat) discount += 20
charge = charge - discount
chargeOrder(charge)
```

선언은 부수효과가 없고 다른 변수를 참조하지도 않기 때문에 자신을 참조하는 코드 앞까지는 어디로든 옮겨도 안전하며, 위치가 옮겨진 이후에는 로직을 함수로 추출할 수 있게된다.

이렇게 부수효과가 없다면 코드 이동이 수월한데 현명한 프로그래머들이 되도록 부수효과 없는 코드들로 프로그래밍하는 이유 중 하나다.

부수효과가 없다는 걸 어떻게 아는가?  
함수 내부를 살펴서 확인 하는 방법이 있지만 [명령-질의 분리 원칙](https://martinfowler.com/bliki/CommandQuerySeparation.html)을 지켜가며 코딩을 하면 값을 반환하는 함수는 모두 부수효과가 없음을 알 수 있다. 단, 코드베이스에 대해 잘 알 때만 이 점을 확신할 수 있다.



### 예시: 조건문이 있을 때의 슬라이드

```js
let result
if (availableResources.length === 0) {
  result = createResource()
  allocatedResources.push(result)
} else {
  result = availableResources.pop()
  allocatedResources.push(result)
}
return result
```

중복된 문장들을 조건문 밖으로 슬라이드하면 중복 로직이 제거될 것이고 반대의 상황에선 모든 분기에 복제되어 들어갈 것이다.



### 추가

[문장 교환하기(Swap Statement)](https://www.industriallogic.com/blog/swap-statement-refactoring/)라는 이름의 거의 똑같은 리팩토링도 있다.  



## 반복문 쪼개기

```js
// bad
let averageAge = 0
let totalSalary = 0
for (const p of people) {
  averageAge += p.age
  totalSalary += p.salary
}
averageAge = averageAge / people.length

// good
let totalSalary = 0
for (const p of people) {
  totalSalary += p.salary
}

let averageAge = 0
for (const p of people) {
  averageAge += p.age
}
averageAge = averageAge / people.length
```

반복문을 두 번 실행해야 하므로 이 리팩토링을 불편해하는 프로그래머도 많다. 리팩토링과 최적화를 구분하자. 반복문 쪼개기가 다른 더 강력한 최적화를 적용할 수 있는 길을 열어주기도 한다.

### 절차

1. 반복문을 복제해 두 개로 만든다.
2. 반복문이 중복되어 생기는 부수효과를 파악해서 제거한다.
3. 테스트한다.
4. 완료됐으면, 각 반복문을 함수로 추출할지 고민해본다.

### 예시

```js
// 전체 급여와 가장 어린 나이를 계산하는 코드
let youngest = people[0] ? people[0].age : Infinity
let totalSalary = 0
for (const p of people) {
  if (p.age < youngest) youngest = p.age
  totalSalary += p.salary
}
return `youngest: ${youngest}, total: ${totalSalary}`
```

1. 반복문 복제

```js
let youngest = people[0] ? people[0].age : Infinity
let totalSalary = 0
for (const p of people) {
  if (p.age < youngest) youngest = p.age
  totalSalary += p.salary
}
for (const p of people) {
  if (p.age < youngest) youngest = p.age
  totalSalary += p.salary
}
return `youngest: ${youngest}, total: ${totalSalary}`
```

2. 부수효과 제거

```js
let youngest = people[0] ? people[0].age : Infinity
let totalSalary = 0
for (const p of people) {
  //if (p.age < youngest) youngest = p.age
  totalSalary += p.salary
}
for (const p of people) {
  if (p.age < youngest) youngest = p.age
  //totalSalary += p.salary
}
return `youngest: ${youngest}, total: ${totalSalary}`
```

4. 함수로 추출

```js
return `youngest: ${youngestAge()}, total: ${totalSalary()}`

function totalSalary() {
  let result = 0
  for (const p of people) {
    result += p.salary
  }
  return result
}

function youngestAge() {
  let result = people[0] ? people[0].age : Infinity
  for (const p of people) {
    if (p.age < result) result = p.age
  }
  return result
}
```


5. 반복문을 파이프라인으로 바꾸기 + 알고리즘 교체하기

```js
return `youngest: ${youngestAge()}, total: ${totalSalary()}`

function totalSalary() {
  return people.reduce((total, p) => total + p.salary, 0)
}

function youngestAge() {
  return Math.min(...people.map(p => p.age))
}
```

반복문을 쪼갰기 때문에 5번 적용이 가능했다.



## 반복문을 파이프라인으로 바꾸기

```js
// bad
const names = []
for (const i of input) {
  if (i.job === "programmer")
    names.push(i.name)
}

// good
const names = input
  .filter(i => i.job === "programmer")
  .map(i => i.name)
```

[컬렉션 파이프라인](https://martinfowler.com/articles/collection-pipeline/)을 이용하면 처리 과정을 일련의 연산으로 표현할 수 있다. 각 연산은 컬렉션을 입력받아 다른 컬렉션을 내뱉는다. 논리를 파이프라인으로 표현하면 객체가 파이프라인을 따라 흐르며 어떻게 처리되는지 읽을 수 있다.

### 절차

1. 반복문에서 사용하는 컬렉션을 가리키는 변수를 하나 만든다.
2. 반복문의 첫 줄부터 시작해서, 각각의 단위 행위를 적절한 컬렉션 파이프라인 연산으로 대체한다. 
   - 이때 컬렉션 파이프라인 연산은 1에서 만든 반복문 컬렉션 변수에서 시작하여, 이전 연산의 결과를 기초로 연쇄적으로 수행된다.
   - 하나를 대체할 때마다 테스트한다.
3. 반복문의 모든 동작을 대체했다면 반복문을 지운다.

### 예시


회사의 지점 사무실 정보.csv
```
office, country, telephone
Chicago, USA, +1 123 123 1234
Bangalore, India, +91 12 1234 1234
...
```

```js
// 인도에 자리한 사무실을 찾아서 도서명과 전화번호를 반환하는 함수
function acquireData(input) {
  const lines = input.split("\n")
  let firstLine = true
  const result = []
  for (const line of lines) {
    if (firstLine) {
      firstLine = false
      continue
    }
    if (line.trim() === "") continue
    const record = line.split(",")
    if (record[1].trim() === "India") {
      result.push({
        city: record[0].trim(),
        phone: record[2].trim()
      })
    }
  }
  return result
}
```

1. 반복문에서 사용하는 컬렉션을 가리키는 별도 변수를 새로 만들기

이 변수를 루프 변수라 하자.

```js
function acquireData(input) {
  const lines = input.split("\n")
  let firstLine = true
  const result = []
  const loopItems = lines // 루프 변수
  for (const line of loopItems) {
    if (firstLine) {
      firstLine = false
      continue
    }
    if (line.trim() === "") continue
    const record = line.split(",")
    if (record[1].trim() === "India") {
      result.push({
        city: record[0].trim(),
        phone: record[2].trim()
      })
    }
  }
  return result
}
```

2. 데이터 첫 줄을 건너뛰는 작업을 slice() 연산으로 해결

```js
function acquireData(input) {
  const lines = input.split("\n")
  // let firstLine = true
  const result = []
  const loopItems = lines.slice(1)
  for (const line of loopItems) {
    // if (firstLine) {
    //   firstLine = false
    //   continue
    // }
    if (line.trim() === "") continue
    const record = line.split(",")
    if (record[1].trim() === "India") {
      result.push({
        city: record[0].trim(),
        phone: record[2].trim()
      })
    }
  }
  return result
}
```

filter() 연산으로 빈 줄을 없애는 코드 대체

```js
function acquireData(input) {
  const lines = input.split("\n")
  const result = []
  const loopItems = lines
    .slice(1)
    .filter(line => line.trim() !== "")
    ;
  for (const line of loopItems) {
    // if (line.trim() === "") continue
    const record = line.split(",")
    if (record[1].trim() === "India") {
      result.push({
        city: record[0].trim(),
        phone: record[2].trim()
      })
    }
  }
  return result
}
```

파이프라인을 사용할 때는 문장 종료 세미콜론을 별도 줄에 적어주면 편하다.

다음으로 map() 연산을 사용해 데이터를 문자열 배열로 변환한다.

```js
function acquireData(input) {
  const lines = input.split("\n")
  const result = []
  const loopItems = lines
    .slice(1)
    .filter(line => line.trim() !== "")
    .map(line => line.split(","))
    ;
  for (const line of loopItems) {
    // const record = line.split(",")
    const record = line
    if (record[1].trim() === "India") {
      result.push({
        city: record[0].trim(),
        phone: record[2].trim()
      })
    }
  }
  return result
}
```

다시 한번 filter() 연산으로 인도에 위치한 사무실 레코드를 뽑아낸다.

```js
function acquireData(input) {
  const lines = input.split("\n")
  const result = []
  const loopItems = lines
    .slice(1)
    .filter(line => line.trim() !== "")
    .map(line => line.split(","))
    .filter(record => record[1].trim() === "India")
    ;
  for (const line of loopItems) {
    const record = line
    // if (record[1].trim() === "India") {
      result.push({
        city: record[0].trim(),
        phone: record[2].trim()
      })
    // }
  }
  return result
}
```

map()을 사용해 결과 레코드를 생성

```js
function acquireData(input) {
  const lines = input.split("\n")
  const result = []
  const loopItems = lines
    .slice(1)
    .filter(line => line.trim() !== "")
    .map(line => line.split(","))
    .filter(record => record[1].trim() === "India")
    .map(record => ({ city: record[0].trim(), phone: record[2].trim() }))
    ;
  for (const line of loopItems) {
    const record = line
    result.push(record)
  }
  return result
}
```

마무리

```js
function acquireData(input) {
  const lines = input.split("\n")
  return lines
    .slice(1)
    .filter(line => line.trim() !== "")
    .map(line => line.split(","))
    .filter(record => record[1].trim() === "India")
    .map(record => ({
      city: record[0].trim(), 
      phone: record[2].trim() 
    }))
    ;
}
```

[마틴파울러 블로그 예제](https://martinfowler.com/articles/refactoring-pipelines.html)



## 죽은 코드 제거하기

```js
// bad
if (false) {
  doSomethingThatUsedToMatter()
}

// good

```

소프트웨어를 납품할 때 코드의 양에는 따로 비용을 매기지 않는다. 쓰이지 않는 코드가 몇 줄 있다고 해서 시스템이 느려지는 것도 아니고 메모리를 많이 잡아먹지도 않는다. 최신 컴파일러들은 이런 코드를 알아서 제거해주기도 한다.  
그래도 이런 코드는 스스로 절대 호출되지 않으니 무시해도 되는 함수다 라는 신호를 주지 않기 때문에  소프트웨어의 동작을 이해하는 데는 걸림돌이 될 수 있다.

죽은 코드가 다시 필요해질 날이 오지 않을까 걱정할 수 있지만 버전 관리 시스템을 믿고 그냥 지워버리자.
그리고 이런 코드들은 보통 다시 쓰이는 날이 오지 않는다.


### 절차

1. 죽은 코드를 외부에서 참조할 수 있는 경우라면 혹시라도 호출하는 곳이 있는지 확인한다.
2. 없다면 제거한다.
3. 테스트한다.