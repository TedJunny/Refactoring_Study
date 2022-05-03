class Employee extends Party {
  constructor(name, grade) {
    this._name = name;
    this._grade = grade;
    this.finishConstruction();
  }

  finishConstruction() {
    if (this.isPrivilieged) this.assignCar();
  }

  get isPrivilieged() {
    //something..
  }
  assignCar() {
    //something..
  }
}

class Manager extends Employee {
  constructor(name, grade) {
    super(name, grade);
  }
}
