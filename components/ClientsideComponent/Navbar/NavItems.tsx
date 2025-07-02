// export const dynamic = "force-dynamic";

// import Link from "next/link";
// import { getNavbarData } from "@/api/NavbarApi";
// import { NavItem } from "@/types/nav";

// const NavItems = async () => {
//   let navItems: NavItem[] = [];

//   try {
//     const response = await getNavbarData();
//     if (Array.isArray(response.result)) {
//       navItems = response.result;
//     }
//   } catch (error) {
//     console.error("❌ Navbar fetch failed:", error);
//   }

//   return (
//     <ul className="flex gap-10">
//       {navItems.map((item: NavItem) =>
//         item.is_active ? (
//           <li key={item.id}>
//             <Link href={item.link || "#"}>
//               <span className="hover:text-blue-600">{item.name}</span>
//             </Link>
//           </li>
//         ) : null
//       )}
//     </ul>
//   );
// };

// export default NavItems;




export const dynamic = "force-dynamic";

import Link from "next/link";
import { getNavbarData } from "@/api/NavbarApi";

import { NavItem } from "@/types/nav";
import { Category } from "@/types/category"; 
import { fetchCategories } from "@/api/fetchCategories";

const NavItems = async () => {
  let navItems: NavItem[] = [];
  let categories: Category[] = [];

  try {
    const navResponse = await getNavbarData();
    if (Array.isArray(navResponse.result)) {
      navItems = navResponse.result;
    }

    const catResponse = await fetchCategories();
    if (catResponse.success && Array.isArray(catResponse.categories)) {
      categories = catResponse.categories.filter((c) => !c.isDeleted);
    }
  } catch (error) {
    console.error(" Navbar or Categories fetch failed:", error);
  }

  return (
    <ul className="flex gap-10">
      {navItems.map((item: NavItem) =>
        item.is_active ? (
          item.name.toLowerCase() === "categories" ? (
            <li key={item.id} className="relative group">
              <span className="hover:text-blue-600 cursor-pointer">
                {item.name}
              </span>

              {/* Dropdown menu */}
              <ul className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-400 rounded shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 z-50">
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link href={`/category/${cat.id}`}>
                      <span className="block px-4 py-2 hover:bg-[#edf3f8] ">
                        {cat.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ) : (
            <li key={item.id}>
              <Link href={item.link || "#"}>
                <span className="hover:text-blue-600">{item.name}</span>
              </Link>
            </li>
          )
        ) : null
      )}
    </ul>
  );
};

export default NavItems;
