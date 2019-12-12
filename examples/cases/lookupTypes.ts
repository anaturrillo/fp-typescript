type User = {
  name: string,
  salary: number,
  email: string,
  retired: boolean
}

const getUserByEmail = (email: string) => {};

const getUserByEmailTRW = (email: User["email"]) => {};