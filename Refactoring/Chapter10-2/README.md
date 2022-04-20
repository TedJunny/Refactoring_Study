# Chapter 10. 조건부 로직 간소화

## 10.5 특이 케이스 추가하기
> 데이터 구조의 특정 값을 확인하고 같은 동작을 반복하는 코드는 리팩토링을 통해서 반복을 줄여라.

* 특수한 경우의 공통 동작을 요소 하나에 모아서 사용하는 특이 케이스 패턴(`Special Case Patter`)을 활용해서 
반복을 줄일 수 있다.
* 특이 케이스는 단순 데이터만 반환하는 리터럴 객체 혹은, 특정 동작을 수행하는 메서드를 담은 객체로 표현할 수 있다. 
특이 케이스 객체는 클래스 형태로 반환되기도 하고, 변환을 거쳐 데이터 구조에 추가시킬 수도 있다.
* 데이터가 `null`인 경우에 자주 사용되어서 널 객체 패턴(`Null Object Pattern`)이라고도 한다. 

### Code Example
전력 회사의 고객 정보를 처리하는 코드를 통해서 특이 케이스를 다루는 방법을 알아보자
```js
// Site 클래스
get customer() {return this._customer;}

// Customer 클래스
get name()           {...} // 고객 이름
get billingPlan()    {...} // 요금제
set billingPlan(arg) {...} 
get paymentHistory() {...} // 납부 이력
```

리팩터링 전 Site 클래스를 사용하는 클라이언트 코드에서는 알 수 없는 고객 정보에 대해 "미확인 고객"이란 문자열을 추가하고, 
그에 따라 데이터를 처리하였다.

```js
// 클라이언트 1
const aCustomer = site.customer;
(...)
let customerName;
if (aCustomer === "미확인 고객") customerName = "거주자";
else customerName = aCustomer.name;

// 클라이언트 2
const plan = (aCustomer === "미확인 고객") ?
    registry.billingPlans.basic 
    : aCustomer.billingPlan;

// 클라이언트 3
if (aCustomer !== "미확인 고객") aCustomer.billingPlan = newPlan;

// 클라이언트 4
const weeksDelinquent = (aCustmoer === "미확인 고객") ?
    0
    : aCustomer.paymentHistory.weeksDelinquentInLastYear;
```
코드를 보면 미확인 고객을 처리하는 클라이언트가 여러 개 있음을 알 수 있다. 그리고 일정한 방식으로 처리되고 있다. 고객 이름으로는 "거주자"를 
사용하고, 기본 요금제를 청구했으며, 연체 기간은 0주로 분류해서 데이터를 처리했다. 이처럼 많은 곳에서 이뤄지는 이 특이 케이스 검사와 공통된 
반응이 우리에게 특이 케이스 객체를 도입할 때임을 말해준다.

<br>

### 특이 케이스 객체 리팩터링
1. 고객 클래스에 미확인 객체 여부를 나타내는 메서드 추가
```js
// Customer 클래스
get isUnknown() {return false;}
```

2. 미확인 고객 전용 클래스 생성
```js
class UnknownCustomer {
    get isUnknown() {return true;}
}
```

3. 특이 케이스인지 확인하는 코드를 추출하여 함수 생성
```js
function isUnknown(arg) {
    if(!((arg instanceof Customer) || (arg === "미확인 고객")))
        throw new Error(`잘못된 값과 비교: <${arg}>`)
    return (arg === "미확인 고객")
}
```

추출한 함수를 통해서 미확인 고객인지 확인하도록 변경 및 테스트 진행

```js
// 클라이언트 1
let customerName;
if (isUnknown(aCustomer)) customerName = "거주자";
else customerName = aCustomer.name;

// 클라이언트 2
const plan = (isUnknown(aCustomer)) ?
    registry.billingPlans.basic 
    : aCustomer.billingPlan;

// 클라이언트 3
if (!isUnknown(aCustomer)) aCustomer.billingPlan = newPlan;

// 클라이언트 4
const weeksDelinquent = (isUnknown(aCustomer)) ?
    0
    : aCustomer.paymentHistory.weeksDelinquentInLastYear;
```

4. 특이 케이스일 때, Site 클래스가 UnknownCustomer 객체를 반환하도록 수정

```js
// Site 클래스
get customer() {
    return (this._customer === "미확인 고객") ? new UnknownCustomer() : this._customer;
}
```

5. isUnknown() 함수를 수정하여 고객 객체의 속성을 사용하도록 수정

```js
function isUnknown(arg) {
    if (!(arg instanceof Customer || arg instanceof UnknownCustomer))
        throw new Error(`잘못된 값과 비교: <${arg}>`);
    return arg.isUnknown;
}
```

6. 모든 기능이 잘 동작하는지 테스트
7. 각 클라이언트에서 수행하는 특이 케이스 검사를 일반적인 기본값으로 대체. 여러 함수를 클래스로 묶기 적용.

```js
// UnknownCustomer 클래스
get name() {return "거주자";}
get billingPlan() {return registry.billingPlans.basic;}
set billingPlan(arg) {/* 무시한다. */}
get paymentHistorh() {return new NullPaymentHistory();}

// NullPaymentHistory 클래스
get weeksDelinquentInLastYear() {return 0;}

// 클라이언트 1
const customerName = aCustomer.name;

// 클라이언트 2
const plan = aCustomer.billingPlan;

// 클라이언트 3
aCustomer.billingPlan = newPlan;

// 클라이언트 4
const weekDelinquent = aCustomer.paymentHistory.weeksDelinquentInLastYear;
```
모든 클라이언트를 수정하여, 호출하는 곳이 없어진 전역 `isUnknown()` 함수를 죽은 코드 제거하기로 없애준다. <br>
객체 리터럴 이용하기, 변환 함수 이용하기 리팩터링도 비슷한 방식으로 진행하면 된다.

