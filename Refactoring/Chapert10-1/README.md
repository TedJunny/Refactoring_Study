# Chapter 10-01. 조건부 로직 간소화

## 10.1 조건문 분해하기

**why?**

- 복잡한 조건부 로직은 프로그램을 복잡하게 만드는 가장 흔한 원흉에 속한다. 다양한 조건, 그에 따라 동작도 다양한 코드를 작성하면 순식간에 꽤 긴 함수가 탄생한다. 긴 함수는 그 자체로도 읽기 어렵지만, 조건문은 그 어려움을 한층 가중시킨다. 조건을 검사하고 그 결과에 따른 동작을 표현한 코드는 무슨 일이 일어나는지는 이야기해주지만 ‘왜' 일어나는지는 제대로 말해주지 않을 때가 많은 것이 문제다.

**how**

- 거대한 코드 블럭이 주어지면 부위별로 분해한 다음 해체된 코드 덩어리들을 각 덩어리의 의도를 살린 이름의 함수 호출로 바꿔준다.

**effect**

- 해당 조건이 무엇인지 강조하고, 그래서 무엇을 분기했는지가 명확해진다. 분기한 이유 역시 더 명확해진다.

```jsx
//리팩토링 전
if (!aDate.isBefore(plan.summerStart) && !aDate.isAfter(plan.summerEnd)) 
	charge = quantity * plan.summerRate; 
else 
	charge = quantity * plan.regularRate + plan.regularServiceCharge;

//조건식을 별도 함수로 추출
if(**summer()**)
	charge = quantity * plan.summerRate; 
else
	charge = quantity * plan.regularRate + plan.regularServiceCharge;

**function summer(){
	return !aDate.isBefore(plan.summerStart) && !aDate.isAfter(plan.summerEnd);
}**

//조건 만족했을 때의 로직도 다른 함수로 추출
if(summer())
	charge = **summerCharge()**;
else
	charge = quantity * plan.regularRate + plan.regularServiceCharge;

function summer(){
	return !aDate.isBefore(plan.summerStart) && !aDate.isAfter(plan.summerEnd);
}
**function summerCharge(){
	return quantity * plan.summerRate;
}**

//마지막 else절도 별도 함수로 추출
if(summer())
	charge = summerCharge();
else
	charge = **regularCharge()**;

function summer(){
	return !aDate.isBefore(plan.summerStart) && !aDate.isAfter(plan.summerEnd);
}
function summerCharge(){
	return quantity * plan.summerRate;
}
**function regularCharge(){
	return quantity * plan.regularRate + plan.regularServiceCharge;
}**

//+ 삼항연산자로 정리 가능 
**charge = summer() ? summerCharge() : regularCharge();**
```

## 10.2 조건식 통합하기

**why?**

- 나눠서 순서대로 비교해도 결과는 같지만, 읽는 사람은 독립된 검사들이 우연히 함께 나열된 것으로 오해할 수 있다.
- 복잡한 조건식을 함수로 추출하면 코드의 의도가 훨씬 분명하게 드러나는 경우가 많다

**how**

- 해당 조건식들에 부수효과가 없는 지 확인 후 조건문 두 개를 선택하여 두 조건문의 조건식들을 논리 연산자 (and , or 등) 으로 결합한다.

**effect**

- 여러 조각으로 나뉜 조건들을 하나로 통합함으로써 내가 하려는 일이 더 명확해진다.

### OR 사용하기

```jsx
//리팩토링 전
function disabliltyAmount(anEmployee) {
	if (anEmployee.seniority < 2) return 0;
	if (anEmployee.monthsDisabled > 12) return 0;
	if (anEmployee.isPartTime) return 0;
}

//or 연산자 이용 (두개 먼저 ) 
function disabliltyAmount(anEmployee) {
	**if ((anEmployee.seniority < 2) || (anEmployee.monthsDisabled > 12 ))**
		return 0;
	if (anEmployee.isPartTime) return 0;
}

//or 연산자 이용 ( 다음 친구 )
function disabliltyAmount(anEmployee) {
	**if ((anEmployee.seniority < 2) 
			|| (anEmployee.monthsDisabled > 12 )
			|| (anEmployee.isPartTime)) return 0;
}**

//함수 추출하기 
function disabliltyAmount(anEmployee) {
	**if(isNotEligibleForDisability()) return 0;

	function isNotEligibleForDisability(){
		return ((anEmployee.seniority < 2) 
						|| (anEmployee.monthsDisabled > 12 )
						|| (anEmployee.isPartTime))
	}**
}
```

