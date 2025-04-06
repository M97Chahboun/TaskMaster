import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { insertTaskSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

// Extend the validation schema to add client-side validations
const taskFormSchema = insertTaskSchema.extend({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }).max(100),
  description: z.string().max(500).optional(),
  dueDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  priority: z.enum(["low", "medium", "high"]),
  category: z.enum(["work", "personal", "health", "education", "other"]),
  inProgress: z.boolean().default(false),
});

interface TaskFormProps {
  task?: z.infer<typeof taskFormSchema> & { id?: number };
  onSuccess: () => void;
  userId?: number;
}

export default function TaskForm({ task, onSuccess, userId = 1 }: TaskFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof taskFormSchema>>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: task || {
      userId: userId, // Use the passed userId or default to 1
      title: "",
      description: "",
      dueDate: undefined,
      priority: "medium",
      category: "work",
      completed: false,
      inProgress: false,
    }
  });

  const onSubmit = async (data: z.infer<typeof taskFormSchema>) => {
    setIsSubmitting(true);
    
    try {
      if (task && 'id' in task) {
        // Update existing task
        await apiRequest('PATCH', `/api/tasks/${task.id}`, data);
        toast({
          title: "Task updated",
          description: "Your task has been updated successfully.",
        });
      } else {
        // Create new task
        await apiRequest('POST', '/api/tasks', data);
        toast({
          title: "Task created",
          description: "Your new task has been created successfully.",
        });
      }
      
      // Invalidate tasks cache
      queryClient.invalidateQueries({ queryKey: ['/api/tasks', { userId }] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/category', { userId }] });
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem saving your task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDateInputValue = () => {
    if (!task?.dueDate) return '';
    
    const date = new Date(task.dueDate);
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter task title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter task description" 
                  rows={3} 
                  {...field} 
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date (optional)</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field} 
                    value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                    onChange={(e) => field.onChange(e.target.value || undefined)}
                    placeholder="Leave empty to add to task backlog"
                  />
                </FormControl>
                <p className="text-sm text-muted-foreground mt-1">
                  Leave empty to add to your task backlog for daily planning
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onSuccess()}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {task && 'id' in task ? "Update Task" : "Add Task"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
