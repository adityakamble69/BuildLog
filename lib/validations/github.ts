import { z } from "zod";

import { uuidSchema } from "@/lib/validations/common";

export const githubProjectIdSchema = z.object({ projectId: uuidSchema });

export const linkGitHubRepositorySchema = githubProjectIdSchema.extend({
  repositoryId: z.coerce.number().int().positive(),
});
