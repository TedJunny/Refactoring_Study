## Chapter 03. 코드에서 나는 악취
- 리팩터링을 언제 시작하고 언제 그만할지를 판단하는 일은 리팩터링의 작동 원리를 아는 것 못지않게 중요하다.
- 다음의 패턴들은 리팩터링을 통해서 해결할 수 있는 문제의 징후들이다. 평소 개발을 하며 해당 패턴들을 발견하게 되면, </br>
악취를 느끼며 리팩터링을 적용할 마음을 먹어야 한다.

</br>

### 1. 기이한 이름 (Mysterious Name)
```
- 코드는 단순하고 명료하게 작성하는 것이 중요하며, 올바른 이름을 짓는 것이 그 핵심이다.
- 함수, 모듈, 변수, 클래스 등이 그 이름만 보아도 어떤 역할을 수행하는지 알 수 있도록 신경써야 한다.
- 이름만 잘 지어도 나중에 문맥을 파악하느라 헤매는 시간을 절약할 수 있다. 
```
> Refactoring Techniques : `함수 선언 바꾸기`, `변우 이름 바꾸기`, `필드 이름 바꾸기`

</br>

### 2. 중복 코드 (Duplicated Code)
```
- 코드가 중복되면 각각을 볼 때마다 서로 차이점은 없는지 주의 깊게 살펴봐야 하는 부담이 생긴다.
- 그 중 하나를 변경할 때는 다른 비슷한 코드들도 모두 살펴보고 적절히 수정해야 한다.
- 똑같은 코드 구조가 여러 곳에서 반복된다면 하나로 통합하여 더 나은 프로그램으로 만들 고민을 해야 한다.
```
> Refactoring Techniques : `함수 추출하기`, `문장 슬라이드하기`, `매서드 올리기`

</br>

### 3. 긴 함수 (Long Function)
```
- 오랜 기간 잘 활용되는 프로그램들은 하나같이 짧은 함수로 구성됐다.
- 짧은 함수를 사용할 때, 코드를 이해하고, 공유하고, 선택하기가 쉬워진다.
- 함수 추출하기 기법을 통해서 대부분의 함수를 짧게 만들 수 있다.
- 주석을 통해 코드의 일부를 설명하는 경우에도 함수 추출하기를 통해 따로 구현하는 것이 좋다.
- 매개변수 목록이 많아지는 경우, 추출 작업을 어렵게 하기 때문에 리팩터링을 통해 매개변수의 수를 줄여야 한다.
```
> Refactoring Techniques : `함수 추출하기`, `임시 변수를 질의 함수로 바꾸기`, `매개변수 객체 만들기`, `객체 통째로 넘기기`, </br> 
> `함수를 명령으로 바꾸기`, `조건문 분해하기`, `함수 추출하기`, `조건부 로직을 다형성으로 바꾸기`, `반복문 쪼개기`

</br>

### 4. 긴 매개변수 목록 (Long Parameter List)
```
- 매개변수 목록이 길어지면 그 자체로 함수를 이해하기 어려워질 때가 많다.
- 객체를 통째로 넘기거나, 매개변수 객체를 만들어 넘기자.
- 여러 함수를 클래스로 묶는다면 매개변수를 줄일 수 있다.
```
> Refactoring Techniques : `매개변수를 질의 함수로 바꾸기`, `객체 통째로 넘기기`, `매개변수 객체 만들기`, `플래그 인수 제거하기`, `여러 함수를 클래스로 묶기`

</br>

### 5. 전역 데이터 (Global Data)
```
- 전역 데이터가 많아지게 되면 버그가 발생했을 때 원인을 찾기가 어려워진다.
- 수많은 전역 데이터는 코드가 유발하는 악취 중에 가장 지독한 축에 속한다.
- 전역 데이터의 대표적인 형태는 전역 변수지만 클래스 변수와 싱글톤에서도 같은 문제가 발생한다.
```
> Refactoring Techniques : `변수 캡슐화하기`

</br>

