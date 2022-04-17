# Chapter 10. 조건부 로직 간소화

## 10.5 특이 케이스 추가하기
> 데이터 구조의 특정 값을 확인하고 같은 동작을 반복하는 코드는 리팩토링을 통해서 반복을 줄여라.

* 특수한 경우의 공통 동작을 요소 하나에 모아서 사용하는 특이 케이스 패턴(`Special Case Patter`)을 활용해서 
반복을 줄일 수 있다.
* 특이 케이스는 단순 데이터만 반환하는 리터럴 객체 혹은, 특정 동작을 수행하는 메서드를 담은 객체로 표현할 수 있다. 
특이 케이스 객체는 클래스 형태로 반환되기도 하고, 변환을 거쳐 데이터 구조에 추가시킬 수도 있다.
* 데이터가 `null`인 경우에 자주 사용되어서 널 객체 패턴(`Null Object Pattern`)이라고도 한다. 

<br>

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

<br>

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

<br>

2. 미확인 고객 전용 클래스 생성
```js
class UnknownCustomer {
    get isUnknown() {return true;}
}
```

<br>

3. 특이 케이스인지 확인하는 코드를 추출하여 함수 생성
```js
function isUnknown(arg) {
    if(!((arg instanceof Customer) || (arg === "미확인 고객")))
        throw new Error(`잘못된 값과 비교: <${arg}>`)
    return (arg === "미확인 고객")
}
```

<br>

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

<br>

4. 특이 케이스일 때, Site 클래스가 UnknownCustomer 객체를 반환하도록 수정
```js
// Site 클래스
get customer() {
    return (this._customer === "미확인 고객") ? new UnknownCustomer() : this._customer;
}
```

<br>

5. isUnknown() 함수를 수정하여 고객 객체의 속성을 사용하도록 수정
```js
function isUnknown(arg) {
    if (!(arg instanceof Customer || arg instanceof UnknownCustomer))
        throw new Error(`잘못된 값과 비교: <${arg}>`);
    return arg.isUnknown;
}
```

<br>

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


## 10.6 어서션 추가하기


## 10.7 제어 플래그를 탈출문으로 바꾸기


