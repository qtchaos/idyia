import { getAllUsers } from "$lib/server/queries";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const users = await getAllUsers();
  return { users };
};
