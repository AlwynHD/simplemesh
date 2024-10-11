import {
  Tag,
  Users,
  Settings,
  Bookmark,
  SquarePen,
  LayoutGrid,
  LucideIcon
} from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active?: boolean;
};

type Menu = {
  href: string;
  label: string;
  active?: boolean;
  icon: LucideIcon;
  submenus?: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/dashboard",
          label: "Dashboard",
          icon: LayoutGrid,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "Features",
      menus: [
        {
          href: "",
          label: "Models",
          icon: SquarePen,
          submenus: [
            {
              href: "/posts",
              label: "ImageTo3D"
            },
            {
              href: "/posts/new",
              label: "TextTo3D"
            },
            {
              href: "/posts/new",
              label: "Texture Generation"
            }
          ]
        },
        {
          href: "/Community",
          label: "My Creations",
          icon: Bookmark
        },
        {
          href: "/tags",
          label: "Resources",
          icon: Tag
        }
      ]
    },
    {
      groupLabel: "Settings",
      menus: [
        {
          href: "/users",
          label: "Community Creations",
          icon: Users
        },
        {
          href: "/account",
          label: "Settings",
          icon: Settings
        }
      ]
    }
  ];
}
