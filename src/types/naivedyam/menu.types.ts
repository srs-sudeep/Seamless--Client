export interface MenuFoodTag {
  id: number;
  name: string;
}

export interface MenuFoodItem {
  id: number;
  name: string;
  tag: MenuFoodTag;
}

export interface Menu {
  id: number;
  vendor_id: string;
  day_of_week: string;
  meal_type: string;
  food_items: MenuFoodItem[];
}

export interface CreateMenuDto {
  vendor_id: string;
  day_of_week: string;
  meal_type: string;
  food_items: string[]; // array of food item names or ids for creation
  tag_id?: string; // optional, for creation
}
