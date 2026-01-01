"use client";

import * as React from "react";
import {
  Tabs as ChakraTabs,
  TabList,
  TabPanels as ChakraTabPanels,
  Tab,
  TabPanel,
  type TabsProps as ChakraTabsProps,
  type TabProps as ChakraTabProps,
  type TabPanelProps as ChakraTabPanelProps,
  type TabPanelsProps as ChakraTabPanelsProps,
} from "@chakra-ui/react";
import { cn } from "@/lib/utils";

export interface TabsProps extends Omit<ChakraTabsProps, 'onChange'> {
  className?: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

const Tabs = React.forwardRef<React.ElementRef<typeof ChakraTabs>, TabsProps>(
  function Tabs({ className, defaultValue, value, onValueChange, children, ...props }, ref) {
    // Convertir string a índice numérico
    const getIndex = (val?: string) => {
      if (!val) return undefined;
      const num = parseInt(val, 10);
      return isNaN(num) ? undefined : num;
    };

    const defaultIndex = getIndex(defaultValue);
    const index = getIndex(value);

    return (
      <ChakraTabs
        ref={ref}
        className={cn(className)}
        defaultIndex={defaultIndex}
        index={index}
        onChange={(i) => onValueChange?.(i.toString())}
        {...props}
      >
        {children}
      </ChakraTabs>
    );
  }
);
Tabs.displayName = "Tabs";

const TabsList = React.forwardRef<React.ElementRef<typeof TabList>, React.HTMLAttributes<HTMLDivElement>>(
  function TabsList({ className, ...props }, ref) {
    return (
      <TabList
        ref={ref as any}
        className={cn(
          "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
          className
        )}
        {...props}
      />
    );
  }
);
TabsList.displayName = "TabsList";

export interface TabsTriggerProps extends Omit<ChakraTabProps, 'value'> {
  className?: string;
  value?: string; // Hacemos value opcional ya que Chakra usa índices
}

const TabsTrigger = React.forwardRef<React.ElementRef<typeof Tab>, TabsTriggerProps>(
  function TabsTrigger({ className, value, ...props }, ref) {
    return (
      <Tab
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        _selected={{
          bg: "white",
          color: "gray.900",
          shadow: "sm",
        }}
        {...props}
      />
    );
  }
);
TabsTrigger.displayName = "TabsTrigger";

const TabsPanels = React.forwardRef<React.ElementRef<typeof ChakraTabPanels>, ChakraTabPanelsProps>(
  function TabsPanels({ className, ...props }, ref) {
    return (
      <ChakraTabPanels
        ref={ref as any}
        className={cn(className)}
        {...props}
      />
    );
  }
);
TabsPanels.displayName = "TabsPanels";

export interface TabsContentProps extends Omit<ChakraTabPanelProps, 'value'> {
  className?: string;
  value?: string; // Hacemos value opcional ya que Chakra usa índices
}

const TabsContent = React.forwardRef<React.ElementRef<typeof TabPanel>, TabsContentProps>(
  function TabsContent({ className, value, ...props }, ref) {
    return (
      <TabPanel
        ref={ref}
        className={cn(
          "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        {...props}
      />
    );
  }
);
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent, TabsPanels };