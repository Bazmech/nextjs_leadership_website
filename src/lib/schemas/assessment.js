import { z } from "zod";

export const ASSESSMENT_STATUSES = ["draft", "available", "archived"];
export const ASSESSMENT_FREQUENCIES = ["daily", "weekly", "monthly", "yearly"];

export const createAssessmentSchema = z.object({
  title: z.string().trim().min(1, "Enter a title.").max(200),
  description: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((value) => value || null),
  frequency: z.enum(ASSESSMENT_FREQUENCIES, {
    error: "Select a valid frequency.",
  }),
  status: z.enum(ASSESSMENT_STATUSES, {
    error: "Select a valid status.",
  }),
});

export const updateAssessmentSchema = createAssessmentSchema.extend({
  assessmentId: z.string().uuid("Invalid assessment."),
});

export const createDomainSchema = z.object({
  assessmentId: z.string().uuid("Invalid assessment."),
  name: z.string().trim().min(1, "Enter a domain name.").max(200),
});

export const updateDomainSchema = z.object({
  domainId: z.string().uuid("Invalid domain."),
  name: z.string().trim().min(1, "Enter a domain name.").max(200),
});

export const deleteDomainSchema = z.object({
  domainId: z.string().uuid("Invalid domain."),
});

export const createAttributeSchema = z.object({
  domainId: z.string().uuid("Invalid domain."),
  name: z.string().trim().min(1, "Enter an attribute name.").max(200),
});

export const updateAttributeSchema = z.object({
  attributeId: z.string().uuid("Invalid attribute."),
  name: z.string().trim().min(1, "Enter an attribute name.").max(200),
});

export const deleteAttributeSchema = z.object({
  attributeId: z.string().uuid("Invalid attribute."),
});

export const createStatementSchema = z.object({
  attributeId: z.string().uuid("Invalid attribute."),
  text: z.string().trim().min(1, "Enter a statement.").max(1000),
});

export const updateStatementSchema = z.object({
  statementId: z.string().uuid("Invalid statement."),
  text: z.string().trim().min(1, "Enter a statement.").max(1000),
});

export const deleteStatementSchema = z.object({
  statementId: z.string().uuid("Invalid statement."),
});

export const startSubmissionSchema = z.object({
  assessmentId: z.string().uuid("Invalid assessment."),
  title: z.string().trim().min(1, "Name this assessment.").max(200),
});

export const saveSubmissionAnswersSchema = z.object({
  submissionId: z.string().uuid("Invalid submission."),
  answers: z.record(
    z.string().uuid(),
    z.number().int().min(1).max(5),
  ),
});

export const completeSubmissionSchema = z.object({
  submissionId: z.string().uuid("Invalid submission."),
  answers: z.record(
    z.string().uuid(),
    z.number().int().min(1).max(5),
  ),
});

export const deleteSubmissionSchema = z.object({
  submissionId: z.string().uuid("Invalid submission."),
});

export const renameSubmissionSchema = z.object({
  submissionId: z.string().uuid("Invalid submission."),
  title: z.string().trim().min(1, "Enter a name.").max(200),
});
