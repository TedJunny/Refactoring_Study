const organization = { name: 'GloZ', country: 'KR' };

//여기서 name -> title로 변경하고싶다.

//2. 캡슐화
class Organization {
  constructor(data) {
    this._name = data.name;
    this._country = data.country;
  }

  get name() {
    return this._name;
  }
  set name(aString) {
    this._name = aString;
  }
  get country() {
    return this._country;
  }
  set country(aCountryCode) {
    this._country = aCountryCode;
  }
}

const organization_new = new Organization({ name: 'GloZ', country: 'KR' });

//입력 데이터 구조를 내부 데이터 구조로 복제했으므로 둘을 구분해야 독립적으로 작업할 수 있다.
//3. 별도의 필드를 정의하고 생성자와 접근자에서 둘을 구분해 사용하도록 하자.

// class Organization2 {
//   constructor(data) {
//     this._title = data.title != undefined ? data.title : data.name; //생성자에서 title도 받아들일 수 있도록 조치한다.
//     this._country = data.country;
//   }

//   get name() {
//     return this._title;
//   }
//   set name(aString) {
//     this._title = aString;
//   }
//   get country() {
//     return this._country;
//   }
//   set country(aCountryCode) {
//     this._country = aCountryCode;
//   }
// }

//name을 사용할 수 있게 하던 코드들 제거 + 접근자 이름 수정
const organization2 = new Organization2({ title: 'GloZ', country: 'KR' });
console.log(organization2.name);
console.log(organization2.country);

class Organization2 {
  constructor(data) {
    this._title = data.title;
    this._country = data.country;
  }

  get title() {
    return this._title;
  }
  set title(aString) {
    this._title = aString;
  }
  get country() {
    return this._country;
  }
  set country(aCountryCode) {
    this._country = aCountryCode;
  }
}
