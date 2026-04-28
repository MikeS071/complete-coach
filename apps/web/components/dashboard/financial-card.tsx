import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  revenuePeriodOptions,
  type RevenueMetric,
  type RevenuePeriod
} from "@/fixtures/dashboard";

interface FinancialCardProps {
  currentPeriod: RevenuePeriod;
  metric: RevenueMetric;
  open: boolean;
  onToggleOpen: () => void;
  onSelectPeriod: (period: RevenuePeriod) => void;
}

export function FinancialCard({
  currentPeriod,
  metric,
  open,
  onToggleOpen,
  onSelectPeriod
}: FinancialCardProps) {
  return (
    <section className="relative rounded-xl border border-gray-200 bg-white p-6" aria-label="Revenue analytics">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-gray-500">{metric.label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-green-600">{metric.change}</span>
          <div className="relative">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              aria-haspopup="menu"
              aria-expanded={open}
              aria-label={`Change revenue period, currently ${currentPeriod}`}
              className="h-7 rounded-md bg-gray-100 px-2 text-xs capitalize hover:bg-gray-200"
              onClick={onToggleOpen}
            >
              {currentPeriod}
              <ChevronDown className="size-3" aria-hidden="true" />
            </Button>

            {open ? (
              <div
                role="menu"
                aria-label="Revenue period"
                className="absolute right-0 top-full z-20 mt-1 min-w-32 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
              >
                {revenuePeriodOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="menuitem"
                    className={cn(
                      "block w-full px-3 py-2 text-left text-xs transition-colors hover:bg-gray-50",
                      currentPeriod === option.value ? "bg-indigo-50 font-medium text-indigo-600" : "text-gray-700"
                    )}
                    onClick={() => onSelectPeriod(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mb-4 text-3xl font-bold">{metric.value}</div>
      <div className="flex h-16 items-end gap-1" aria-hidden="true">
        {metric.bars.map((height, index) => (
          <div
            key={`${metric.label}-${height}-${index}`}
            className={cn(
              "flex-1 rounded-t transition-all",
              index >= metric.bars.length - 2 ? "bg-indigo-600" : "bg-gray-200"
            )}
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </section>
  );
}
