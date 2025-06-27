import { Button, Input, toast } from '@/components';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { useCreateMenu, useMenus, useUpdateMenu } from '@/hooks/naivedyam/useMenu.hook';
import { useCreateTag, useTags, useUpdateTag } from '@/hooks/naivedyam/useTags.hook';
import { useVendors } from '@/hooks/naivedyam/useVendors.hook';
import { ChefHat, Clock, Pencil, Plus, User } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

// Color schemes similar to student courses
const getSlotTypeColor = (mealType: string) => {
  switch (mealType.toLowerCase()) {
    case 'breakfast':
      return {
        bg: 'bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-50 dark:from-pink-900/20 dark:via-pink-800/30 dark:to-rose-900/20',
        border: 'border-blue-300 dark:border-pink-500/50',
        text: 'text-blue-900 dark:text-pink-100',
        hover:
          'hover:from-blue-100 hover:via-blue-150 hover:to-indigo-100 dark:hover:from-pink-800/40 dark:hover:via-pink-700/50 dark:hover:to-rose-800/40',
        badge: 'bg-blue-200 text-blue-900 dark:bg-pink-700/50 dark:text-pink-100',
        accent: 'bg-blue-500 dark:bg-pink-500',
        label: 'Breakfast',
      };
    case 'lunch':
      return {
        bg: 'bg-gradient-to-br from-sky-50 via-blue-100 to-cyan-50 dark:from-rose-900/20 dark:via-pink-800/30 dark:to-fuchsia-900/20',
        border: 'border-sky-300 dark:border-rose-500/50',
        text: 'text-sky-900 dark:text-rose-100',
        hover:
          'hover:from-sky-100 hover:via-blue-150 hover:to-cyan-100 dark:hover:from-rose-800/40 dark:hover:via-pink-700/50 dark:hover:to-fuchsia-800/40',
        badge: 'bg-sky-200 text-sky-900 dark:bg-rose-700/50 dark:text-rose-100',
        accent: 'bg-sky-500 dark:bg-rose-500',
        label: 'Lunch',
      };
    case 'dinner':
      return {
        bg: 'bg-gradient-to-br from-indigo-50 via-blue-100 to-blue-50 dark:from-fuchsia-900/20 dark:via-pink-800/30 dark:to-pink-900/20',
        border: 'border-indigo-300 dark:border-fuchsia-500/50',
        text: 'text-indigo-900 dark:text-fuchsia-100',
        hover:
          'hover:from-indigo-100 hover:via-blue-150 hover:to-blue-100 dark:hover:from-fuchsia-800/40 dark:hover:via-pink-700/50 dark:hover:to-pink-800/40',
        badge: 'bg-indigo-200 text-indigo-900 dark:bg-fuchsia-700/50 dark:text-fuchsia-100',
        accent: 'bg-indigo-500 dark:bg-fuchsia-500',
        label: 'Dinner',
      };
    default:
      return {
        bg: 'bg-gradient-to-br from-emerald-50 via-green-100 to-teal-50 dark:from-emerald-900/20 dark:via-green-800/30 dark:to-teal-900/20',
        border: 'border-emerald-300 dark:border-emerald-500/50',
        text: 'text-emerald-900 dark:text-emerald-100',
        hover:
          'hover:from-emerald-100 hover:via-green-150 hover:to-teal-100 dark:hover:from-emerald-800/40 dark:hover:via-green-700/50 dark:hover:to-teal-800/40',
        badge: 'bg-emerald-200 text-emerald-900 dark:bg-emerald-700/50 dark:text-emerald-100',
        accent: 'bg-emerald-500 dark:bg-emerald-500',
        label: 'Snack',
      };
  }
};