### AND 사용하기

```jsx
//리팩토링 전
if(anEmployee.onVacation)
	if(anEmployee.seniority > 10 )
		return 1;
return 0.5;

//and로 결합
**if((anEmployee.onVacation) && (anEmployee.seniority > 10 )) return 1;**
return 0.5;
```

## 10.3 중첩 조건문을 보호 구문으로 바꾸기

조건문은 주로 참인경로와 거짓인 경로 모두 정상 동작으로 이어지는 형태와 한쪽만 정상인 형태로 쓰인다.

**why?**

- 두 형태는 의도하는 바가 서로 다르므로 그 의도가 코드에 드러나야만 한다.
- 보호 구문은 "이건 이 함수의 핵심이 아니다" 라는 의미를 담고 있어 함수의 핵심 의도를 부각시킬 수 있다.

**how**

- 한쪽만 정상이라면 비정상 조건을 If에서 검사한 다음, 조건이 참이면(비정상이면) 함수에서 빠져나온다.

effect

- 보호 구문을 통해 함수의 핵심 로직이 아닌 부분을 명확히 구분하고 불필요한 복잡도를 줄인다

```jsx
//리팩토링 전 
function payAmount(employee){
	let result;
	if(empolyee.isSeperated) {
		result = { amount : 0, reasonCode: 'SEP' };
	}
	else {
		if (employee.isRetired){
			result = { amount : 0, reasonCode : 'RET' } ;
		}
		else {
			lorem.ipsum(dolor.sitAmet);
			consectetur(adipiscing).elit();
			sed.do.eiusmod = tempor.incididunt.ut(labore) && dolore(magna.aliqua);
			ut.enim.ad(minim, veniam);
			result = someFinalComputation();
		}
	}
	return result;
}

//최상위 조건을 보호구문으로 바꿔보자
function payAmount(employee){
	let result;
	**if (employee.isSeperated) return { amout : 0, reasonCode : 'SEP' };
	if (employee.isRetired){
		result = { amount : 0, reasonCode : 'RET' };
	}**
	else {
			lorem.ipsum(dolor.sitAmet);
			consectetur(adipiscing).elit();
			sed.do.eiusmod = tempor.incididunt.ut(labore) && dolore(magna.aliqua);
			ut.enim.ad(minim, veniam);
			result = someFinalComputation();
	}
	return result;
}

//다음 최상위 조건을 보호구문으로 바꿔보자
function payAmount(employee){
	//이제 result가 필요없으니 삭제 
	~~let result;~~ 
	**if (employee.isSeperated) return { amout : 0, reasonCode : 'SEP' };
	if (employee.isRetired) return { amount : 0, reasonCode : 'RET' };**

	lorem.ipsum(dolor.sitAmet);
	consectetur(adipiscing).elit();
	sed.do.eiusmod = tempor.incididunt.ut(labore) && dolore(magna.aliqua);
	ut.enim.ad(minim, veniam);
	return someFinalComputation();
	~~result = someFinalComputation();~~

	~~return result;~~
}
```

### 조건 반대로 만들기

