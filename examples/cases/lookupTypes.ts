import {SyncFunction} from "../types";

type User = {
  name: string;
  salary: number;
  email: string;
  retired: boolean;
};

const getUserByEmail: SyncFunction = (email: string) => ({});

const getUserByEmailTRW: SyncFunction = (email: User["email"]) => ({});