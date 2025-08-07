import { useUserContext } from '@/app/contexts/user_context';
import React, { useState } from 'react';
import ListView from '@/app/widgets/listView';
import { CustomButton } from '@/app/widgets/custom_button';
import CustomDrawer from '@/app/src/custom_drawer';
import MenuForm from '@/dashboard/appearance/menus/menu_form';
import { convertDateTime } from '@/app/helpers/convertDateTime';
import { isNull } from '@/app/helpers/isNull';
import { randomNumber } from '@/app/helpers/randomNumber';

interface MenusProps {
  onAction: (action: Menus[]) => void;
}

export default function MenusPage({ onAction }: MenusProps) {
  const { essentialData } = useUserContext();
  const [menus, setMenus] = useState<Menus[]>(essentialData?.brand?.menus || []);
  const [menu, setMenu] = useState<Menus>({});

  const handleCreateOrUpdateMenu = (newMenu: Menus) => {
    // Check if menu already exists by ID
    const existingMenuIndex = menus.findIndex((m) => m.id === newMenu.id);

    if (existingMenuIndex !== -1) {
      // Update existing menu
      const updatedMenus = [...menus];
      updatedMenus[existingMenuIndex] = newMenu;
      setMenus(updatedMenus);
      onAction(updatedMenus);
    } else {
      // Create new menu
      const newMenus = [...menus, newMenu];
      setMenus(newMenus);
      onAction(newMenus);
    }

    // Close drawer after save
    setMenu({});
  };

  const handleDeleteMenu = (menuId: string) => {
    const filteredMenus = menus.filter((m) => m.id !== menuId);
    setMenus(filteredMenus);
    setMenu({});
    onAction(filteredMenus);
  };

  return (
    <div className="flex flex-col py-5 ">
      <div className="flex flex-row justify-between items-center mb-4 h-7 px-2">
        <div>Navigation Menus</div>
        <div className="w-auto">
          <CustomButton
            onClick={() =>
              setMenu({
                name: '',
                description: '',
                links: [],
                createdAt: convertDateTime() as any,
                id: randomNumber().toString(),
              })
            }
          >
            Create Menu
          </CustomButton>
        </div>
      </div>

      <div className="flex-grow">
        <ListView
          data={menus.map((menu) => ({
            ...menu,
            title: menu.name,
            value: menu.id,
          }))}
          setActiveData={(data) => {
            setMenu(data);
          }}
          display={[]}
        />
      </div>

      <CustomDrawer
        isOpen={!isNull(menu?.id)}
        onClose={() => setMenu({})}
        isHeightFull={true}
        isWidthFull={true}
        header={'Menu'}
      >
        <MenuForm menu={menu} onSave={handleCreateOrUpdateMenu} onDelete={handleDeleteMenu} />
      </CustomDrawer>
    </div>
  );
}
