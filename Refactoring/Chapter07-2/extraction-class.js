class Person {
  #name = '';
  #officeAreaCode = 0;
  #officeNumber = 0;

  constructor(data) {
    this.#name = data.name;
    this.#officeAreaCode = data.areaCode;
    this.#officeNumber = data.number;
  }
  get name() {
    return this.#name;
  }
  set name(arg) {
    this.#name = arg;
  }

  get telephoneNumber() {
    return `(${this.officeAreaCode}) ${this.officeNumber}`;
  }

  get officeAreaCode() {
    return this.#officeAreaCode;
  }
  set officeAreaCode(arg) {
    this.#officeAreaCode = arg;
  }

  get officeNumber() {
    return this.#officeNumber;
  }
  set officeNumber(arg) {
    this.#officeNumber = arg;
  }
}

// const person = new Person({name: '마고', areaCode: '010', number: '1111-2212'});

// console.log(person.telephoneNumber);
// console.log(person.name);

class TelephoneNumber {
  constructor(data) {
    this._areaCode = data.areaCode;
    this._number = data.number;
  }
  get areaCode() {
    return this._areaCode;
  }
  set areaCode(arg) {
    this._areaCode = arg;
  }

  get number() {
    return this._number;
  }
  set number(arg) {
    return (this._number = arg);
  }

  toString() {
    return `(${this.areaCode}) ${this.number}`;
  }
}

class Person2 {
  constructor(data) {
    this._name = data.name;
    this._telephoneNumber = new TelephoneNumber({areaCode: data.areaCode, number: data.number});
  }
  get name() {
    return this._name;
  }
  set name(arg) {
    this._name = arg;
  }

  get officeAreaCode() {
    return this._telephoneNumber.areaCode;
  }
  set officeAreaCode(arg) {
    this._telephoneNumber.areaCode = arg;
  }
  get officeNumber() {
    return this._telephoneNumber.number;
  }
  set officeNumber(arg) {
    this._telephoneNumber.number = arg;
  }
  get telephoneNumber() {
    return this._telephoneNumber.toString();
  }
}

const person = new Person2({name: '마고', areaCode: '010', number: '111-1131'});
person._name = '빵꾸';
console.log(person.telephoneNumber);
console.log(person.name);

//의문점
//person._name = '빵꾸'; 이렇게 해도 프로퍼티의 값이 변경이 된다. 완전히 캡슐화 하려면 setter, getter를 사용하는 놈들은
//#로(private) 선언해줘야 진짜로 캡슐화 하는것 아닌가?
