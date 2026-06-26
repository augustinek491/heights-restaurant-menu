import { getMenuData } from "@/lib/firestore";
import { MenuApp } from "@/components/MenuApp";

// Revalidate every 60s (ISR) so menu edits made in the admin CMS show up
// without a full redeploy. getMenuData() never throws (each Firestore call
// is individually try/caught with empty-array/default fallbacks), so a build
// with no Firestore credentials available still succeeds — it just renders
// an empty menu shell until credentials are configured.
export const revalidate = 60;

export default async function Home() {
  const data = await getMenuData();
  return <MenuApp data={data} />;
}
