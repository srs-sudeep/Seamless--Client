import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DynamicForm,
  HelmetWrapper,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  toast,
} from '@/components';
import {
  useCreateMenu,
  useCreateTag,
  useMenus,
  useTags,
  useUpdateMenu,
  useUpdateTag,
  useVendors,
} from '@/hooks';
import { FieldType } from '@/types';
import { ChefHat, Edit2, Loader2, Plus, User } from 'lucide-react';
import { useMemo, useState } from 'react';

const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

// Schema for menu form
const getMenuSchema = (tags: any[], isNewMenu: boolean): FieldType[] => [
  {
    name: 'meal_type',
    label: 'Meal Type',
    type: 'select',
    required: true,
    options: [
      { value: 'breakfast', label: 'Breakfast' },
      { value: 'lunch', label: 'Lunch' },
      { value: 'dinner', label: 'Dinner' },
      { value: 'snacks', label: 'Snacks' },
    ],
    disabled: !isNewMenu,
    columns: 2,
  },
  {
    name: 'day_of_week',
    label: 'Day(s)',
    type: 'select',
    multiSelect: isNewMenu, // Use multiSelect property instead of 'multi' type
    required: true,
    options: isNewMenu
      ? WEEKDAYS.map(day => ({ value: day, label: day.charAt(0).toUpperCase() + day.slice(1) }))
      : undefined,
    disabled: !isNewMenu,
    columns: 2,
  },
  {
    name: 'tag_id',
    label: 'Category',
    type: 'select',
    required: true,
    options: tags.map(tag => ({ value: String(tag.id), label: tag.name })),
    disabled: !isNewMenu,
    columns: 2,
  },
  {
    name: 'food_items_text',
    label: 'Food Items',
    type: 'textarea',
    required: true,
    placeholder: 'e.g. Rice, Dal, Sabzi (comma separated)',
    columns: 2,
  },
];

// Schema for tag form
const tagSchema: FieldType[] = [
  {
    name: 'name',
    label: 'Category Name',
    type: 'text',
    required: true,
    columns: 2,
  },
];

