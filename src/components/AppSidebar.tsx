import { BarChart3, Users, Package, LogOut, Database, FileText } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Contratos", url: "/contratos", icon: FileText },
  { title: "Produtos", url: "/produtos", icon: Package },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { signOut, user } = useAuth();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const isExpanded = items.some((i) => isActive(i.url));
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-accent text-accent-foreground font-medium" : "hover:bg-accent/50";

  const handleSignOut = () => {
    signOut();
  };

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarHeader className="border-b relative">
        <div className="flex items-center space-x-3 p-4">
          
          {!collapsed && (
            <div>
              <h2 className="text-lg font-bold">Sistema VLMA</h2>
              <p className="text-xs text-muted-foreground">Gestão de dados</p>
            </div>
          )}
        </div>
        <SidebarTrigger className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 bg-accent border shadow-sm hover:bg-accent" />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <div className="p-4">
          {!collapsed ? (
            <div className="space-y-3">
              <div className="text-sm">
                <p className="font-medium truncate">{user?.email}</p>
                <p className="text-xs text-muted-foreground">Sistema VLMA</p>
              </div>
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                className="w-full justify-start hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </div>
          ) : (
            <div className="flex justify-center">
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                className="p-2 hover:bg-destructive/10 hover:text-destructive"
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}