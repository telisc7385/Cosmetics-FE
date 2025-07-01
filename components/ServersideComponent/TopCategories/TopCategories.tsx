// TopCategories.tsx
import { fetchTopCategories } from '@/api/fetchTopCategories';
import TopCategoriesClient from '../../ClientsideComponent/TopCategoriesClient/TopCategoriesClient';

export default async function TopCategories() {
  const categories = await fetchTopCategories();

  return <TopCategoriesClient categories={categories} />;
}
