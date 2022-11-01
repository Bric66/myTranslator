const dbuser = new Map();

export type User = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  userId: string;
};

export class UserStorage {
  save(user: User) {
    dbuser.set(user.email, user);
  }

  getByEmail(email: string) {
    return dbuser.get(email);
  }
}
