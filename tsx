<ProgressPrimitive.Root className={cn("...", className)} {...props}>
  <ProgressPrimitive.Indicator className="h-full w-full flex-1 bg-primary transition-all" style={{ transform: `translateX(-${100 - (value || 0)}%)` }} />
</ProgressPrimitive.Root>
