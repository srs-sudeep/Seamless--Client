import {
  Button,
  toast,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  HelmetWrapper,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  DynamicForm,
} from '@/components';
import { useCreateMenu, useMenus, useUpdateMenu } from '@/hooks/naivedyam/useMenu.hook';
import { useCreateTag, useTags, useUpdateTag } from '@/hooks/naivedyam/useTags.hook';
import { useVendors } from '@/hooks/naivedyam/useVendors.hook';
import { ChefHat, Plus, User, Edit2, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { FieldType } from '@/types';

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
          relative border border-border p-2 min-w-[120px] min-h-[60px]
          cursor-pointer transition-all duration-200
          ${isEmpty ? 'bg-muted hover:bg-accent/50' : 'bg-background hover:bg-muted'}
        `}
        onClick={() => handleCellClick({ mealType, category, day, items, menu })}
      >
        {isEmpty ? (
          <div className="flex items-center justify-center h-full min-h-[60px] text-muted-foreground">
            <Plus className="w-4 h-4" />
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

            <Button
              onClick={() => {
                if (!selectedVendor || selectedVendor === 'all') {
                  toast({ title: 'Please select a vendor to add a menu item.' });
                  return;
                }
                setModalInitial({
                  vendor_id: selectedVendor,
                  meal_type: '',
                  tag_id: '', // Set empty string instead of undefined
                  day_of_week: [],
                  food_items_text: '',
                  menu_id: undefined,
                });
                setModalMode('create');
                setOpenCellKey('add-new');
              }}
              className="bg-primary hover:bg-primary/90 text-background h-10 sm:h-11"
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
              className="h-10 sm:h-11 border-muted text-foreground hover:bg-muted"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </div>
        </div>

        {/* Menu Tables by Meal Type */}
        {tableData.length === 0 ? (
          <div className="text-center py-16 bg-background rounded-xl shadow-lg">
            <ChefHat className="w-20 h-20 text-muted-foreground mx-auto mb-6" />
            <div className="text-muted-foreground text-xl font-semibold">
              No menu data available
            </div>
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
                          {/* Category Cell */}
                          <td
                            className="sticky left-0 z-10 bg-muted border-r-2 border-border px-6 py-6 font-bold text-foreground cursor-pointer hover:bg-accent transition-colors"
                            onClick={() => {
                              const tagObj = tags.find(t => t.name === categoryRow.category);
                              setTagModalMode('edit');
                              setTagModalInitial({ name: categoryRow.category, id: tagObj?.id });
                              setTagModalOpen(true);
                            }}
                          >
                            <div className="text-center">
                              <div className="flex items-center justify-between">
                                <span className="text-lg font-bold">{categoryRow.category}</span>
                                <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
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
