import * as React from "react"
import { cn } from "@/lib/utils"
import {
  TooltipProvider,
} from "@/components/ui/tooltip"
import {
  SidebarProvider as BaseSidebarProvider,
  useSidebar,
  type SidebarContextProps,
} from "./sidebar-provider"
import {
  Sidebar,
  SidebarInset,
  SidebarRail,
  SidebarNone,
} from "./sidebar-layout"
import {
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarSeparator,
} from "./sidebar-containers"
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "./sidebar-menu"
import { SidebarInput } from "./sidebar-inputs"
import { SidebarTrigger } from "./sidebar-trigger"

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }
>(
  (
    {
      defaultOpen = true,
      open,
      onOpenChange,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <TooltipProvider delayDuration={0}>
        <BaseSidebarProvider
          defaultOpen={defaultOpen}
          open={open}
          onOpenChange={onOpenChange}
          className={cn(
            "group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar",
            className
          )}
          style={style}
          ref={ref}
          {...props}
        >
          {children}
        </BaseSidebarProvider>
      </TooltipProvider>
    )
  }
)
SidebarProvider.displayName = "SidebarProvider"

export {
  SidebarProvider,
  useSidebar,
  type SidebarContextProps,
  Sidebar,
  SidebarInset,
  SidebarRail,
  SidebarNone,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarSeparator,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarInput,
  SidebarTrigger,
}