### 6. 가변 데이터 (Mutable Data)
```
- 데이터를 변경했더니 예상치 못한 결과나 골치 아픈 버그로 이어지는 경우가 종종 있다.
- 다른 곳에서 원치않은 수정으로 인해 버그가 발생할 수 있는 경우에는 수정이 불가능 하게 만들어야 한다.
```
> Refactoring Techniques : `변수 캡슐화하기`, `변수 쪼개기`, `문장 슬라이드하기`, `함수 추출하기`, `질의 함수와 변경 함수 분리하기`, `세터 제거하기`, </br>
> `파생 변수를 질의 함수로 바꾸기`, `여러 함수를 클래스로 묶기`, `여러 함수를 변환 함수로 묶기`, `참조를 값으로 바꾸기`

</br>

### 7. 뒤엉킨 변경 (Divergent Change)
```
- 뒤엉킨 변경은 단일 책임 원칙이 제대로 지켜지지 않을 때 나타난다.
- 하나의 모듈이 서로 다른 이유로 인해 여러 가지 방식으로 변경되는 일이 많을 때 발생한다.
```
> Refactoring Techniques : `단계 쪼개기`, `함수 옮기기`, `함수 추출하기`, `클래스 추출하기`

</br>

### 8. 산탄총 수술 (Shotgun Surgery)
```
- 코드를 변경할 때마다 자잘하게 수정해야 하는 클래스가 많을 때 풍기는 악취가 산탄총 수술이다.
```
> Refactoring Techniques : `함수 옮기기`, `필드 옮기기`, `여러 함수를 클래스로 묶기`, `여러 함수를 변환 함수로 묶기`, `단계 쪼개기`, </br>
> `함수 인라인하기`, `클래스 인라인하기`

</br>

### 9. 기능 편애 (Feature Envy)
```
- 모듈화할 때는 코드를 여러 영역으로 나눈 뒤 영역 안에서 이뤄지는 상호작용은 최대한 늘리고 영역 사이에서 이뤄지는 상호작용은 최소로 줄이는 데 주력한다.
- 기능 편애는 흔히 어떤 함수가 자기가 속한 모듈의 함수나 데이터보다 다른 모듈의 함수나 데이터와 상호작용 할 일이 더 많을 때 풍기는 냄새다.
```
> Refactoring Techniques : `함수 옮기기`, `함수 추출하기`

</br>

### 10. 데이터 뭉치 (Data Clumps)
```
- 여러 데이터가 반복적으로 같이 뭉쳐다니는 것을 목격한다면 악취를 느낄 수 있어야 한다.
- 새로운 보금자리를 객체를 활용해서 마련하는 방식으로 악취를 제거해보자.
```
> Refactoring Techniques : `클래스 추출하기`, `매개변수 객체 만들기`, `객체 통째로 넘기기`

</br>

### 11. 기본형 집착 (Primitive Obsession)
```
- 프로그래머 중에는 자신에게 주어진 문제에 딱 맞는 기초 타입(화폐, 좌표, 구간 등)을 직접 정의하기를 몹시 꺼리는 사람이 많다.
- 특히나 문자열을 다루는 작업에서 많이 발생하는 악취이다.
```
> Refactoring Techniques : `기본형을 객체로 바꾸기`, `타입 코드를 서브 클래스로 바꾸기`, `조건부 로직을 다형성으로 바꾸기`, `클래스 추출하기`, </br>
> `매개변수 객체 만들기`

</br>

### 12. 반복되는 switch문 (Repeated Switches)
```
- Switch 문이 반복되어 나타날 때 다형성을 활용해서 코드를 개선시켜보자.
```
> Refactoring Techniques : `조건부 로직을 다형성으로 바꾸기`

</br>

### 13. 반복문 (Loops)
```
- 반복문을 파이프라인으로 바꿔서 더 나은 코드 구조를 유지할 수 있다. 
```
> Refactoring Techniques : `반복문을 파이프라인으로 바꾸기`
</br>

### 14. 성의 없는 요소 (Lazy Element)
```
- 굳이 필요하지 않은 경우에 프로그램 요소를 활용했다면 리팩터링을 하자.
```
> Refactoring Techniques : `함수 인라인하기`, `클래스 인라인하기`, `계층 합치기`

</br>