```jsx
//리팩토링 전
function adjustedCapital(anInstrument) {
	let result = 0;
	if(anInstrument.capital > 0) {
		if(anInstrument.interesRate > 0 && anInstrument.duration > 0) {
			result = (anInstrument.income / anInstrument.duration)
								 * anInstrument.adjustmentFactor;
		}
	}
	return result;
}

//보호구문을 추가하면서 조건을 역으로 바꾸기
function adjustedCapital(anInstrument) {
	let reusult = 0;
	**if (anInstrument.capital <=0) return result;**
	if (anInstrument.interestRate > 0 && anInstrument.duration > 0) {
		result = (anInstrument.income / anInstrument.duration)
								 * anInstrument.adjustmentFactor;
	}
	return result;
}

//not 연산자 추가
function adjustedCapital(anInstrument) {
	let reusult = 0;
	****if (anInstrument.capital <=0) return result;
	**if (!(anInstrument.interestRate <= 0 && anInstrument.duration <= 0)) 
		return reuslt;** 

	result = (anInstrument.income / anInstrument.duration)
								 * anInstrument.adjustmentFactor;
	return result;
}

//not이 있으면 이상하니 빼자 
function adjustedCapital(anInstrument) {
	let reusult = 0;
	****if (anInstrument.capital <=0) return result;
	**if (anInstrument.interestRate <= 0 || anInstrument.duration <= 0) 
		return reuslt;** 

	result = (anInstrument.income / anInstrument.duration)
								 * anInstrument.adjustmentFactor;
	return result;
}

//두개의 조건문이 같은 result를 반환하니 하나로 통합한다.
// result 는 이제 제거 해도 된다.
function adjustedCapital(anInstrument) {
	~~let reusult = 0;~~

	**if (anInstrument.capital <=0 
			|| anInstrument.interestRate <= 0 
			|| anInstrument.duration <= 0 ) return 0;**
	****
	return (anInstrument.income / anInstrument.duration)
								 * anInstrument.adjustmentFactor;

	~~result = (anInstrument.income / anInstrument.duration)
								 * anInstrument.adjustmentFactor;
	return result;~~
}
```

## 10.4 조건부 로직을 다형성으로 바꾸기

복잡한 조건문 로직은 프로그래밍에서 해석하기 가장 난해한 대상에 속한다. 

**how**

- 타입을 여러 개 만들고 각 타입이 조건부 로직을 자신만의 방식으로 처리하도록 구성한다.
- 로직을 슈퍼클래스로 넣어서 변형 동작에 신경 쓰지 않고 기본에 집중하게 한다.  그런 다음 변형 동작을 뜻하는 case들을 각각의 서브클래스로 만든다.

**effect**

- 조건문 구조를 그대로 둔 채 해결될 때도 있지만, 클래스와 다형성을 이용하면 더 확실하게 분리가 가능하다.

