
// import { fetchProducts } from "@/api/fetchProduct";
// import HotListClient from "./HotListClient";
import SectionHeader from "../CommonComponents/SectionHeader";

const HotListWrapper = async () => {
  // const res = await fetchProducts();
  // const product = res.data;

  return (
    <div>
      <SectionHeader title={"Hot List"}/>
      {/* <HotListClient products={product} /> */}
    </div>
  );
};

export default HotListWrapper;
