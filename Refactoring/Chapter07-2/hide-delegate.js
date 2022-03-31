// 결국 필요한건 manager인데, manager에 닿으려면 department를 거쳐야 한다.
// 필요한 값을 받로 받아올 수 있는 위임 메서드를 만들자.

class Person {
  constructor(data) {
    this._name = data.name;
    this._department = new Department({chargeCode: data.chargeCode, department: data.department, manager: data.manager});
  }
  get name() {
    return this._name;
  }
  set name(arg) {
    this._name = arg;
  }
  get department() {
    return this._department;
  }
  set department(arg) {
    return (this._department = arg);
  }
}

class Department {
  constructor(data) {
    this._chargeCode = data.chargeCode;
    this._department = data.department;
    this._manager = data.manager;
  }
  get chargeCode() {
    return this._chargeCode;
  }
  set chargeCode(arg) {
    this._chargeCode = arg;
  }

  get manager() {
    return this._manager;
  }
  set manager(arg) {
    this._manager = arg;
  }
}

const person = new Person({name: 'bon', chargeCode: '123', department: 'rnd', manager: 'Mago'});
console.log(person.department);

//클라이언트에서 어떤 사람이 속한 부서의 관리자를 알고 싶다고 하자. 그러기 위해선 부서 객체부터 얻어와야 한다.
const manager = person.department.manager;
console.log(manager);

//이 경우, 클라이언트는 부서 클래스의 작동 방식, 즉 부서 클래스가 관리자 정보를 제공한다는 사실을 알고 있어야 한.
//이러한 의존성을 줄이려면 클라이언트가 부서 클래스를 볼 수 없게 숨기고, 대신 사람 클래스에 간단한 위임 메서드를 만들면 된다.

class Person2 {
  constructor(data) {
    this._name = data.name;
    this._department = new Department({chargeCode: data.chargeCode, department: data.department, manager: data.manager});
  }
  get name() {
    return this._name;
  }
  set name(arg) {
    this._name = arg;
  }
  get department() {
    return this._department;
  }
  set department(arg) {
    return (this._department = arg);
  }
  get manager() {
    return this._department.manager;
  }
}

const person2 = new Person2({name: 'bon', chargeCode: '123', department: 'rnd', manager: 'Mago'});
const manager2 = person2.manager;
console.log(manager2);