```jsx
//리팩토링 전
function plumages(birds) {
	return new Map(birds.map(b => [b.name, plumage(b)]));	
}

function speeds(birds) {
	return new Map(birds.map(b => [b.name, airSpeedVelocity(b)]));
}

function plumage(bird) {
	switch (bird.type) {
	case '유럽 제비' :
		return '보통이다' ;
	case '아프리카 제비' :
		return (bird.numberOfCoconuts > 2) ? '지쳤다' : '보통이다' ;
	case '노르웨이 파랑 앵무' :
		return (bird.voltage > 100) ? '그을렸다' : '예쁘다';
	default :
		return '알 수 없다';
	}
}

function airSpeedVelocity(bird) {
	switch (bird.type) {
	case '유럽 제비' :
		return 35;
	case '아프리카 제비' :
		return 40 - 2 * bird.numberOfCoconuts;
	case '노르웨이 파랑 앵무' :
		return (bird.isNailed) ? 0 : 10 + bird.voltage / 10;
	default:
		return null;
	}
}

//airSpeedVelocity 와 plumage를 Bird라는 클래스로 묶어보자

function plumage(bird){
	return new Bird(bird).plumage;
}

function airSpeedVelocity(bird){
	return new Bird(bird).airSpeedVelocity;
}

class Bird {
	constructor(birdObject){
		Object.assign(this, birdObject);
	}

	get plumage(){
		switch (bird.type) {
		case '유럽 제비' :
			return '보통이다' ;
		case '아프리카 제비' :
			return (bird.numberOfCoconuts > 2) ? '지쳤다' : '보통이다' ;
		case '노르웨이 파랑 앵무' :
			return (bird.voltage > 100) ? '그을렸다' : '예쁘다';
		default :
			return '알 수 없다';
		}
	}

	get airSpeedVelocity(){
		switch (bird.type) {
		case '유럽 제비' :
			return 35;
		case '아프리카 제비' :
			return 40 - 2 * bird.numberOfCoconuts;
		case '노르웨이 파랑 앵무' :
			return (bird.isNailed) ? 0 : 10 + bird.voltage / 10;
		default:
			return null;
		}
	}
}

//종별 서브클래스 만들기 ** 적합한 서브클래스의 인스턴스를 만들어줄 팩터리 함수도 잊지 말자

function plumage(bird) {
	return createBird(bird).plumage;
}

function airSpeedVelocity(bird) {
	return createBird(bird).airSpeedVelocity;
}

fucnction createBird(bird) {
	switch (bird.type) {
	case '유럽 제비' :
		return new EuropeanSwallow(bird);
	case '아프리카 제비' :
		return new AfricanSwallow(bird);
	case '노르웨이 파랑 앵무' :
		return new NorwegianBlueParrot(bird);
	default :
		return new Bird(bird);
	}
}

//두 조건부 메서드 처리 ( Switch문의 절 하나를 선택해 해당 서브클래스에서 오버라이드 한다)
// throw로 에러 처리하면 더 좋다
class EuropeanSwallow extends Bird {
	get plumage() {
		return '보통이다';
	}
}

class AfricanSwallow extends Bird {
	get plumage() {
		return (bird.numberOfCoconuts > 2) ? '지쳤다' : '보통이다' ;
	}
}

class NorwegianBlueParrot extends Bird {
	get plumage() {
		return (bird.voltage > 100) ? '그을렸다' : '예쁘다';
	}
}

//Bird Class
get plumage(){
	return '알 수 없다';
}

--> 같은 과정을 airSpeedVelocity에도 수행 

function plumages(birds) {
	return new Map(birds.map(b => createBird(b))
								.map(bird => [bird.name, bird.plumage]));
}

function speeds(birds) {
	return new Map(birds.map(b => createBird(b))
								.map(bird => [bird.name, bird.airSpeedVelocity]));
}

function createBird(bird) {
  switch (bird.type) {
    case '유럽 제비':
      return new EuropeanSwallow(bird);
    case '아프리카 제비':
      return new AfricanSwallow(bird);
    case '노르웨이 파랑 앵무':
      return new NorwegianBlueParrot(bird);
    default:
      return new Bird(bird);
  }
}

class Bird {
  constructor(birdObject) {
    Object.assign(this, birdObject);
  }
  get plumage() {
    return '알 수 없다';
  }
  get airSpeedVelocity() {
    return null;
  }
}

class EuropeanSwallow extends Bird {
  get plumage() {
    return '보통이다';
  }
  get airSpeedVelocity() {
    return 35;
  }
}

class AfricanSwallow extends Bird {
  get plumage() {
    return bird.numberOfCoconuts > 2 ? '지쳤다' : '보통이다';
  }
  get airSpeedVelocity() {
    return 40 - 2 * this.numberOfCoconuts;
  }
}

class NorwegianBlueParrot extends Bird {
  get plumage() {
    return bird.voltage > 100 ? '그을렸다' : '예쁘다';
  }
  get airSpeedVelocity() {
    return this.isNailed ? 0 : 10 + this.voltage / 10;
  }
}
```

### 변형 동작을 다형성으로 표현해보기

앞서서는 정확히 새의 종 분류에 맞게 구성했다. 

