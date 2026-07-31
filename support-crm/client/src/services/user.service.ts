import { api } from "./api";
import type { User } from "../types/user";

export const userService = {
  async list() {
    const { data } = await api.get<User[]>("/users");
    return data;
  },
};
