
import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useState } from "react";

const SDG_OPTIONS = [
  { value: 1, label: "No Poverty" },
  { value: 2, label: "Zero Hunger" },
  { value: 3, label: "Good Health" },
  { value: 4, label: "Quality Education" },
  { value: 5, label: "Gender Equality" },
  { value: 6, label: "Clean Water" },
  { value: 7, label: "Clean Energy" },
  { value: 8, label: "Decent Work" },
  { value: 9, label: "Industry & Innovation" },
  { value: 10, label: "Reduced Inequalities" },
  { value: 11, label: "Sustainable Cities" },
  { value: 12, label: "Responsible Consumption" },
  { value: 13, label: "Climate Action" },
  { value: 14, label: "Life Below Water" },
  { value: 15, label: "Life on Land" },
  { value: 16, label: "Peace & Justice" },
  { value: 17, label: "Partnerships" },
];

function SdgMultiSelect({ value, onChange }: { value: number[]; onChange: (v: number[]) => void }) {
  const [open, setOpen] = useState(false);

  const toggle = (sdg: number) => {
    onChange(
      value.includes(sdg) ? value.filter((v) => v !== sdg) : [...value, sdg]
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {value.map((sdg) => {
          const opt = SDG_OPTIONS.find((o) => o.value === sdg);
          return (
            <Badge
              key={sdg}
              variant="secondary"
              className="gap-1 pr-1 text-xs font-bold cursor-pointer hover:bg-destructive/20"
              onClick={() => toggle(sdg)}
            >
              SDG {sdg} {opt?.label}
              <X size={12} />
            </Badge>
          );
        })}
      </div>
      {open && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 p-2">
          {SDG_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={`text-left text-xs font-medium rounded-lg px-2 py-1.5 transition-colors ${
                value.includes(opt.value)
                  ? "bg-primary text-white"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <span className="font-black mr-1">{opt.value}.</span>
              {opt.label}
            </button>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-xs font-bold text-primary hover:underline"
      >
        {open ? "Done" : `Select SDGs (${value.length} selected)`}
      </button>
    </div>
  );
}

export default function ProjectDetailsStep() {
  const { control, watch, setValue } = useFormContext();
  const sdgValue: number[] = watch("sdgAlignment") ?? [];

  return (
    <Card className="rounded-2xl border-slate-200 dark:border-slate-700 shadow-sm">
      <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <CardTitle className="text-lg font-black text-slate-800 dark:text-slate-100">
          Detailed Project Information
        </CardTitle>
        <p className="text-sm text-slate-500 mt-1">
          Optional — enrich your project with scientific depth and SDG alignment.
        </p>
      </CardHeader>
      <CardContent className="pt-6 space-y-5">
        <FormField
          control={control}
          name="abstract"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">Abstract</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Summarize your project's goals, methods, and key findings..."
                  className="min-h-[100px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="scientificQuestion"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">Scientific Question</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. How does solar panel angle affect efficiency in tropical climates?"
                  className="h-11"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="sdgAlignment"
          render={() => (
            <FormItem>
              <FormLabel className="font-bold">SDG Alignment</FormLabel>
              <FormDescription>Select up to 17 UN Sustainable Development Goals</FormDescription>
              <SdgMultiSelect
                value={sdgValue}
                onChange={(v) => setValue("sdgAlignment", v)}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="researchMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">Research Method</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your methodology — experiments, data collection, tools used..."
                  className="min-h-[80px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="experimentDetails"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">Experiment Details</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Variables, controls, trials, materials..."
                  className="min-h-[80px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="dataExplanation"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">Data & Results Explanation</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What did your data show? How do you interpret the results?"
                  className="min-h-[80px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