하지만 상속이 이렇게만 쓰이는 것은 아니다. 또다른 쓰임새로, 거의 똑같은 객체지만 다른 부분도 있음을 표현할 때도 상속을 쓴다.
```jsx
//리팩토링 전
function rating(vayage, history) {
  const vpf = voyageProfitFactor(vayage, history);
  const vr = voyageRisk(voyage);
  const chr = captainHistoryRisk(voyage, history);
  if (vpf * 3 > vr + chr * 2) return 'A';
  else return 'B';
}

function voyageRisk(voyage) {
  let result = 1;
  if (voyage.length > 4) result += 2;
  if (voyage.lenght > 8) result += vayage.length - 8;
  if (['중국', '동인도'].includes(voyage.zone)) result += 4;
  return Math.max(result, 0);
}

function captainHistoryRisk(voyage, history) {
  let result = 1;
  if (history.length < 5) result += 4;
  result += history.filter((v) => v.profit < 0).length;
  if (voyage.zone === '중국' && hasChina(history)) result -= 2;
  return Math.max(result, 0);
}

function hasChina(history) {
  return history.some((v) => '중국' === v.zone);
}

function voyageProfitFactor(voyage, history) {
  let result = 2;
  if (voyage.zone === '중국') result += 1;
  if (voyage.zone === '동인도') result += 1;
  if (voyage.zone === '중국' && hasChina(history)) {
    result += 3;
    if (history.length > 10) result += 1;
    if (voyage.length > 12) result += 1;
    if (voyage.length > 18) result -= 1;
  } else {
    if (history.length > 8) result += 1;
    if (voyage.length > 14) result -= 1;
  }
  return result;
}

const vayage = { zone: '서인도', length: 10 };
const history = [
  { zone: '동인도', profit: 5 },
  { zone: '서인도', profit: 15 },
  { zone: '중국', profit: -2 },
  { zone: '서아프리카', profit: 7 },
];

const myRating = rating(voyage, history);

//여러 함수를 클래스로 묶기
const voyage = { zone: '서인도', length: 10 };
const history = [
  { zone: '동인도', profit: 5 },
  { zone: '서인도', profit: 15 },
  { zone: '중국', profit: -2 },
  { zone: '서아프리카', profit: 7 },
];

const myRating = rating(voyage, history);

function rating(voyage, history) {
  return new Rating(voyage, history).value;
}

class Rating {
  constructor(voyage, history) {
    this.voyage = voyage;
    this.history = history;
  }

  get value() {
    const vpf = this.voyageProfitFactor;
    const vr = this.voyageRisk;
    const chr = this.captainHistoryRisk;
    if (vpf * 3 > vr + chr * 2) return 'A';
    else return 'B';
  }

  get voyageRisk() {
    let result = 1;
    if (this.voyage.length > 4) result += 2;
    if (this.voyage.lenght > 8) result += this.vayage.length - 8;
    if (['중국', '동인도'].includes(this.voyage.zone)) result += 4;
    return Math.max(result, 0);
  }

  get captainHistoryRisk() {
    let result = 1;
    if (this.history.length < 5) result += 4;
    result += this.history.filter((v) => v.profit < 0).length;
    if (this.voyage.zone === '중국' && this.hasChinaHistory) result -= 2;
    return Math.max(result, 0);
  }

  get voyageProfitFactor() {
    let result = 2;
    if (this.voyage.zone === '중국') result += 1;
    if (this.voyage.zone === '동인도') result += 1;
    if (this.voyage.zone === '중국' && this.hasChinaHistory) {
      result += 3;
      if (this.history.length > 10) result += 1;
      if (this.voyage.length > 12) result += 1;
      if (this.voyage.length > 18) result -= 1;
    } else {
      if (this.history.length > 8) result += 1;
      if (this.voyage.length > 14) result -= 1;
    }
    return result;
  }

  get hasChinaHistory() {
    return this.history.some((v) => '중국' === v.zone);
  }
}
//변형동작을 담을 빈 서브클래스 만들기

class ExperiencedChinaRating extends Rating {}

//적절한 변형 클래스를 반환해줄 팩터리 함수 만들기

function createRating(voyage, history) {
  if (voyage.zone === '중국' && history.some((v) => '중국' === v.zone)) return new ExperiencedChinaRating(voyage, history);
  else return new Rating(voyage, history);
}

//생성자 호출 코드를 전부 팩터리 함수로 수정
function rating(voyage, history) {
  **return new createRating(voyage, history).value;**
}

//서브 클래스로 옮기기
//1. captainHistoryRisk 메서드 오버라이드

//Rating 클래스
get captainHistoryRisk() {
    let result = 1;
    if (this.history.length < 5) result += 4;
    result += this.history.filter((v) => v.profit < 0).length;
    ~~if (this.voyage.zone === '중국' && this.hasChinaHistory) result -= 2;~~
    return Math.max(result, 0);
}

//ExperiencedChinaRating 클래스
class ExperiencedChinaRating extends Rating {
  get captainHistoryRisk() {
    {
      const result = super.captainHistoryRisk - 2;
      return Math.max(result, 0);
    }
  }
}

//2.voyageProfitFactor 조건부 블록 전체를 함수로 추출 

get voyageProfitFactor() {
    let result = 2;
    if (this.voyage.zone === '중국') result += 1;
    if (this.voyage.zone === '동인도') result += 1;
    ~~if (this.voyage.zone === '중국' && this.hasChinaHistory) {
      result += 3;
      if (this.history.length > 10) result += 1;
      if (this.voyage.length > 12) result += 1;
      if (this.voyage.length > 18) result -= 1;
    } else {
      if (this.history.length > 8) result += 1;
      if (this.voyage.length > 14) result -= 1;
    }~~
		result += this.voyageAndHistoryLengthFactor;
    return result;
}

get voyageAndHistoryLengthFactor() {
    let result = 0;
    if (this.voyage.zone === '중국' && this.hasChinaHistory) {
      result += 3;
      if (this.history.length > 10) result += 1;
      if (this.voyage.length > 12) result += 1;
      if (this.voyage.length > 18) result -= 1;
    } else {
      if (this.history.length > 8) result += 1;
      if (this.voyage.length > 14) result -= 1;
    }
    return result;
}

//서브 클래스로 이동
//Rating 클래스
get voyageProfitFactor() {
    let result = 2;
    if (this.voyage.zone === '중국') result += 1;
    if (this.voyage.zone === '동인도') result += 1;
    result += this.voyageAndHistoryLengthFactor;
    return result;
}
get voyageAndHistoryLengthFactor() {
    let result = 0;

    if (this.history.length > 8) result += 1;
    if (this.voyage.length > 14) result -= 1;

    return result;
}

//ExperiencedChinaRating 클래스
get voyageAndHistoryLengthFactor() {
    let result = 0;

    result += 3;
    if (this.history.length > 10) result += 1;
    if (this.voyage.length > 12) result += 1;
    if (this.voyage.length > 18) result -= 1;

    return result;
}

//더 가다듬기 (함수로 추출)
//Rating 클래스
get voyageAndHistoryLengthFactor() {
    let result = 0;
    **result += this.voyageAndHistoryLengthFactor;**

    if (this.voyage.length > 14) result -= 1;

    return result;
}

get historyLengthFactor() {
  return this.history.length > 8 ? 1 : 0;
}

//ExperiencedChinaRating 클래스
get voyageAndHistoryLengthFactor() {
    let result = 0;

    result += 3;
    **result += this.historyLengthFactor;**
    if (this.voyage.length > 12) result += 1;
    if (this.voyage.length > 18) result -= 1;

    return result;
}

get historyLengthFactor() {
  return this.history.length > 10 ? 1 : 0;

//이제 슈퍼클래스에서는 문장을 호출한 곳으로 옮기기 적용이 가능하다

//Rating 클래스
get voyageProfitFactor() {
    let result = 2;
    if (this.voyage.zone === '중국') result += 1;
    if (this.voyage.zone === '동인도') result += 1;
    **result += this.historyLengthFactor;**
    result += this.voyageAndHistoryLengthFactor;
    return result;
  }
  get voyageAndHistoryLengthFactor() {
    let result = 0;
    ~~result += this.voyageAndHistoryLengthFactor;~~

    if (this.voyage.length > 14) result -= 1;

    return result;
  }

get voyageAndHistoryLengthFactor() {
    let result = 0;

    result += 3;
    ~~result += this.historyLengthFactor;~~
    if (this.voyage.length > 12) result += 1;
    if (this.voyage.length > 18) result -= 1;

    return result;
}

//그 다음 이름을 바꿔준다.

//Rating 클래스
get voyageProfitFactor() {
    let result = 2;
    if (this.voyage.zone === '중국') result += 1;
    if (this.voyage.zone === '동인도') result += 1;
    result += this.historyLengthFactor;
    **result += this.voyageLenthFactor;**
    return result;
  }
  **get voyageLenthFactor() {
    return this.voyage.length > 14 ? -1 : 0;
  }**

//ExperiencedChinaRating 클래스
get **voyageLenthFactor**() {
    let result = 0;

    result += 3;

    if (this.voyage.length > 12) result += 1;
    if (this.voyage.length > 18) result -= 1;

    return result;
}

//result를 전체 결과 계산하는 쪽으로 옮기기
//ExperiencedChinaRating 클래스

get voyageProfitFactor() {
    return super.voyageProfitFactor + 3;
}

get voyageLenthFactor() {
    let result = 0;

    ~~result += 3;~~

    if (this.voyage.length > 12) result += 1;
    if (this.voyage.length > 18) result -= 1;

    return result;
}
```

