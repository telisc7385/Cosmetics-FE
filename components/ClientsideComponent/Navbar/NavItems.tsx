export const dynamic = "force-dynamic";

import Link from "next/link";
import { getNavbarData } from "@/api/NavbarApi";
import { NavItem } from "@/types/nav";

const NavItems = async () => {
  let navItems: NavItem[] = [];

  try {
    const response = await getNavbarData();
    if (Array.isArray(response.result)) {
      navItems = response.result;
    }
  } catch (error) {
    console.error("❌ Navbar fetch failed:", error);
  }

  return (
    <ul className="flex gap-10">
      {navItems.map((item: NavItem) =>
        item.is_active ? (
          <li key={item.id}>
            <Link href={item.link || "#"}>
              <span className="hover:text-blue-600">{item.name}</span>
            </Link>
          </li>
        ) : null
      )}
    </ul>
  );
};

export default NavItems;
