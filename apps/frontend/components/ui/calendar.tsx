"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        root: cn(defaultClassNames.root, "w-fit"),
        months: cn(defaultClassNames.months, "flex flex-col gap-4"),
        month: cn(defaultClassNames.month, "space-y-3"),
        month_caption: cn(defaultClassNames.month_caption, "flex items-center justify-center px-9 py-1 text-sm font-medium"),
        nav: cn(defaultClassNames.nav, "flex items-center justify-between absolute inset-x-0 top-0 px-1"),
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 text-muted-foreground hover:text-foreground"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 text-muted-foreground hover:text-foreground"
        ),
        weekdays: cn(defaultClassNames.weekdays, "flex"),
        weekday: cn(defaultClassNames.weekday, "w-9 text-[0.8rem] font-normal text-muted-foreground"),
        week: cn(defaultClassNames.week, "mt-1 flex w-full"),
        day: cn(defaultClassNames.day, "h-9 w-9 p-0 text-center text-sm"),
        day_button: cn(
          "mx-auto flex h-9 w-9 items-center justify-center rounded-md text-sm font-normal transition-colors hover:bg-accent hover:text-accent-foreground aria-selected:opacity-100"
        ),
        today: "text-primary font-semibold",
        selected:
          "[&>button]:bg-ink [&>button]:text-ink-foreground [&>button]:hover:bg-ink/90 [&>button]:hover:text-ink-foreground",
        outside: "text-muted-foreground/40",
        disabled: "text-muted-foreground/30 opacity-50",
        hidden: "invisible",
        ...classNames
      }}
      components={{
        Chevron: ({ orientation, ...rest }) =>
          orientation === "left" ? <ChevronLeft className="h-4 w-4" {...rest} /> : <ChevronRight className="h-4 w-4" {...rest} />
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
