# Chapter 6 (7~11)

## 6. 7 변수 이름 바꾸기

- 명확한 프로그래밍의 핵심은 이름짓기.
- 변수는 프로그래머가 하려는 일에 관해 많은 것을 설명해줌. ( 단, 이름을 잘 지었을 때만 )
  - 이름을 잘 못 짓는 이유
    - 고민을 충분히 하지 않았거나
    - 개발 경력이 쌓이다보니 이해도가 높아져서이거나
    - 사용자의 요구가 달라져서 프로그램 목적 자체가 변해서
- 함수 호출 한번으로 끝나지 않고 값이 영속되는 필드라면 이름에 더 신경써야함.
- **절차**
  - 폭넓게 쓰이는 변수라면 캡슐화 고려 ( 캡슐화 후에 이름 변경 )
  - 이름을 바꿀 변수를 참조하는 곳을 모두 찾아서 하나씩 변경
  - 테스트

## 6. 8 매개변수 객체 만들기

- 데이터 뭉치를 데이터 구조로 묶으면 데이터 사이에 관계가 명확해짐
- 함수가 이 데이터 구조를 받게 하면 매개변수 수가 줄어듬.
- 같은 데이터 구조를 사용하는 모든 함수가 원소를 참조할 때 항상 똑같은 이름을 사용하기 때문에 일관성도 높여줌

- **절차**
  - 적당한 데이터 구조가 아직 마련되어 있지 않다면 새로 생성
  - 테스트
  - 함수 선언바꾸기로 새 데이터 구조를 매개변수로 추가
  - 테스트
  - 함수 호출 시 새로운 데이터 구조 인스턴스를 넘기도록 수정. 수정할 때마다 테스트
  - 기존 매개변수를 사용하던 코드를 새 데이터 구조의 원소를 사용하도록 바꾼다.
  - 다 바꿨다면 기존 매개변수를 제거 후 테스트
  ```jsx
  function amountInvoiced(startDate, endDate) {...}
  function amountReceived(startDate, endDate) {...}
  function amountOverdue(startDate, endDate) {...}
  ```

```jsx
function amountInvoiced(aDateRange) {...}
function amountReceived(aDateRange) {...}
function amountOverdue(aDateRange) {...}

aDateRange : {startDate : Date , endDate : Date }
```

## 6.9 여러 함수를 클래스로 묶기

- 이 함수들이 공유하는 공통 환경을 더 명확하게 표현할 수 있음
- 각 함수에 전달되는 인수를 줄여서 객체 안에서의 함수 호출을 간결하게 만들 수 있음
- 이런 객체를 시스템의 다른 부분에 전달하기 위한 참조 제공도 가능함
- 이미 만들어진 함수들을 재구성 할 때는 물론, 새로 만든 클래스와 관련하여 놓친 연산을 찾아서 새 클래스의 메서드로 뽑아내는 데도 좋다.

- **절차**
  - 함수들이 공유하는 공통 데이터 레코드를 캡슐화한다.
  - 공통 레코드를 사용하는 함수 각각을 새 클래스로 옮긴다.
  - 데이터를 조각하는 로직들은 함수로 추출해서 새 클래스로 옮긴다.

```jsx
function base(aReading) {...}
function taxableCharge(aReading) {...}
function calculateBaseCharge(aReading) {...}
```

```jsx
class Reading {
	base() {...}
	taxableCharge() {...}
	calculateBaseCharge() {...}
}
```

## 6. 10 여러 함수를 변환 함수로 묶기

- 검색과 갱신을 일관된 장소에서 처리할 수 있고 로직 중복도 막을 수 있다
- 도출 과정을 검토할 일이 생겼을 때 변환 함수만 살펴보면 된다

- 같은 상황일 시 “여러 함수를 클래스로 묶기"로 처리해도 된다.

  - 원본 데이터가 코드 안에서 갱신될 때는 클래스로 묶는 편이 훨씬 낫다.
  - 변환 함수로 묶으면 가공한 데이터를 새로운 레코드에 저장하므로, 원본 데이터가 수정되면 일관성이 깨질 수 있다.

- 절차
  - 변환할 레코드를 입력받아서 값을 그대로 반환하는 변환 함수를 만든다.
  - 묶을 함수 중 하나를 골라서 본문 코드를 변환 함수로 옮기고, 처리 결과를 레코드에 새 필드로 기록한다. 그런 다음 클라이언트 코드가 이 필드를 사용하도록 수정한다.
  - 테스트
  - 나머지 관련 함수도 이 과정에 따라 처리

```jsx
function base(aReading) {...}
function taxableCharge(aReading) {...}
```

```jsx
function enrichReading(argReading) {
  const aReading = _.cloneDeep(argReading);
  aReading.baseCharge = base(aReading);
  aReading.taxableCharge = taxableCharge(aReading);
  return aReading;
}
```

## 6. 11 단계 쪼개기

- 코드를 수정해야 할 때 두 대상을 동시에 생각할 필요 없이 하나에만 집중하기 위해 별개 모듈로 나누는 작업을 진행
- 단순히 동작을 연이은 두 단계로 쪼개거나 필요 시 입력값을 다루기 편한 형태로 먼저 가공
- 하나의 목적에만 집중할 수 있어 코드 수정이 쉬워짐

- 절차
  - 두번째 단계에 해당하는 코드를 독립 함수로 추출
  - 테스트
  - 중간 데이터 구조를 만들어서 앞에서 추출한 함수의 인수로 추가
  - 테스트
  - 추출한 두 번째 함수의 매개 변수를 하나씩 검토. 그 중 첫 번째 단계에서 사용 되는 것은 중간 데이터 구조로 옮긴다.
  - 첫 번째 단계 코드를 함수로 추출하면서 중간 데이터 구조를 반환하도록 한다.

```jsx
function priceOrder(product, quantity, shoppingMethod) {
  const basePrice = product.basePrice * quantity;
  const discount = Math.max(quantity - product.discountThreshold, 0) * product.basePrice * product.discountRate;
  const shippingPerCase = basePrice > shippingMethod.discountThreshold ? shippingMethod.discountedFee : shippingMethod.feePerCase;
  const shippingCost = quantity * shippingPerCase;
  const price = basePrice - discount + shippingCost;
  return price;
}
```

```jsx
function priceOrder(product, quantity, shoppingMethod) {
	const priceData = calculatePricingData(product, quantity);
	return applyShipping(priceData, shippingMethod);
}

// 중간 데이터
function calculatePricingData(product, quantity) {
	const basePrice = product.basePrice * quantity;
	const discount = Math.max(quantity - product.discountThreshold, 0) * product.basePrice * product.discountRate;
	return {basePrice: basePrice, quantity: quantity, discount: discount};
}

function applyShipping(priceData, shippingMethod) {
	const shippingPerCase = (priceData.basePrice) > shippingMethod.discountThreshold) ? shippingMethod.discountedFee : shippingMethod.feePerCase;
	const shippingCost = priceData.quantity * shippingPerCase;
	return priceData.basePrice - priceData.discount + shippingCost;
}
```