const MenuPage = () => {
  const { data: menus = [], refetch, isFetching: menusLoading } = useMenus();
  const { data: vendors = [], isFetching: vendorsLoading } = useVendors();
  const { data: tags = [], refetch: refetchTags, isFetching: tagsLoading } = useTags();
  const [selectedVendor, setSelectedVendor] = useState<string>('all');

  // Modal state
  const [openCellKey, setOpenCellKey] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [modalInitial, setModalInitial] = useState<any>(null);

  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [tagModalMode, setTagModalMode] = useState<'create' | 'edit'>('create');
  const [tagModalInitial, setTagModalInitial] = useState<{ name: string; id?: number }>({
    name: '',
  });

  const createMenu = useCreateMenu();
  const updateMenu = useUpdateMenu();
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();

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

  // Helper to get tag object by name
  const getTagByName = (name: string) => tags.find(t => t.name === name);

  // Handle cell click
  const handleCellClick = ({
    mealType,
    category,
    day,
    items,
    menu,
  }: {
    mealType: string;
    category: string;
    day: string;
    items: any[];
    menu: any;
  }) => {
    if (!selectedVendor || selectedVendor === 'all') {
      toast({ title: 'Please select a vendor to edit or create menu.' });
      return;
    }
    const tagObj = getTagByName(category);

    // Ensure tag_id is properly set and converted to string for form compatibility
    setModalInitial({
      vendor_id: selectedVendor,
      meal_type: mealType,
      tag_id: tagObj?.id ? String(tagObj.id) : undefined, // Convert to string
      day_of_week: day,
      food_items_text: items.map(i => i.name).join(', '),
      menu_id: menu?.id,
    });
    setModalMode(items.length === 0 ? 'create' : 'edit');
    setOpenCellKey(`${mealType}-${category}-${day}`);
  };

  // Handle modal submit for menu
  const handleMenuSubmit = async (formData: Record<string, any>) => {
    try {
      // Parse food items from text
      const foodItems = formData.food_items_text
        .split(',')
        .map((name: string) => name.trim())
        .filter((name: string) => name !== '');

      // Convert tag_id back to number for API calls
      const tagId = formData.tag_id ? Number(formData.tag_id) : modalInitial.tag_id;

      if (modalMode === 'create' && openCellKey === 'add-new') {
        // Handle bulk creation for multiple days
        const selectedDays = Array.isArray(formData.day_of_week)
          ? formData.day_of_week
          : [formData.day_of_week];

        for (const day of selectedDays) {
          await createMenu.mutateAsync({
            vendor_id: modalInitial.vendor_id,
            meal_type: formData.meal_type,
            day_of_week: day,
            tag_id: tagId,
            food_items: foodItems,
          });
        }
        toast({ title: 'Menu created for selected days' });
      } else if (modalMode === 'create') {
        await createMenu.mutateAsync({
          vendor_id: modalInitial.vendor_id,
          day_of_week: modalInitial.day_of_week,
          meal_type: modalInitial.meal_type,
          food_items: foodItems,
          tag_id: tagId,
        });
        toast({ title: 'Menu created' });
      } else if (modalMode === 'edit') {
        await updateMenu.mutateAsync({
          schedule_id: modalInitial.menu_id,
          payload: {
            vendor_id: modalInitial.vendor_id,
            day_of_week: modalInitial.day_of_week,
            meal_type: modalInitial.meal_type,
            food_items: foodItems,
            tag_id: tagId,
          },
        });
        toast({ title: 'Menu updated' });
      }

      setOpenCellKey(null);
      setModalInitial(null);
      refetch();
    } catch (error) {
      console.error('Error submitting modal:', error);
    }
  };

  // Tag handlers
  const handleCreateTag = async (formData: Record<string, any>) => {
    await createTag.mutateAsync({ name: formData.name });
    toast({ title: 'Category created' });
    setTagModalOpen(false);
    refetchTags();
  };

  const handleEditTag = async (formData: Record<string, any>) => {
    if (!tagModalInitial.id) return;
    await updateTag.mutateAsync({ id: tagModalInitial.id, payload: { name: formData.name } });
    toast({ title: 'Category updated' });
    setTagModalOpen(false);
    refetchTags();
  };

  // Render cell content
  const renderCell = (items: any[], mealType: string, category: string, day: string, menu: any) => {
    const isEmpty = items.length === 0;

    return (
      <td
        key={`${mealType}-${category}-${day}`}
        className={`
          relative border border-border p-3 min-w-[120px] min-h-[70px]
          cursor-pointer transition-all duration-300 ease-in-out
          ${
            isEmpty
              ? 'bg-gradient-to-br from-muted/30 to-muted/10 hover:bg-primary/10'
              : 'bg-gradient-to-br from-background to-muted/30 hover:from-accent/20 hover:to-accent/10 hover:border-primary/20'
          }
          hover:shadow-lg rounded-lg
        `}
        onClick={() => handleCellClick({ mealType, category, day, items, menu })}
      >
        {isEmpty ? (
          <div className="flex items-center justify-center h-full min-h-[70px] text-muted-foreground hover:text-primary transition-colors duration-200">
            <Plus className="w-5 h-5" />
          </div>
        ) : (
          <div className="text-xs space-y-2 overflow-auto py-2">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="bg-accent dark:bg-foreground/85 border-2 border-primary text-primary px-3 py-2 rounded-lg text-xs font-medium break-words transition-all duration-200 shadow-sm"
              >
                {item.name}
              </div>
            ))}
          </div>
        )}
      </td>
    );
  };

  // Get meal type color using dashboard card style gradients
  const getMealTypeColor = (mealType: string) => {
    switch (mealType.toLowerCase()) {
      case 'breakfast':
        return 'bg-card-orange-gradient border-2 border-card-orange text-card-orange';
      case 'lunch':
        return 'bg-card-green-gradient border-2 border-card-green text-card-green';
      case 'dinner':
        return 'bg-card-blue-gradient border-2 border-card-blue text-card-blue';
      case 'snacks':
        return 'bg-card-purple-gradient border-2 border-card-purple text-card-purple';
      default:
        return 'bg-gradient-to-br from-primary/10 to-primary/20 border-2 border-primary/30';
    }
  };

  // Get meal type text color
  const getMealTypeTextColor = (mealType: string) => {
    switch (mealType.toLowerCase()) {
      case 'breakfast':
        return 'text-card-orange';
      case 'lunch':
        return 'text-card-green';
      case 'dinner':
        return 'text-card-blue';
      case 'snacks':
        return 'text-card-purple';
      default:
        return 'text-primary';
    }
  };

  // Get meal type icon background
  const getMealTypeIconBg = (mealType: string) => {
    switch (mealType.toLowerCase()) {
      case 'breakfast':
        return 'bg-card-orange';
      case 'lunch':
        return 'bg-card-green';
      case 'dinner':
        return 'bg-card-blue';
      case 'snacks':
        return 'bg-card-purple';
      default:
        return 'bg-primary';
    }
  };

  if (menusLoading || vendorsLoading || tagsLoading) {
    return (
      <HelmetWrapper
        title="Menu Management"
        heading="Menu Management"
        subHeading="Excel-style menu planning interface with comprehensive meal organization"
      >
        <div className="flex justify-center items-center h-40">
          <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
        </div>
      </HelmetWrapper>
    );
  }

  return (
    <HelmetWrapper
      title="Menu Management"
      heading="Menu Management"
      subHeading="Excel-style menu planning interface with comprehensive meal organization"
    >
      <div className="space-y-12">
        {/* Header Controls */}
        <div className="flex justify-start mb-8">
          <div className="flex items-center gap-3">
            <Select value={selectedVendor} onValueChange={setSelectedVendor}>
              <SelectTrigger className="w-full sm:min-w-[200px] lg:min-w-[220px] flex justify-between items-center h-10 sm:h-11 text-sm bg-card border-border text-card-foreground hover:bg-accent hover:text-accent-foreground">
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="truncate">{selectedVendorName || 'Select Vendor'}</span>
                </span>
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all" className="text-card-foreground hover:bg-accent">
                  All Vendors
                </SelectItem>
                {vendors.map(v => (
                  <SelectItem
                    key={v.ldapid}
                    value={v.ldapid}
                    className="text-card-foreground hover:bg-accent"
                  >
                    {v.ldapid}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={() => {
                if (!selectedVendor || selectedVendor === 'all') {
                  toast({ title: 'Please select a vendor to add a menu item.' });
                  return;
                }
                setModalInitial({
                  vendor_id: selectedVendor,
                  meal_type: '',
                  tag_id: '',
                  day_of_week: [],
                  food_items_text: '',
                  menu_id: undefined,
                });
                setModalMode('create');
                setOpenCellKey('add-new');
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Menu
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setTagModalMode('create');
                setTagModalInitial({ name: '' });
                setTagModalOpen(true);
              }}
              className="bg-card-green text-background border-2 border-card-green h-10 sm:h-11"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </div>
        </div>

        {/* Menu Tables by Meal Type */}
        {tableData.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-background to-muted/30 rounded-2xl shadow-lg border-2 border-border">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ChefHat className="w-10 h-10 text-primary" />
            </div>
            <div className="text-card-foreground text-xl font-semibold">No menu data available</div>
            <div className="text-muted-foreground text-base mt-3">
              Select a vendor and start creating menus
            </div>
          </div>
        ) : (
          tableData.map(mealGroup => (
            <div key={mealGroup.mealType} className="mb-10">
              <div className="relative flex">
                {/* Vertical Meal Type Flag */}
                <div className="relative mr-4">
                  <div
                    className={`absolute left-0 top-0 h-full w-20 ${getMealTypeColor(mealGroup.mealType)} rounded-l-2xl shadow-xl`}
                  >
                    <div className="h-full flex items-center justify-center">
                      <div className="transform -rotate-90 whitespace-nowrap">
                        <h2
                          className={`text-2xl font-bold ${getMealTypeTextColor(mealGroup.mealType)} tracking-wider uppercase`}
                        >
                          {mealGroup.mealType}
                        </h2>
                      </div>
                    </div>
                  </div>
                  {/* Enhanced Flag triangle with gradient */}
                  <div
                    className={`absolute right-0 top-1/2 transform translate-x-full -translate-y-1/2 w-0 h-0 ${getMealTypeColor(mealGroup.mealType).includes('orange') ? 'border-l-orange-200 dark:border-l-orange-800' : getMealTypeColor(mealGroup.mealType).includes('green') ? 'border-l-green-200 dark:border-l-green-800' : getMealTypeColor(mealGroup.mealType).includes('blue') ? 'border-l-blue-200 dark:border-l-blue-800' : 'border-l-purple-200 dark:border-l-purple-800'} border-l-[25px] border-t-[20px] border-t-transparent border-b-[20px] border-b-transparent`}
                  ></div>
                </div>

                {/* Menu Table */}
                <div className="flex-1 overflow-x-auto shadow-2xl rounded-r-2xl bg-gradient-to-br from-background to-muted/30 border-2 border-border ml-16">
                  <table className="min-w-full relative">
                    <thead>
                      <tr className="bg-gradient-to-r from-primary/10 to-primary/5 border-b-2 border-border">
                        <th className="sticky left-0 z-10 px-6 py-5 text-left font-bold border-r-2 border-border bg-gradient-to-r from-primary/10 to-primary/5">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-10 h-10 ${getMealTypeIconBg(mealGroup.mealType)} rounded-xl flex items-center justify-center`}
                            >
                              <ChefHat className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-bold text-foreground">Category</span>
                          </div>
                        </th>
                        {WEEKDAYS.map(day => (
                          <th
                            key={day}
                            className="px-4 py-5 text-center font-bold border border-border min-w-[180px] capitalize text-foreground"
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
                            ${
                              categoryIndex % 2 === 0
                                ? 'bg-gradient-to-r from-background to-muted/20'
                                : 'bg-gradient-to-r from-muted/20 to-background'
                            }
                          `}
                        >
                          {/* Category Cell */}
                          <td
                            className="sticky left-0 z-10 bg-gradient-to-br from-secondary/80 to-secondary border-r-2 border-border px-6 py-6 font-bold text-secondary-foreground cursor-pointer hover:from-accent hover:to-accent/80 hover:text-accent-foreground transition-all duration-200 group rounded-l-lg"
                            onClick={() => {
                              const tagObj = tags.find(t => t.name === categoryRow.category);
                              setTagModalMode('edit');
                              setTagModalInitial({ name: categoryRow.category, id: tagObj?.id });
                              setTagModalOpen(true);
                            }}
                          >
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-2">
                                <span className="text-lg font-bold">{categoryRow.category}</span>
                                <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                              </div>
                            </div>
                          </td>

                          {/* Day Cells */}
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

      {/* Tag Modal */}
      <Dialog open={tagModalOpen} onOpenChange={setTagModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {tagModalMode === 'create' ? 'Create Category' : 'Edit Category'}
            </DialogTitle>
          </DialogHeader>
          <DynamicForm
            schema={tagSchema}
            onSubmit={tagModalMode === 'create' ? handleCreateTag : handleEditTag}
            defaultValues={tagModalInitial}
            onCancel={() => setTagModalOpen(false)}
            submitButtonText={tagModalMode === 'create' ? 'Create' : 'Update'}
          />
        </DialogContent>
      </Dialog>

      {/* Menu Modal */}
      <Dialog open={openCellKey !== null} onOpenChange={open => !open && setOpenCellKey(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {modalMode === 'create' ? 'Add Menu Items' : 'Edit Menu Items'}
            </DialogTitle>
          </DialogHeader>
          {modalInitial && (
            <DynamicForm
              schema={getMenuSchema(tags, openCellKey === 'add-new')}
              onSubmit={handleMenuSubmit}
              defaultValues={modalInitial}
              onCancel={() => setOpenCellKey(null)}
              submitButtonText={modalMode === 'create' ? 'Create' : 'Update'}
            />
          )}
        </DialogContent>
      </Dialog>
    </HelmetWrapper>
  );
};

export default MenuPage;
