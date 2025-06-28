import { HelmetWrapper } from '@/components/HelmetWrapper';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { useMenus } from '@/hooks/naivedyam/useMenu.hook';
import { useTags } from '@/hooks/naivedyam/useTags.hook';
import { useVendors } from '@/hooks/naivedyam/useVendors.hook';
import { ChefHat, User, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';

const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const MyMenuPage = () => {
  const { data: menus = [], isFetching: menusLoading } = useMenus();
  const { data: vendors = [], isFetching: vendorsLoading } = useVendors();
  const { data: tags = [], isFetching: tagsLoading } = useTags();
  const [selectedVendor, setSelectedVendor] = useState<string>('all');

  // Filter menus for selected vendor
  const filteredMenus = useMemo(
    () => menus.filter(m => selectedVendor === 'all' || m.vendor_id === selectedVendor),
    [menus, selectedVendor]
  );

  // Get all unique meal types from filtered menus
  const availableMealTypes = useMemo(() => {
    const mealTypeSet = new Set<string>();
    filteredMenus.forEach(menu => {
      if (menu.meal_type) {
        mealTypeSet.add(menu.meal_type);
      }
    });
    return Array.from(mealTypeSet);
  }, [filteredMenus]);

  // Create unified table data structure: Meal Type -> Categories -> Days
  const tableData = useMemo(() => {
    return availableMealTypes.map(mealType => {
      // Get all unique categories for this meal type
      const categoriesForMealType = new Set<string>();
      filteredMenus
        .filter(menu => menu.meal_type === mealType)
        .forEach(menu => {
          menu.food_items.forEach(item => {
            if (item.tag?.name) {
              categoriesForMealType.add(item.tag.name);
            }
          });
        });

      const categories = Array.from(categoriesForMealType);

      return {
        mealType,
        categories: categories.map(category => ({
          category,
          cells: WEEKDAYS.map(day => {
            const menu = filteredMenus.find(m => m.meal_type === mealType && m.day_of_week === day);
            const items = menu ? menu.food_items.filter(item => item.tag?.name === category) : [];
            return { day, items, menu };
          }),
        })),
      };
    });
  }, [availableMealTypes, filteredMenus]);

  const selectedVendorName =
    vendors.find(v => v.ldapid === selectedVendor)?.ldapid || selectedVendor;

  // Render cell content (read-only)
  const renderCell = (items: any[], mealType: string, category: string, day: string, menu: any) => {
    const isEmpty = items.length === 0;

    return (
      <td
        key={`${mealType}-${category}-${day}`}
        className={`
          relative border border-border p-2 min-w-[120px] min-h-[60px]
          transition-all duration-200
          ${isEmpty ? 'bg-muted' : 'bg-background'}
        `}
      >
        {isEmpty ? (
          <div className="flex items-center justify-center h-full min-h-[60px] text-muted-foreground">
            <span className="text-xs">No items</span>
          </div>
        ) : (
          <div className="text-xs space-y-1 overflow-hidden py-1">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium break-words"
              >
                {item.name}
              </div>
            ))}
          </div>
        )}
      </td>
    );
  };

  // Get meal type color
  const getMealTypeColor = (mealType: string) => {
    switch (mealType.toLowerCase()) {
      case 'breakfast':
        return 'bg-orange-500 border-orange-500';
      case 'lunch':
        return 'bg-green-500 border-green-500';
      case 'dinner':
        return 'bg-blue-500 border-blue-500';
      case 'snacks':
        return 'bg-purple-500 border-purple-500';
      default:
        return 'bg-primary border-primary';
    }
  };

  if (menusLoading || vendorsLoading || tagsLoading) {
    return (
      <HelmetWrapper
        title="My Menu"
        heading="My Menu"
        subHeading="View weekly menu schedule across all vendors"
      >
        <div className="flex justify-center items-center h-40">
          <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
        </div>
      </HelmetWrapper>
    );
  }

  return (
    <HelmetWrapper
      title="My Menu"
      heading="My Menu"
      subHeading="View weekly menu schedule across all vendors"
    >
      <div className="space-y-12">
        {/* Header Controls (View Only) */}
        <div className="flex justify-start mb-8">
          <div className="flex items-center gap-3">
            <Select value={selectedVendor} onValueChange={setSelectedVendor}>
              <SelectTrigger className="w-full sm:min-w-[200px] lg:min-w-[220px] flex justify-between items-center h-10 sm:h-11 text-sm bg-background border-muted text-foreground hover:bg-muted">
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="truncate">{selectedVendorName || 'Select Vendor'}</span>
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vendors</SelectItem>
                {vendors.map(v => (
                  <SelectItem key={v.ldapid} value={v.ldapid}>
                    {v.ldapid}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Menu Tables by Meal Type (Read Only) */}
        {tableData.length === 0 ? (
          <div className="text-center py-16 bg-background rounded-xl shadow-lg">
            <ChefHat className="w-20 h-20 text-muted-foreground mx-auto mb-6" />
            <div className="text-muted-foreground text-xl font-semibold">
              No menu data available
            </div>
            <div className="text-muted-foreground text-base mt-3">
              No menus have been created yet
            </div>
          </div>
        ) : (
          tableData.map(mealGroup => (
            <div key={mealGroup.mealType} className="mb-10">
              <div className="relative flex">
                {/* Vertical Meal Type Flag */}
                <div className="relative mr-4">
                  <div
                    className={`absolute left-0 top-0 h-full w-16 ${getMealTypeColor(mealGroup.mealType)} rounded-l-xl shadow-lg`}
                  >
                    <div className="h-full flex items-center justify-center">
                      <div className="transform -rotate-90 whitespace-nowrap">
                        <h2 className="text-2xl font-bold text-background tracking-wider uppercase">
                          {mealGroup.mealType}
                        </h2>
                      </div>
                    </div>
                  </div>
                  {/* Flag triangle */}
                  <div
                    className={`absolute right-0 top-1/2 transform translate-x-full -translate-y-1/2 w-0 h-0 border-l-[20px] ${getMealTypeColor(mealGroup.mealType).split(' ')[0].replace('bg-', 'border-l-')} border-t-[15px] border-t-transparent border-b-[15px] border-b-transparent`}
                  ></div>
                </div>

                {/* Menu Table */}
                <div className="flex-1 overflow-x-auto shadow-2xl rounded-r-xl bg-background ml-12">
                  <table className="min-w-full relative">
                    <thead>
                      <tr className="bg-primary text-background">
                        <th className="sticky left-0 z-10 px-6 py-5 text-left font-bold border border-border bg-primary">
                          <div className="flex items-center space-x-3">
                            <ChefHat className="w-5 h-5" />
                            <span className="text-lg">Category</span>
                          </div>
                        </th>
                        {WEEKDAYS.map(day => (
                          <th
                            key={day}
                            className="px-4 py-5 text-center font-bold border border-border min-w-[180px] capitalize"
                          >
                            <div className="text-sm leading-tight">{day}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {mealGroup.categories.map((categoryRow, categoryIndex) => (
                        <tr
                          key={categoryRow.category}
                          className={`
                            border-b border-border
                            ${categoryIndex % 2 === 0 ? 'bg-background' : 'bg-muted/30'}
                          `}
                        >
                          {/* Category Cell (Read Only) */}
                          <td className="sticky left-0 z-10 bg-muted border-r-2 border-border px-6 py-6 font-bold text-foreground">
                            <div className="text-center">
                              <span className="text-lg font-bold">{categoryRow.category}</span>
                            </div>
                          </td>

                          {/* Day Cells (Read Only) */}
                          {categoryRow.cells.map(({ day, items, menu }) =>
                            renderCell(items, mealGroup.mealType, categoryRow.category, day, menu)
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </HelmetWrapper>
  );
};

export default MyMenuPage;