function MenuModal({
  open,
  onOpenChange,
  mode,
  initial,
  onSubmit,
  isLoading,
  tagsList = [],
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  initial: {
    vendor_id: string;
    meal_type: string;
    tag_id?: number;
    tag_name: string;
    day_of_week: string;
    food_items: { name: string; tag_id: number }[];
    menu_id?: number;
  };
  onSubmit: (data: {
    meal_type: string;
    day_of_week: string | string[];
    tag_id: number;
    food_items: { name: string; tag_id: number }[];
  }) => void;
  isLoading: boolean;
  tagsList?: { id: number; name: string }[];
}) {
  const [mealType, setMealType] = useState(initial.meal_type || '');
  const [dayOfWeek, setDayOfWeek] = useState<string[]>([]);
  const [tagId, setTagId] = useState<number | undefined>(initial.tag_id);
  const [foodItems, setFoodItems] = useState<string>(
    initial.food_items?.map(f => f.name).join(', ') || ''
  );

  useEffect(() => {
    setMealType(initial.meal_type || '');
    setDayOfWeek(
      Array.isArray(initial.day_of_week)
        ? initial.day_of_week
        : initial.day_of_week
          ? [initial.day_of_week]
          : []
    );
    setTagId(initial.tag_id);
    setFoodItems(initial.food_items?.map(f => f.name).join(', ') || '');
  }, [initial]);

  const isAddNew = mode === 'create' && !initial.menu_id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100">
            {mode === 'create' ? 'Add Menu Item' : 'Edit Menu Item'}
          </DialogTitle>
          <DialogClose asChild>
            <button
              type="button"
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              aria-label="Close"
              onClick={() => onOpenChange(false)}
            >
              ×
            </button>
          </DialogClose>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Vendor</div>
            <div className="font-semibold text-gray-900 dark:text-gray-100">
              {initial.vendor_id}
            </div>
          </div>
          {isAddNew ? (
            <>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Meal Type</div>
                <Input
                  value={mealType}
                  onChange={e => setMealType(e.target.value)}
                  placeholder="e.g. breakfast"
                  disabled={isLoading}
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Days</div>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAYS.map(day => (
                    <label key={day} className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={Array.isArray(dayOfWeek) ? dayOfWeek.includes(day) : false}
                        onChange={e => {
                          if (e.target.checked) {
                            setDayOfWeek([...(Array.isArray(dayOfWeek) ? dayOfWeek : []), day]);
                          } else {
                            setDayOfWeek(
                              (Array.isArray(dayOfWeek) ? dayOfWeek : []).filter(d => d !== day)
                            );
                          }
                        }}
                        className="text-blue-600 dark:text-pink-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Category</div>
                <Select
                  value={tagId ? String(tagId) : ''}
                  onValueChange={val => setTagId(Number(val))}
                >
                  <SelectTrigger className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                    {tagId ? tagsList.find(t => t.id === tagId)?.name : 'Select Category'}
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                    {tagsList.map(tag => (
                      <SelectItem
                        key={tag.id}
                        value={String(tag.id)}
                        className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {tag.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Meal Type</div>
                <div className="font-semibold capitalize text-gray-900 dark:text-gray-100">
                  {initial.meal_type}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Category</div>
                <div className="font-semibold capitalize text-gray-900 dark:text-gray-100">
                  {initial.tag_name}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Day</div>
                <div className="font-semibold capitalize text-gray-900 dark:text-gray-100">
                  {initial.day_of_week}
                </div>
              </div>
            </>
          )}
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Food Item Names (comma separated)
            </div>
            <Input
              value={foodItems}
              onChange={e => setFoodItems(e.target.value)}
              placeholder="e.g. Rice, Dal"
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                const resolvedTagId = isAddNew ? tagId : initial.tag_id;
                const foodArr = foodItems
                  .split(',')
                  .map(f => f.trim())
                  .filter(Boolean)
                  .map(name => ({
                    name,
                    tag_id: resolvedTagId as number,
                  }));
                if (isAddNew) {
                  onSubmit({
                    meal_type: mealType,
                    day_of_week: dayOfWeek,
                    tag_id: resolvedTagId as number,
                    food_items: foodArr,
                  });
                } else {
                  onSubmit({
                    meal_type: initial.meal_type,
                    day_of_week: initial.day_of_week,
                    tag_id: initial.tag_id as number,
                    food_items: foodArr,
                  });
                }
              }}
              disabled={
                isLoading ||
                (isAddNew && (!mealType || !dayOfWeek.length || !tagId || !foodItems.trim()))
              }
              className="bg-blue-600 hover:bg-blue-700 dark:bg-pink-600 dark:hover:bg-pink-700 text-white"
            >
              {mode === 'create' ? 'Create' : 'Update'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TagModal({
  open,
  onOpenChange,
  mode,
  initial,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  initial: { name: string; id?: number };
  onSubmit: (data: { name: string }) => void;
  isLoading: boolean;
}) {
  const [name, setName] = useState(initial.name || '');

  useEffect(() => {
    setName(initial.name || '');
  }, [initial, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100">
            {mode === 'create' ? 'Create Category' : 'Edit Category'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Category name"
            disabled={isLoading}
            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={() => onSubmit({ name })}
              disabled={isLoading || !name.trim()}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-pink-600 dark:hover:bg-pink-700 text-white"
            >
              {mode === 'create' ? 'Create' : 'Update'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const MenuPage = () => {
  const { data: menus = [], refetch } = useMenus();
  const { data: vendors = [] } = useVendors();
  const { data: tags = [], refetch: refetchTags } = useTags();
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

  // Get all meal types and tags present in the menu for the selected vendor
  const mealTypes = useMemo(() => {
    const set = new Set<string>();
    menus
      .filter(m => selectedVendor === 'all' || m.vendor_id === selectedVendor)
      .forEach(m => set.add(m.meal_type));
    return Array.from(set);
  }, [menus, selectedVendor]);

  // Only get tags that have items for at least one day
  const tagsWithItems = useMemo(() => {
    const tagSet = new Set<string>();
    const filteredMenus = menus.filter(
      m => selectedVendor === 'all' || m.vendor_id === selectedVendor
    );

    filteredMenus.forEach(menu => {
      menu.food_items.forEach(item => {
        if (item.tag?.name) {
          tagSet.add(item.tag.name);
        }
      });
    });

    return Array.from(tagSet).filter(tag => {
      return WEEKDAYS.some(day => {
        return filteredMenus.some(
          menu => menu.day_of_week === day && menu.food_items.some(item => item.tag?.name === tag)
        );
      });
    });
  }, [menus, selectedVendor]);

  // Filter menus for selected vendor
  const filteredMenus = useMemo(
    () => menus.filter(m => selectedVendor === 'all' || m.vendor_id === selectedVendor),
    [menus, selectedVendor]
  );

  // Create table data structure with merged meal types
  const tableData = useMemo(() => {
    return mealTypes.map(mealType => ({
      mealType,
      tags: tagsWithItems.map(tag => ({
        tag,
        days: WEEKDAYS.map(day => {
          const menu = filteredMenus.find(m => m.meal_type === mealType && m.day_of_week === day);
          const items = menu ? menu.food_items.filter(item => item.tag?.name === tag) : [];
          return { day, items, menu };
        }),
      })),
    }));
  }, [mealTypes, tagsWithItems, filteredMenus]);

  const selectedVendorName =
    vendors.find(v => v.ldapid === selectedVendor)?.ldapid || selectedVendor;

  // Helper to get tag object by name
  const getTagByName = (name: string) => tags.find(t => t.name === name);

  // Handle cell click
  const handleCellClick = ({
    mealType,
    tag,
    day,
    items,
    menu,
  }: {
    mealType: string;
    tag: string;
    day: string;
    items: any[];
    menu: any;
  }) => {
    if (!selectedVendor || selectedVendor === 'all') {
      toast({ title: 'Please select a vendor to edit or create menu.' });
      return;
    }
    const tagObj = getTagByName(tag);
    setModalInitial({
      vendor_id: selectedVendor,
      meal_type: mealType,
      tag_id: tagObj?.id,
      tag_name: tagObj?.name || tag,
      day_of_week: day,
      food_items: items.map(i => ({ name: i.name, tag_id: tagObj?.id })),
      menu_id: menu?.id,
    });
    setModalMode(items.length === 0 ? 'create' : 'edit');
    setOpenCellKey(`${mealType}-${tag}-${day}`);
  };

  // Handle create or update
  const handleModalSubmit = async (data: any) => {
    if (modalMode === 'create' && openCellKey === 'add-new') {
      // Add New button modal with multiple days
      for (const day of data.day_of_week) {
        await createMenu.mutateAsync({
          vendor_id: modalInitial.vendor_id,
          meal_type: data.meal_type,
          day_of_week: day,
          tag_id: data.tag_id,
          food_items: data.food_items.map((item: { name: string }) => item.name),
        });
      }
      toast({ title: 'Menu created for selected days' });
    } else if (modalMode === 'create') {
      // Cell create modal (single day)
      await createMenu.mutateAsync({
        vendor_id: modalInitial.vendor_id,
        day_of_week: modalInitial.day_of_week,
        meal_type: modalInitial.meal_type,
        food_items: data.food_items.map((item: { name: string }) => item.name),
        tag_id: modalInitial.tag_id,
      });
      toast({ title: 'Menu created' });
    } else if (modalMode === 'edit') {
      await updateMenu.mutateAsync({
        schedule_id: modalInitial.menu_id,
        payload: {
          vendor_id: modalInitial.vendor_id,
          day_of_week: modalInitial.day_of_week,
          meal_type: modalInitial.meal_type,
          food_items: data.food_items.map((item: { name: string }) => item.name),
          tag_id: modalInitial.tag_id,
        },
      });
      toast({ title: 'Menu updated' });
    }
    setOpenCellKey(null);
    refetch();
  };

  // Handle create or update for tags
  const handleCreateTag = async ({ name }: { name: string }) => {
    await createTag.mutateAsync({ name });
    toast({ title: 'Category created' });
    setTagModalOpen(false);
    refetchTags();
  };

  const handleEditTag = async ({ name }: { name: string }) => {
    if (!tagModalInitial.id) return;
    await updateTag.mutateAsync({ id: tagModalInitial.id, payload: { name } });
    toast({ title: 'Category updated' });
    setTagModalOpen(false);
    refetchTags();
  };

  const renderMenuCard = (item: any, mealType: string, isMultiple: boolean) => {
    const colors = getSlotTypeColor(mealType);
    const cardClass = `rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${colors.bg} border-2 ${colors.border} ${colors.hover} ${isMultiple ? 'mb-3 last:mb-0' : ''}`;

    return (
      <div key={item.id} className={cardClass}>
        <div className="flex items-center justify-between mb-3">
          <div className={`font-bold text-lg ${colors.text}`}>{item.name}</div>
          <div className="flex items-center space-x-1">
            <ChefHat className="w-3 h-3 text-gray-600 dark:text-gray-400" />
            <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">
              {colors.label}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderTimeSlotCell = (
    mealType: string,
    tag: string,
    day: string,
    items: any[],
    menu: any
  ) => {
    const hasCourses = items.length > 0;
    const hasMultipleCourses = items.length > 1;
    const cellKey = `${mealType}-${tag}-${day}`;

    if (!hasCourses) {
      return (
        <td
          key={day}
          className="px-3 py-3 border border-gray-300 dark:border-gray-600 align-top bg-gray-50 dark:bg-gray-800/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-300"
          onClick={() =>
            handleCellClick({
              mealType,
              tag,
              day,
              items,
              menu,
            })
          }
        >
          <div className="text-center text-gray-400 dark:text-gray-500 text-sm py-8">
            <Clock className="w-5 h-5 mx-auto mb-2 opacity-50" />
            <div className="font-medium">Add Item</div>
            <div className="text-xs mt-1 opacity-75">Click to add</div>
          </div>
          {openCellKey === cellKey && modalInitial && (
            <MenuModal
              open={true}
              onOpenChange={open => {
                if (!open) setOpenCellKey(null);
              }}
              mode={modalMode}
              initial={modalInitial}
              onSubmit={handleModalSubmit}
              isLoading={createMenu.isPending || updateMenu.isPending}
              tagsList={tags}
            />
          )}
        </td>
      );
    }

    return (
      <td
        key={day}
        className="px-3 py-3 border border-gray-300 dark:border-gray-600 align-top bg-white dark:bg-gray-900 cursor-pointer transition-all duration-300"
        onClick={() =>
          handleCellClick({
            mealType,
            tag,
            day,
            items,
            menu,
          })
        }
      >
        <div className="space-y-0">
          {hasMultipleCourses && (
            <div className="bg-amber-100 dark:bg-amber-900/30 border-2 border-amber-300 dark:border-amber-600/50 rounded-lg px-3 py-2 mb-3">
              <div className="text-xs font-bold text-amber-900 dark:text-amber-100 flex items-center">
                <span className="w-2 h-2 bg-amber-600 dark:bg-amber-400 rounded-full mr-2 animate-pulse"></span>
                {items.length} Items
              </div>
            </div>
          )}
          {items.map(item => renderMenuCard(item, mealType, hasMultipleCourses))}
        </div>
        {openCellKey === cellKey && modalInitial && (
          <MenuModal
            open={true}
            onOpenChange={open => {
              if (!open) setOpenCellKey(null);
            }}
            mode={modalMode}
            initial={modalInitial}
            onSubmit={handleModalSubmit}
            isLoading={createMenu.isPending || updateMenu.isPending}
            tagsList={tags}
          />
        )}
      </td>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            Weekly Menu Planner
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive view of your menu schedule
          </p>
        </div>

        {/* Vendor Selection */}
        <div className="flex justify-start mb-8">
          <div className="flex items-center gap-3">
            <Select value={selectedVendor} onValueChange={setSelectedVendor}>
              <SelectTrigger className="w-full sm:min-w-[200px] lg:min-w-[250px] flex justify-between items-center h-10 sm:h-11 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700">
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="truncate">{selectedVendorName || 'Select Vendor'}</span>
                </span>
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                <SelectItem
                  value="all"
                  className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  All Vendors
                </SelectItem>
                {vendors.map(v => (
                  <SelectItem
                    key={v.ldapid}
                    value={v.ldapid}
                    className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
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
                  tag_id: undefined,
                  tag_name: '',
                  day_of_week: '',
                  food_items: [],
                  menu_id: undefined,
                });
                setModalMode('create');
                setOpenCellKey('add-new');
              }}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-pink-600 dark:hover:bg-pink-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Menu
            </Button>
          </div>
        </div>

        {/* Menu Table */}
        {tableData.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <Clock className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
            <div className="text-gray-500 dark:text-gray-400 text-xl font-semibold">
              No menu data found
            </div>
            <div className="text-gray-400 dark:text-gray-500 text-base mt-3">
              Select a vendor to view menus or add new items.
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {mealTypes.map(mealType => (
              <div key={mealType} className="mb-10">
                <div className="relative flex">
                  {/* Vertical Meal Type Flag */}
                  <div className="relative mr-4">
                    <div className="absolute left-0 top-0 h-full w-16 bg-gradient-to-b from-blue-700 via-blue-800 to-blue-900 dark:from-pink-700 dark:via-pink-800 dark:to-rose-900 rounded-l-xl shadow-lg">
                      <div className="h-full flex items-center justify-center">
                        <div className="transform -rotate-90 whitespace-nowrap">
                          <h2 className="text-2xl font-bold text-white tracking-wider uppercase">
                            {mealType}
                          </h2>
                        </div>
                      </div>
                    </div>
                    <div className="absolute right-0 top-1/2 transform translate-x-full -translate-y-1/2 w-0 h-0 border-l-[20px] border-l-blue-900 dark:border-l-rose-900 border-t-[15px] border-t-transparent border-b-[15px] border-b-transparent"></div>
                  </div>

                  {/* Menu Table */}
                  <div className="flex-1 overflow-x-auto shadow-2xl rounded-r-xl bg-white dark:bg-gray-900 ml-12">
                    <table className="min-w-full relative">
                      <thead>
                        <tr className="bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 dark:from-pink-700 dark:via-pink-800 dark:to-rose-900 text-white">
                          <th className="sticky left-0 z-10 px-6 py-5 text-left font-bold border border-blue-600 dark:border-pink-600 bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 dark:from-pink-700 dark:via-pink-800 dark:to-rose-900">
                            <div className="flex items-center space-x-3">
                              <span className="flex items-center gap-2">
                                <span className="text-xl">🏷️</span>
                                Category
                              </span>
                              <button
                                type="button"
                                className="ml-3 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all duration-300 hover:scale-110 transform"
                                onClick={e => {
                                  e.stopPropagation();
                                  setTagModalMode('create');
                                  setTagModalInitial({ name: '' });
                                  setTagModalOpen(true);
                                }}
                                title="Add Category"
                              >
                                <Plus size={16} className="text-white" />
                              </button>
                            </div>
                          </th>
                          {WEEKDAYS.map(day => (
                            <th
                              key={day}
                              className="px-4 py-5 text-center font-bold border border-blue-600 dark:border-pink-600 min-w-[220px]"
                            >
                              <div className="text-sm leading-tight capitalize">{day}</div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tableData
                          .find(data => data.mealType === mealType)
                          ?.tags.filter(tagData =>
                            tagData.days.some(dayObj => dayObj.items && dayObj.items.length > 0)
                          )
                          .map((tagData, tagIndex) => (
                            <tr
                              key={`${mealType}-${tagData.tag}`}
                              className={
                                tagIndex % 2 === 0
                                  ? 'bg-gray-50 dark:bg-gray-800/50'
                                  : 'bg-white dark:bg-gray-900'
                              }
                            >
                              <td
                                className="sticky left-0 z-10 px-6 py-6 font-bold text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 bg-gradient-to-r from-gray-100 via-gray-50 to-white dark:from-gray-700 dark:via-gray-800 dark:to-gray-900 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
                                onClick={e => {
                                  e.stopPropagation();
                                  const tagObj = tags.find(t => t.name === tagData.tag);
                                  setTagModalMode('edit');
                                  setTagModalInitial({ name: tagData.tag, id: tagObj?.id });
                                  setTagModalOpen(true);
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-lg font-bold">{tagData.tag}</span>
                                  <Pencil
                                    size={14}
                                    className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                  />
                                </div>
                              </td>
                              {tagData.days.map(({ day, items, menu }) =>
                                renderTimeSlotCell(mealType, tagData.tag, day, items, menu)
                              )}
                            </tr>
                          )) || []}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <TagModal
        open={tagModalOpen}
        onOpenChange={setTagModalOpen}
        mode={tagModalMode}
        initial={tagModalInitial}
        onSubmit={tagModalMode === 'create' ? handleCreateTag : handleEditTag}
        isLoading={createTag.isPending || updateTag.isPending}
      />
      {openCellKey === 'add-new' && modalInitial && (
        <MenuModal
          open={true}
          onOpenChange={open => {
            if (!open) setOpenCellKey(null);
          }}
          mode="create"
          initial={modalInitial}
          onSubmit={handleModalSubmit}
          isLoading={createMenu.isPending}
          tagsList={tags}
        />
      )}
    </div>
  );
};

export default MenuPage;
