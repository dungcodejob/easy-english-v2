import { z } from 'zod';

export const topicFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Topic name is required')
    .max(100, 'Topic name must be at most 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters'),
  // [API TODO] These fields are UI-ready but not yet supported by the backend.
  icon: z.string(),
  themeColor: z.string(),
  category: z.string(),
});

export type TopicFormValues = z.infer<typeof topicFormSchema>;