### 15. 추측성 일반화 (Speculative Generality)
```
- 미래를 대비해 작성한 코드가 현재 시점에서 적절하지 않다고 판단이 될 때에는 수정을 해야 한다.
```
> Refactoring Techniques : `계층 합치기`, `함수 인라인하기`, `클래스 인라인하기`, `함수 선언 바꾸기`, `죽은 코드 제거하기`

</br>

### 16. 임시 필드 (Temporary Field)
```
- 특정 상황에서만 값이 설정되는 필드를 가진 클래스가 풍기는 악취이다.
- 임시 필드는 사용자가 코드 구조를 파악하는데 어려움을 발생시킨다.
```
> Refactoring Techniques : `클래스 추출하기`, `함수 옮기기`, `특이 케이스 추가하기`

</br>

### 17. 메시지 체인 (Message Chains)
```
- 객체를 통해 다른 객체를 얻는 과정이 연쇄적으로 이어질 때 발생하는 악취.
```
> Refactoring Techniques : `위임 숨기기`, `함수 추출하기`, `함수 옮기기`

</br>

### 18. 중개자 (Middle Man)
```
- 객체의 대표 기능인 캡슐화를 사용하는 과정에서 구현을 위임하는 경우가 자주 발생한다.
- 지나친 위임은 문제를 발생할 수 있어 리팩토링을 해야 한다.
```
> Refactoring Techniques : `중개자 제거하기`, `함수 인라인하기`

</br>

### 19. 내부자 거래 (Insider Trading)
```
- 모듈 사이에 데이터 거래가 많아지면 결합도가 높아져서 여러 문제가 발생한다.
```
> Refactoring Techniques : `함수 옮기기`, `필드 옮기기`, `위임 숨기기`, `서브클래스를 위임으로 바꾸기`, `슈퍼클래스를 위임으로 바꾸기`

</br>

### 20. 거대한 클래스 (Large Class)
```
- 한 클래스가 너무 많은 일을 하다 보면 필드 수가 상당히 늘어난다.
- 클래스에 필드가 너무 많으면 중복 코드가 생기기 쉬워, 악취가 난다.
```
> Refactoring Techniques : `클래스 추출하기`, `슈퍼클래스 추출하기`, `타입 코드를 서브클래스로 바꾸기`

</br>

### 21. 서로 다른 인터페이스의 대안 클래스들 (Alternative Classes with Different Interfaces)
```
- 클래스 간의 역할과 기능이 비슷하다면, 인터페이스를 일치화 시켜 교체가 쉽게 이루어질 수 있도록 리팩터링 하자.
```
> Refactoring Techniques : `함수 선언 바꾸기`, `함수 옮기기`, `슈퍼 클래스 추출하기`

</br>

### 22. 데이터 클래스 (Data Class)
```
- 데이터 저장 용도로만 정의된 클래스가 유발할 수 있는 악취이다.
- 클래스 외부에서 데이터를 임의로 변경하는 것을 방지할 수 있는 리팩터링이 필요하다.
``` 
> Refactoring Techniques : `레코드 캡슐화하기`, `세터 제거하기`, `함수 옮기기`, `함수 추출하기`, `단계 쪼개기`

</br>

### 23. 상속 포기 (Refused Bequest)
```
- 서브 클래스에서 부모 클래스의 메서드와 데이터를 물려받기 싫어하는 경우에 풍기는 악취이다.
- 이럴 때는 서브클래스를 위임으로 바꾸기나 슈퍼클래스를 위임으로 바꾸기를 활용해서 아예 상속 매커니즘에서 벗어나보자.
```
> Refactoring Techniques : `서브 클래스를 위임으로 바꾸기`, `슈퍼클래스를 위임으로 바꾸기`

</br>

### 24. 주석 (Comment)
```
- 주석을 달면 안 되는 것은 아니다. 주석은 악취가 아닌 향기를 입힌다.
- 하지만 주석을 탈취제처럼 사용하게 되는 경우에는 문제가 된다.
- 주석을 남겨야겠다는 생각이 들면, 가장 먼저 주석이 필요 없는 코드로 리팩터링해본다.
```
> Refactoring Techniques : `함수 추출하기`, `함수 선언 바꾸기`, `어서션 추가하기`
