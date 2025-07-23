// api/fetchStats.ts
import { apiCore } from "./ApiCore";

export interface HomepageStat {
  id: number;
  title: string;
  number: number;
  is_active: boolean;
}

export const fetchHomepageStats = async (): Promise<HomepageStat[]> => {
  const res = await apiCore<{ results: HomepageStat[] }>("/homepage_statistics?is_active=true", "GET");
  return res.results;
};
