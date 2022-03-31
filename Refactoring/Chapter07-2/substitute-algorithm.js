export function foundPerson(people) {
  for (let i = 0; i < people.length; i++) {
    if (people[i] === 'Don') {
      return 'Don';
    }
    if (people[i] === 'John') {
      return 'John';
    }
    if (people[i] === 'Kent') {
      return 'Kent';
    }
  }
  return '';
}

export function foundPersonNew(people) {
  const candiates = ['Don', 'John', 'Kent'];
  return people.find((p) => candiates.includes(p)) || '';
}
let people = ['Don', 'John', 'Kent'];
console.log(foundPersonNew(people));