```jsx
//리팩토링 완료!

const voyage = { zone: '서인도', length: 10 };
const history = [
  { zone: '동인도', profit: 5 },
  { zone: '서인도', profit: 15 },
  { zone: '중국', profit: -2 },
  { zone: '서아프리카', profit: 7 },
];

const myRating = rating(voyage, history);

function rating(voyage, history) {
  return new createRating(voyage, history).value;
}

class Rating {
  constructor(voyage, history) {
    this.voyage = voyage;
    this.history = history;
  }

  get value() {
    const vpf = this.voyageProfitFactor;
    const vr = this.voyageRisk;
    const chr = this.captainHistoryRisk;
    if (vpf * 3 > vr + chr * 2) return 'A';
    else return 'B';
  }

  get voyageRisk() {
    let result = 1;
    if (this.voyage.length > 4) result += 2;
    if (this.voyage.lenght > 8) result += this.vayage.length - 8;
    if (['중국', '동인도'].includes(this.voyage.zone)) result += 4;
    return Math.max(result, 0);
  }

  get captainHistoryRisk() {
    let result = 1;
    if (this.history.length < 5) result += 4;
    result += this.history.filter((v) => v.profit < 0).length;

    return Math.max(result, 0);
  }

  get voyageProfitFactor() {
    let result = 2;
    if (this.voyage.zone === '중국') result += 1;
    if (this.voyage.zone === '동인도') result += 1;
    result += this.historyLengthFactor;
    result += this.voyageLenthFactor;
    return result;
  }
  get voyageLenthFactor() {
    return this.voyage.length > 14 ? -1 : 0;
  }

  get historyLengthFactor() {
    return this.history.length > 8 ? 1 : 0;
  }
}

class ExperiencedChinaRating extends Rating {
  get voyageProfitFactor() {
    return super.voyageProfitFactor + 3;
  }

  get captainHistoryRisk() {
    {
      const result = super.captainHistoryRisk - 2;
      return Math.max(result, 0);
    }
  }
  get voyageLenthFactor() {
    let result = 0;

    if (this.voyage.length > 12) result += 1;
    if (this.voyage.length > 18) result -= 1;

    return result;
  }

  get historyLengthFactor() {
    return this.history.length > 10 ? 1 : 0;
  }
}

function createRating(voyage, history) {
  if (voyage.zone === '중국' && history.some((v) => '중국' === v.zone)) return new ExperiencedChinaRating(voyage, history);
  else return new Rating(voyage, history);
}

```
