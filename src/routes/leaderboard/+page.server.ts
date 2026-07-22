import { getLeaderboard } from "$lib/server/queries";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const leaders = await getLeaderboard();
  return { leaders };
};
