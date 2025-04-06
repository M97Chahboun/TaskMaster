import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { TimeBlock, insertTimeBlockSchema } from "@shared/schema";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

// Create a form schema from the insert time block schema with validation
const timeBlockFormSchema = insertTimeBlockSchema.extend({
  startTime: z.string().min(1, "Start time is required"),
  duration: z.coerce.number().min(5, "Duration must be at least 5 minutes").max(480, "Duration cannot exceed 8 hours"),
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
});

type TimeBlockFormValues = z.infer<typeof timeBlockFormSchema>;

interface TimeBlockFormProps {
  timeBlock?: Partial<TimeBlock>;
  onSuccess: () => void;
  onCancel: () => void;
  open: boolean;
  userId: number;
  selectedDate: Date;
}

export default function TimeBlockForm({
  timeBlock,
  onSuccess,
  onCancel,
  open,
  userId,
  selectedDate
}: TimeBlockFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize the form with default values or timeBlock values if editing
  const form = useForm<TimeBlockFormValues>({
    resolver: zodResolver(timeBlockFormSchema),
    defaultValues: {
      userId,
      title: timeBlock?.title || "",
      description: timeBlock?.description || "",
      startTime: timeBlock?.startTime || "09:00",
      duration: timeBlock?.duration || 30,
      taskId: timeBlock?.taskId || null,
      date: format(selectedDate, "yyyy-MM-dd"),
    },
  });

  // Mutation for creating or updating a time block
  const mutation = useMutation({
    mutationFn: async (values: TimeBlockFormValues) => {
      if (timeBlock?.id) {
        return apiRequest(
          "PATCH",
          `/api/timeblocks/${timeBlock.id}`,
          values
        );
      } else {
        return apiRequest(
          "POST",
          "/api/timeblocks",
          values
        );
      }
    },
    onSuccess: () => {
      // Invalidate queries related to time blocks
      queryClient.invalidateQueries({ queryKey: ['/api/timeblocks'] });
      toast({
        title: timeBlock?.id ? "Time block updated" : "Time block created",
        description: "Your time block has been saved successfully.",
      });
      onSuccess();
      form.reset();
      setIsSubmitting(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save time block: ${error.message}`,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const onSubmit = (values: TimeBlockFormValues) => {
    setIsSubmitting(true);
    mutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{timeBlock?.id ? "Edit Time Block" : "Add Time Block"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Meeting, Break, Focus Time..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={5}
                        max={480}
                        step={5}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Details about this time block..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : timeBlock?.id ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}