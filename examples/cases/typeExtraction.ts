const objectLiteral = {
  name: 'Juan Bautista Jr Xabadú',
  color: 'orange',
  pets: false,
  age: 102
};

type UserFromObject = typeof objectLiteral;

const mrX: UserFromObject = {
  name: undefined,
  color: 2,
  pets: 5,
  age: '15'
};

const stu:UserFromObject = {
  name: 'Stu',
  color: 'white',
  pets: false,
  age: 54
};