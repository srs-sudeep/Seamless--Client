import AppLogo from '@/components/AppLogo';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { useSidebar } from '@/core/context/sidebarContext';
import { useSidebarItems, useIsMobile } from '@/hooks';
import { cn } from '@/lib/utils';
import { iconMap, type SidebarModuleItem, type SidebarSubModuleTreeItem } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { JSX, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const getIconComponent = (iconName: keyof typeof iconMap, size: number) => {
  const IconComponent = iconMap[iconName];
  return IconComponent ? <IconComponent size={size} /> : null;
};

function findModuleIdByPath(modules: SidebarModuleItem[], pathname: string): string | null {
  for (const module of modules) {
    if (module.subModules && findSubModuleByPath(module.subModules, pathname)) {
      return module.id;
    }
  }
  return modules[0]?.id ?? null;
}

function findSubModuleByPath(subModules: SidebarSubModuleTreeItem[], pathname: string): boolean {
  for (const subModule of subModules) {
    if (subModule.path && pathname.startsWith(subModule.path)) return true;
    if (subModule.children && findSubModuleByPath(subModule.children, pathname)) return true;
  }
  return false;
}

const ModuleSidebar = () => {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isMobile = useIsMobile();
  const { isOpen, closeSidebar } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch sidebar modules from API
  const { sidebarItems: modules = [], isLoading } = useSidebarItems();

  // Set active module based on current path
  useEffect(() => {
    if (!isLoading && modules.length > 0) {
      setActiveModule(findModuleIdByPath(modules, location.pathname));
    }
  }, [isLoading, modules, location.pathname]);

  // Auto-expand parent items based on current path (batch state update)
  useEffect(() => {
    if (!isLoading && modules.length > 0 && activeModule) {
      const expanded: string[] = [];
      const expandParents = (items: SidebarSubModuleTreeItem[]) => {
        for (const item of items) {
          if (item.path && location.pathname.startsWith(item.path)) {
            if (item.children && item.children.length > 0) {
              expanded.push(item.id);
              expandParents(item.children);
            }
          } else if (item.children) {
            expandParents(item.children);
          }
        }
      };
      const module = modules.find(m => m.id === activeModule);
      if (module) {
        expandParents(module.subModules);
        setExpandedItems(expanded);
      }
    }
  }, [isLoading, modules, activeModule, location.pathname]);

  const isActivePath = (path?: string) => path && location.pathname === path;
  const isActiveOrParent = (path?: string) => path && location.pathname.startsWith(path);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const getFilteredBySearchSubModules = (): SidebarSubModuleTreeItem[] => {
    if (searchQuery.trim() === '' || !activeModule) {
      const module = modules.find(m => m.id === activeModule);
      return module ? module.subModules : [];
    }

    const searchInSubModules = (items: SidebarSubModuleTreeItem[]): SidebarSubModuleTreeItem[] => {
      const result: SidebarSubModuleTreeItem[] = [];
      for (const item of items) {
        const matchesSearch =
          item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.path?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

        const childMatches = item.children ? searchInSubModules(item.children) : [];

        if (matchesSearch || childMatches.length > 0) {
          result.push({
            ...item,
            children: childMatches.length > 0 ? childMatches : item.children,
          });
        }
      }
      return result;
    };

    const module = modules.find(m => m.id === activeModule);
    return module ? searchInSubModules(module.subModules) : [];
  };

  const renderSubModuleItem = (subModule: SidebarSubModuleTreeItem, level = 0): JSX.Element => {
    const hasChildren = subModule.children && subModule.children.length > 0;
    const isExpanded = expandedItems.includes(subModule.id);
    const isActive = isActivePath(subModule.path);
    const isParentActive = isActiveOrParent(subModule.path);

    return (
      <div key={subModule.id} className="mb-1">
        <div
          className={cn(
            'flex items-center px-3 py-2 rounded-md text-base transition-colors',
            'hover:bg-sidebar-accent/10 cursor-pointer',
            isActive
              ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
              : 'text-sidebar-foreground/80',
            isParentActive && !isActive && 'text-sidebar-accent-foreground',
            level > 0 && 'ml-4 text-base'
          )}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(subModule.id);
            } else if (subModule.path) {
              navigate(subModule.path);
            }
          }}
        >
          {subModule.icon && (
            <div
              className={cn(
                isActive ? 'mr-2 text-sidebar-accent-foreground' : 'mr-2 text-sidebar-foreground'
              )}
            >
              {getIconComponent(subModule.icon as keyof typeof iconMap, 16)}
            </div>
          )}
          <span
            className="flex-1 whitespace-normal break-words" // <-- wrap and break long text
          >
            {subModule.label}
          </span>
          {hasChildren && (
            <ChevronRight
              className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-90')}
            />
          )}
        </div>
        {hasChildren && isExpanded && (
          <div className="mt-1 pl-4 border-l border-sidebar-border/50 ml-4">
            {subModule.children?.map(child => renderSubModuleItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderModuleIcon = (module: SidebarModuleItem): JSX.Element => {
    const isActive = activeModule === module.id;
    const isModuleActive =
      activeModule === module.id ||
      (module.subModules && findSubModuleByPath(module.subModules, location.pathname));

    return (
      <div
        key={module.id}
        className={cn(
          'flex items-center justify-center w-12 h-12 mb-2 rounded-md cursor-pointer transition-all',
          isActive
            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
            : 'hover:bg-sidebar-accent/10 text-sidebar-foreground/70',
          isModuleActive && !isActive && 'text-sidebar-foreground'
        )}
        onClick={() => setActiveModule(module.id)}
      >
        {getIconComponent(module.icon as keyof typeof iconMap, 20)}
      </div>
    );
  };

  const sideBarcontent = (
    <div className="h-full flex">
      <div className="w-16 h-full flex flex-col items-center py-4 border-r border-sidebar-border bg-[#0b14374d]/5 dark:bg-white/8 z-40">
        <div className="mb-6">
          <AppLogo short className="w-10 h-10 text-sidebar-foreground" />
        </div>
        <div className="flex-1 flex flex-col items-center">{modules.map(renderModuleIcon)}</div>
        <button
          className={
            'mt-4 mb-2 p-1 rounded-full bg-sidebar-accent/10 hover:bg-sidebar-accent transition-colors'
          }
          onClick={() => setIsSidebarOpen(v => !v)}
        >
          {isSidebarOpen ? (
            <ChevronLeft className="h-5 w-5 text-sidebar-foreground hover:text-sidebar-accent-foreground" />
          ) : (
            <ChevronRight className="h-5 w-5 text-sidebar-foreground hover:text-sidebar-accent-foreground" />
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={isSidebarOpen ? 'open' : 'closed'}
          initial={{ width: 0, opacity: 0, x: -20 }}
          animate={{
            width: isSidebarOpen ? 256 : 0, // 256px = w-64
            opacity: isSidebarOpen ? 1 : 0,
            x: isSidebarOpen ? 0 : -20,
            transition: { type: 'tween', duration: 0.25 },
          }}
          exit={{ width: 0, opacity: 0, x: -20, transition: { type: 'tween', duration: 0.2 } }}
          style={{ overflow: 'hidden' }}
          className={cn(
            'h-full flex flex-col',
            'bg-[#0b14374d]/5 dark:bg-white/8 backdrop-blur-sm overflow-hidden',
            'shadow-[8px_0_15px_-3px_rgba(0,0,0,0.1)] z-30 rounded-r-xl'
          )}
        >
          <AppLogo name className="m-2 pt-3" />
          {/* Header with module name */}
          <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
            <h2 className="text-xl font-semibold text-sidebar-foreground">
              {modules.find(m => m.id === activeModule)?.label || 'Dashboard'}
            </h2>
          </div>

          {/* Search box */}
          <div className="px-3 py-2 border-b border-sidebar-border">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-sidebar-foreground/70" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-8 pr-3 py-2 text-sm bg-sidebar-accent/10 border-0 rounded-md focus:outline-none focus:ring-1 focus:ring-sidebar-accent text-sidebar-foreground"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Submodules list */}
          <ScrollArea className="flex-1">
            {isLoading ? (
              <div className="flex justify-center items-center h-20">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sidebar-accent"></div>
              </div>
            ) : (
              <div className="py-3 px-2">
                {activeModule &&
                  getFilteredBySearchSubModules().map(subModule => renderSubModuleItem(subModule))}

                {/* Show search results from other modules when searching */}
                {searchQuery.trim() !== '' && (
                  <>
                    {modules
                      .filter(m => m.id !== activeModule)
                      .flatMap(module => {
                        const filteredSubModules = module.subModules.filter(
                          sm =>
                            sm.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (sm.path?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
                        );
                        return filteredSubModules.length > 0 ? (
                          <div
                            key={module.id}
                            className="mt-4 pt-4 border-t border-sidebar-border/50"
                          >
                            <h3 className="px-3 mb-2 text-xs uppercase text-sidebar-foreground/60">
                              {module.label}
                            </h3>
                            {filteredSubModules.map(subModule => renderSubModuleItem(subModule))}
                          </div>
                        ) : null;
                      })}
                  </>
                )}
              </div>
            )}
          </ScrollArea>
        </motion.div>
      </AnimatePresence>
    </div>
  );

  return (
    <>
      {isMobile ? (
        <Sheet open={isOpen} onOpenChange={closeSidebar}>
          <SheetTitle style={{ display: 'none' }} />
          <SheetContent
            side="left"
            className="p-0 w-[280px] bg-sidebar border-r border-sidebar-border"
          >
            {sideBarcontent}
          </SheetContent>
        </Sheet>
      ) : (
        sideBarcontent
      )}
    </>
  );
};

export default ModuleSidebar;
