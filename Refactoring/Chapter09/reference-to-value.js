//추출해서 새로 만들어진 객체(TelephoneNumber)를 갱신하는 메서드들은 여전히
//추출 전 클래스(Person)에 존재한다.
//새 클래스를 가리키는 참조가 하나뿐이므로 참조를 값으로 바꾸기에 좋은 상황이다.

// class Person {
//   constructor() {
//     this._telephoneNumber = new TelephoneNumber();
//   }
//   get officeAreaCode() {
//     return this._telephoneNumber.areaCode;
//   }
//   set officeAreaCode(arg) {
//     this._telephoneNumber.areaCode = arg;
//   }
//   get officeNumber() {
//     return this._telephoneNumber.number;
//   }
//   set officeNumber(arg) {
//     return (this._telephoneNumber.number = arg);
//   }
// }

// class TelephoneNumber {
//   get areaCode() {
//     return this._areaCode;
//   }
//   set areaCode(arg) {
//     this._areaCode = arg;
//   }
//   get number() {
//     return this._number;
//   }
//   set number(arg) {
//     this._number = arg;
//   }
// }

//추출해서 새로 만들어진 객체(TelephoneNumber)를 갱신하는 메서드들은 여전히
//추출 전 클래스(Person)에 존재한다.
//새 클래스를 가리키는 참조가 하나뿐이므로 참조를 값으로 바꾸기에 좋은 상황이다.

class Person {
  constructor(areaCode, number) {
    this._telephoneNumber = new TelephoneNumber(areaCode, number);
  }
  get officeAreaCode() {
    return this._telephoneNumber.areaCode;
  }
  set officeAreaCode(arg) {
    // this._telephoneNumber.areaCode = arg;
    this._telephoneNumber = new TelephoneNumber(arg, this.officeNumber);
  }
  get officeNumber() {
    return this._telephoneNumber.number;
  }
  set officeNumber(arg) {
    // return (this._telephoneNumber.number = arg);
    this._telephoneNumber = new TelephoneNumber(this.officeAreaCode, arg);
  }
}

class TelephoneNumber {
  //1. 전화번호를 불변으로 만들기
  //2. 필드들의 세터들만 제거. 제거의 첫 단계로 세터로 설정하던 두 필드를
  //생성자에서 입력받아 설정하도록 한다. (함수 선언 바꾸기)
  constructor(areaCode, number) {
    this._areaCode = areaCode;
    this._number = number;
  }

  //3. 값 객체로 인정받으려면 동치성을 값 기반으로 평가해야 한다.
  equls(other) {
    if (!(other instanceof TelephoneNumber)) return false;
    return this.areaCode === other.areaCode && this.number === other.number;
  }

  get areaCode() {
    return this._areaCode;
  }
  //   set areaCode(arg) {
  //     this._areaCode = arg;
  //   }
  get number() {
    return this._number;
  }
  //   set number(arg) {
  //     this._number = arg;
  //   }
}

const person = new Person(10, '10-232-123');
// person.officeAreaCode = 1;
// // person.officeNumber = 2;
// console.log(person.officeAreaCode);
// console.log(person.officeNumber);
const tel = new TelephoneNumber('312', '555-1111');
const tel2 = new TelephoneNumber('312', '555-1111');

console.log(tel.equls(tel2));
