export type ShopCategoryGroup = {
  category: string;
  subcategories: string[];
};

export const SHOP_TAXONOMY: ShopCategoryGroup[] = [
  {
    category: "Feeding Bottles",
    subcategories: [
      "Anti-Colic Bottles",
      "Glass Bottles",
      "Bottle Nipples",
      "Sterilizers",
      "Sippy Cups",
    ],
  },
  {
    category: "Boys Clothes",
    subcategories: [
      "Tops",
      "Bottoms",
      "Matching Sets",
      "Sleepwear",
      "Jackets",
    ],
  },
  {
    category: "Girls Clothes",
    subcategories: [
      "Dresses",
      "Tops",
      "Bottoms",
      "Matching Sets",
      "Cardigans",
    ],
  },
  {
    category: "Diapering",
    subcategories: [
      "Diapers",
      "Wipes",
      "Rash Cream",
      "Changing Mats",
      "Disposal Bags",
    ],
  },
  {
    category: "Shoes",
    subcategories: [
      "Crib Shoes",
      "Sneakers",
      "Sandals",
      "Boots",
      "Slip-Ons",
    ],
  },
  {
    category: "Baby Wears",
    subcategories: [
      "Onesies",
      "Rompers",
      "Bodysuits",
      "Sleep Suits",
      "Swaddles",
    ],
  },
  {
    category: "Toys",
    subcategories: [
      "Rattles",
      "Teethers",
      "Plush Toys",
      "Learning Toys",
      "Stacking Toys",
    ],
  },
  {
    category: "Bags",
    subcategories: [
      "Diaper Bags",
      "Bottle Bags",
      "Travel Organizers",
      "Changing Clutches",
      "Storage Pouches",
    ],
  },
  {
    category: "Walkers",
    subcategories: [
      "Push Walkers",
      "Activity Walkers",
      "Sit-In Walkers",
      "Walker Accessories",
    ],
  },
  {
    category: "Carriers",
    subcategories: [
      "Wrap Carriers",
      "Ring Slings",
      "Hip Seat Carriers",
      "Structured Carriers",
    ],
  },
];

export function findShopCategoryGroup(category: string): ShopCategoryGroup | undefined {
  const normalized = category.trim().toLowerCase();
  return SHOP_TAXONOMY.find((group) => group.category.toLowerCase() === normalized);
}