<br>

## 10.6 어서션 추가하기
> 특정 조건이 참일 경우에만 제대로 작동하는 코드 영역은 Assertion을 이용해서 명시하자.

* 어서션은 항상 참이라고 가정하는 조건부 문장으로, 어서션이 실패했을 때는 프로그래머가 오류를 발생시켰다는 것을 알 수 있게 해준다.
* 어서션 실패는 시스템의 다른 부분에서 검사가 이루어져서는 안되고, 어서션의 존재 유무가 프로그램 기능의 정상 동작에 영향을 주지 않아야 한다.
* 어서션은 개발자의 소통 도구로 역할한다. 프로그램이 어떤 상태인지를 가정한 채 실행되고 있는지 효과적으로 알려준다.
* 어서션은 디버깅의 수단으로도 잘 쓰이지만, 테스트 코드가 잘 작성되어 있으면 디버깅의 용도로서의 효용은 줄어든다. 하지만 소통 측면에서의 어서션은 여전히 매력적이다.

### Code Example
할인과 관련된 예시 코드를 통해 알아보자

```js
// Customer 클래스
applyDiscount(aNumber) {
    return (this.discountRate)
        ? aNumber - (this.discountRate * aNumber)
        : aNumber;
}
```
위의 함수가 정상적으로 작동하기 위해서는 할인율이 항상 양수가 되어야 한다. 어서션을 통해서 해당 가정을 명시적으로 확인하는 코드를 작성해보자.

```js
// Customer 클래스
applyDiscount(aNumber) {
    if (!this.discountRate) return aNumber
    else {
        assert(this.discountRate >=0)
        return aNumber - (this.discountRate * aNumber) 
    }
}
```
어서션을 세터 메서드에서 동작하도록 약간 수정해보자. 어서션이 applyDiscount()에서 실패한다면 이 문제가 언제 처음 발생했는지를 찾는 문제를 다시 풀어야 하기 때문이다.
```js
set discountRate(aNumber) {
    assert(aNumber === null || aNumber > 0)
    this._discountRate = aNumber;
}
```

> 어서션을 남발하는 것도 좋지 않다. 저자는 참이라고 생각하는 모든 가정에 어서션을 달지 않는다. '반드시 참이어야 하는' 것만 검사한다. 이런 종류의 조건(가정)은 미세하게 자주 바뀔 수 있기 때문에
> 중복된 코드가 있다면 꼭 함수로 추출하도록 하자. 또한 프로그래머가 일으킬 만한 오류에만 어서션을 달도록 하자.

<br>

## 10.7 제어 플래그를 탈출문으로 바꾸기
> 제어 플래그란 코드의 동작을 변경하는 데 사용되는 변수를 말한다. 어딘가에서 값을 계산해 제어 플래그에 설정한 후 다른 어딘가의 조건문에서 검사하는 형태로 쓰인다.

* 제어 플래그는 주로 반복문에서 사용되며, 리팩터링을 통해서 충분히 간소화할 수 있기 때문에 악취를 풍기는 요소이다.
* break문 이나 continue문 활용에 익숙하지 않은 사람이 자주 제어 플래그를 사용하게 된다. 또한 함수의 return은 하나로만 사용해야 한다고 생각하는 개발자도 제어 플래그를 자주 쓴다.

### Code Example
사람 목록 중에서 악당을 찾는 코드를 통해서 제어 플래그를 리팩토링 해보자.

```js
let found = false;
for (const p of people) {
    if(!found) {
        if (p === '조커') {
            sendAlert();
            found = true;
        }
        if (p === '사루만') {
            sendAlert();
            found = true;
        }
    }
}
(...)
```

여기서 제어 플래그로 사용된 변수는 `found`이고, 제어 흐름을 변경하는 용도로 사용되었다. 우선 함수 추출하기를 활용해서 관련된 코드를 떼어서 정리해보자.

```js
checkForMiscreants(people)

function checkForMiscreants(people) {
    let found = false;
    for (const p of people) {
        if(!found) {
            if (p === '조커') {
                sendAlert();
                found = true;
            }
            if (p === '사루만') {
                sendAlert();
                found = true;
            }
        }
    }
}
```

제어 플래그가 참이면 반복문에서 더 이상 할 일이 없다. break문으로 반복문에서 벗어나거나 return을 써서 함수에서 아예 빠져나오면 된다. 제어 플래그가 갱신되는 
장소를 모두 찾아서 함수에서 빠져나가게 해보자.

```js
function checkForMiscreants(people) {
    let found = false;
    for (const p of people) {
        if(!found) {
            if (p === '조커') {
                sendAlert();
                return
            }
            if (p === '사루만') {
                sendAlert();
                return 
            }
        }
    }
}
```

더 이상 제어 플래그가 필요 없어진 상황이니, 제어 플래그를 참조하는 다른 코드들을 모두 제거할 수 있다.

```js
function checkForMiscreants(people) {
    let found = false;
    for (const p of people) {
        if (p === '조커') {
                sendAlert();
                return
        }
        if (p === '사루만') {
                sendAlert();
                return 
        }
    }
}

⬇ 더 가다듬기 ⬇
function checkForMiscreants(people) {
    if(people.some(p => ['조커', '사루만'].includes(p))) sendAlert();
}

저자는 python의 집합 자료형에서 사용가능한 isdisjoint()함수가 JS에서도 지원하길 바란다.
['조커', '사루만'].isDisJointWith(people)
```
