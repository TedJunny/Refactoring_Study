const height = 100;
const width = 100;

let temp = 2 * (height + width);
console.log(temp);
temp = height * width;
console.log(temp);

function distanceTrabvelled(scenario, time) {
  let result;
  let acc = scenario.primaryForce / scenario.mass; //가속도(a) = 힘(F)/질량(m)
  let primaryTime = Math.min(time, scenario.delay);
  result = 0.5 * acc * primaryTime * primaryTime; //전파된 거리
  let secondaryTime = time - scenario.delay;
  if (secondaryTime > 0) {
    //두 번째 힘을 반영해 다시 계산
    let primaryVelocity = acc * scenario.delay;
    acc = (scenario.primaryForce + scenario.secondaryTime) / scenario.mass; //acc 변수에 값이 두 번 대입되고 있음.
    result += primaryVelocity * secondaryTime + 0.5 * acc * secondaryTime * secondaryTime;
  }
  return result;
}

function new_distanceTrabvelled(scenario, time) {
  let result;
  let primaryAcceleration = scenario.primaryForce / scenario.mass; //가속도(a) = 힘(F)/질량(m)
  let primaryTime = Math.min(time, scenario.delay);
  result = getDistance(primaryAcceleration, primaryTime); //전파된 거리 (0.5 * acceleraion * time * time)
  let secondaryTime = time - scenario.delay;
  if (secondaryTime > 0) {
    //두 번째 힘을 반영해 다시 계산
    let primaryVelocity = primaryAcceleration * scenario.delay;
    const secondaryAcceleration = (scenario.primaryForce + scenario.secondaryTime) / scenario.mass;
    result += primaryVelocity * secondaryTime + getDistance(secondaryAcceleration, secondaryTime);
  }
  return result;
}

function getDistance(acceleration, time) {
  return 0.5 * acceleration * time * time;
}

function discount(inputValue, quantity) {
  if (inputValue > 50) inputValue = inputValue - 2;
  if (quantity > 100) inputValue = inputValue - 1;
  return inputValue;
}

function new_discount(inputValue, quantity) {
  let result = inputValue;
  if (inputValue > 50) result = result - 2;
  if (quantity > 100) result = result - 1;
  return result;
}

console.log(discount(51, 101));
console.log(new_discount(51, 101));
