import { FeaturedRestaurants } from "@/components/home/featured-restaurants";
import { getFeaturedRestaurants } from "@/lib/server";

const page = async () => {
  const featuredRestaurants = await getFeaturedRestaurants(3.0);
  return <FeaturedRestaurants restaurants={featuredRestaurants} />;
};

export default page;
