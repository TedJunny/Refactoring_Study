class Party {
  get monthlyCost() {
    throw new SubclassResponsibilityError();
  }
  get annualCost() {
    return this.monthlyCost * 12;
  }
}

class Employee extends Party {
  //something else..
  monthlyCost = 12;
}

class Department extends Party {
  //something else..
}

const emp = new Employee();
const depar = new Department();

console.log(depar.annualCost);
