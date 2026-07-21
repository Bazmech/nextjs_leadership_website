"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  completeSubmission,
  createAssessmentTemplate,
  createAttribute,
  createDomain,
  createStatement,
  deleteAttribute,
  deleteDomain,
  deleteOwnedSubmission,
  deleteStatement,
  renameOwnedSubmission,
  saveSubmissionAnswers,
  startSubmission,
  updateAssessmentTemplate,
  updateAttribute,
  updateDomain,
  updateStatement,
} from "@/lib/assessments";
import {
  completeSubmissionSchema,
  createAssessmentSchema,
  createAttributeSchema,
  createDomainSchema,
  createStatementSchema,
  deleteAttributeSchema,
  deleteDomainSchema,
  deleteStatementSchema,
  deleteSubmissionSchema,
  renameSubmissionSchema,
  saveSubmissionAnswersSchema,
  startSubmissionSchema,
  updateAssessmentSchema,
  updateAttributeSchema,
  updateDomainSchema,
  updateStatementSchema,
} from "@/lib/schemas/assessment";

function firstZodError(parsed) {
  const fieldErrors = parsed.error.flatten().fieldErrors;
  return (
    Object.values(fieldErrors).flat()[0] ?? "Please fix the highlighted fields."
  );
}

function parseDescription(formData) {
  const raw = formData.get("description");
  return typeof raw === "string" ? raw : "";
}

/**
 * Super-admin assessment template CRUD — staff surface only.
 * See user-data-authorization.mdc.
 */
export async function createAssessment(_prevState, formData) {
  const parsed = createAssessmentSchema.safeParse({
    title: formData.get("title"),
    description: parseDescription(formData),
    frequency: formData.get("frequency"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { success: false, error: firstZodError(parsed), message: null };
  }

  try {
    const row = await createAssessmentTemplate(parsed.data);
    revalidatePath("/dashboard/questions");
    return {
      success: true,
      error: null,
      message: "Assessment created.",
      assessmentId: row.id,
    };
  } catch (error) {
    console.error("createAssessment failed:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again shortly.",
      message: null,
    };
  }
}

export async function updateAssessment(_prevState, formData) {
  const parsed = updateAssessmentSchema.safeParse({
    assessmentId: formData.get("assessmentId"),
    title: formData.get("title"),
    description: parseDescription(formData),
    frequency: formData.get("frequency"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { success: false, error: firstZodError(parsed), message: null };
  }

  try {
    const row = await updateAssessmentTemplate(parsed.data);
    if (!row) {
      return { success: false, error: "Assessment not found.", message: null };
    }
    revalidatePath("/dashboard/questions");
    revalidatePath(`/dashboard/questions/${parsed.data.assessmentId}`);
    return { success: true, error: null, message: "Assessment updated." };
  } catch (error) {
    console.error("updateAssessment failed:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again shortly.",
      message: null,
    };
  }
}

export async function addDomain(_prevState, formData) {
  const parsed = createDomainSchema.safeParse({
    assessmentId: formData.get("assessmentId"),
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { success: false, error: firstZodError(parsed), message: null };
  }

  try {
    const result = await createDomain(parsed.data);
    if (!result.ok) {
      return { success: false, error: result.error, message: null };
    }
    revalidatePath(`/dashboard/questions/${parsed.data.assessmentId}`);
    return { success: true, error: null, message: "Domain added." };
  } catch (error) {
    console.error("addDomain failed:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again shortly.",
      message: null,
    };
  }
}

export async function renameDomain(_prevState, formData) {
  const parsed = updateDomainSchema.safeParse({
    domainId: formData.get("domainId"),
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { success: false, error: firstZodError(parsed), message: null };
  }

  try {
    const result = await updateDomain(parsed.data);
    if (!result.ok) {
      return { success: false, error: result.error, message: null };
    }
    const path = `/dashboard/questions/${result.domain.assessmentId}`;
    revalidatePath(path);
    return { success: true, error: null, message: "Domain updated." };
  } catch (error) {
    console.error("renameDomain failed:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again shortly.",
      message: null,
    };
  }
}

export async function removeDomain(_prevState, formData) {
  const parsed = deleteDomainSchema.safeParse({
    domainId: formData.get("domainId"),
  });

  if (!parsed.success) {
    return { success: false, error: firstZodError(parsed), message: null };
  }

  try {
    const result = await deleteDomain(parsed.data);
    if (!result.ok) {
      return { success: false, error: result.error, message: null };
    }
    if (result.assessmentId) {
      revalidatePath(`/dashboard/questions/${result.assessmentId}`);
    }
    revalidatePath("/dashboard/questions");
    return { success: true, error: null, message: "Domain deleted." };
  } catch (error) {
    console.error("removeDomain failed:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again shortly.",
      message: null,
    };
  }
}

export async function addAttribute(_prevState, formData) {
  const parsed = createAttributeSchema.safeParse({
    domainId: formData.get("domainId"),
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { success: false, error: firstZodError(parsed), message: null };
  }

  try {
    const result = await createAttribute(parsed.data);
    if (!result.ok) {
      return { success: false, error: result.error, message: null };
    }
    if (result.assessmentId) {
      revalidatePath(`/dashboard/questions/${result.assessmentId}`);
    }
    return { success: true, error: null, message: "Attribute added." };
  } catch (error) {
    console.error("addAttribute failed:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again shortly.",
      message: null,
    };
  }
}

export async function renameAttribute(_prevState, formData) {
  const parsed = updateAttributeSchema.safeParse({
    attributeId: formData.get("attributeId"),
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { success: false, error: firstZodError(parsed), message: null };
  }

  try {
    const result = await updateAttribute(parsed.data);
    if (!result.ok) {
      return { success: false, error: result.error, message: null };
    }
    if (result.assessmentId) {
      revalidatePath(`/dashboard/questions/${result.assessmentId}`);
    }
    return { success: true, error: null, message: "Attribute updated." };
  } catch (error) {
    console.error("renameAttribute failed:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again shortly.",
      message: null,
    };
  }
}

export async function removeAttribute(_prevState, formData) {
  const parsed = deleteAttributeSchema.safeParse({
    attributeId: formData.get("attributeId"),
  });

  if (!parsed.success) {
    return { success: false, error: firstZodError(parsed), message: null };
  }

  try {
    const result = await deleteAttribute(parsed.data);
    if (!result.ok) {
      return { success: false, error: result.error, message: null };
    }
    if (result.assessmentId) {
      revalidatePath(`/dashboard/questions/${result.assessmentId}`);
    }
    return { success: true, error: null, message: "Attribute deleted." };
  } catch (error) {
    console.error("removeAttribute failed:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again shortly.",
      message: null,
    };
  }
}

export async function addStatement(_prevState, formData) {
  const parsed = createStatementSchema.safeParse({
    attributeId: formData.get("attributeId"),
    text: formData.get("text"),
  });

  if (!parsed.success) {
    return { success: false, error: firstZodError(parsed), message: null };
  }

  try {
    const result = await createStatement(parsed.data);
    if (!result.ok) {
      return { success: false, error: result.error, message: null };
    }
    if (result.assessmentId) {
      revalidatePath(`/dashboard/questions/${result.assessmentId}`);
    }
    return { success: true, error: null, message: "Statement added." };
  } catch (error) {
    console.error("addStatement failed:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again shortly.",
      message: null,
    };
  }
}

export async function renameStatement(_prevState, formData) {
  const parsed = updateStatementSchema.safeParse({
    statementId: formData.get("statementId"),
    text: formData.get("text"),
  });

  if (!parsed.success) {
    return { success: false, error: firstZodError(parsed), message: null };
  }

  try {
    const result = await updateStatement(parsed.data);
    if (!result.ok) {
      return { success: false, error: result.error, message: null };
    }
    if (result.assessmentId) {
      revalidatePath(`/dashboard/questions/${result.assessmentId}`);
    }
    return { success: true, error: null, message: "Statement updated." };
  } catch (error) {
    console.error("renameStatement failed:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again shortly.",
      message: null,
    };
  }
}

export async function removeStatement(_prevState, formData) {
  const parsed = deleteStatementSchema.safeParse({
    statementId: formData.get("statementId"),
  });

  if (!parsed.success) {
    return { success: false, error: firstZodError(parsed), message: null };
  }

  try {
    const result = await deleteStatement(parsed.data);
    if (!result.ok) {
      return { success: false, error: result.error, message: null };
    }
    if (result.assessmentId) {
      revalidatePath(`/dashboard/questions/${result.assessmentId}`);
    }
    return { success: true, error: null, message: "Statement deleted." };
  } catch (error) {
    console.error("removeStatement failed:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again shortly.",
      message: null,
    };
  }
}

/**
 * Start or resume a user submission — scoped to session clerk user id.
 * See user-data-authorization.mdc.
 */
export async function startAssessmentSubmission(_prevState, formData) {
  const parsed = startSubmissionSchema.safeParse({
    assessmentId: formData.get("assessmentId"),
    title: formData.get("title"),
  });

  if (!parsed.success) {
    return { success: false, error: firstZodError(parsed), message: null };
  }

  let submissionId;
  try {
    const result = await startSubmission(parsed.data);
    if (!result.ok) {
      return { success: false, error: result.error, message: null };
    }
    submissionId = result.submission.id;
  } catch (error) {
    console.error("startAssessmentSubmission failed:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again shortly.",
      message: null,
    };
  }

  revalidatePath("/dashboard/assessments");
  revalidatePath("/dashboard/assessments/past");
  revalidatePath("/dashboard");
  redirect(`/dashboard/assessments/submissions/${submissionId}`);
}

/**
 * Autosave / manual save of answers — own submission only.
 */
export async function saveAssessmentAnswers(submissionId, answers) {
  const parsed = saveSubmissionAnswersSchema.safeParse({
    submissionId,
    answers,
  });

  if (!parsed.success) {
    return { success: false, error: firstZodError(parsed), message: null };
  }

  try {
    const result = await saveSubmissionAnswers(parsed.data);
    if (!result.ok) {
      return { success: false, error: result.error, message: null };
    }
    return {
      success: true,
      error: null,
      message: "Saved.",
      updatedAt: result.submission.updatedAt,
    };
  } catch (error) {
    console.error("saveAssessmentAnswers failed:", error);
    return {
      success: false,
      error: "Save failed. Please try again.",
      message: null,
    };
  }
}

export async function completeAssessmentSubmission(_prevState, formData) {
  let answers = {};
  const rawAnswers = formData.get("answers");
  if (typeof rawAnswers === "string" && rawAnswers) {
    try {
      answers = JSON.parse(rawAnswers);
    } catch {
      return {
        success: false,
        error: "Invalid answers payload.",
        message: null,
      };
    }
  }

  const parsed = completeSubmissionSchema.safeParse({
    submissionId: formData.get("submissionId"),
    answers,
  });

  if (!parsed.success) {
    return { success: false, error: firstZodError(parsed), message: null };
  }

  try {
    const result = await completeSubmission(parsed.data);
    if (!result.ok) {
      return { success: false, error: result.error, message: null };
    }
    revalidatePath("/dashboard/assessments");
    revalidatePath("/dashboard/assessments/past");
    revalidatePath(`/dashboard/assessments/submissions/${parsed.data.submissionId}`);
    revalidatePath("/dashboard");
    return {
      success: true,
      error: null,
      message: "Assessment completed.",
    };
  } catch (error) {
    console.error("completeAssessmentSubmission failed:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again shortly.",
      message: null,
    };
  }
}

/**
 * Delete own in-progress submission — completed assessments cannot be deleted.
 * See user-data-authorization.mdc.
 */
export async function deleteAssessmentSubmission(_prevState, formData) {
  const parsed = deleteSubmissionSchema.safeParse({
    submissionId: formData.get("submissionId"),
  });

  if (!parsed.success) {
    return { success: false, error: firstZodError(parsed), message: null };
  }

  try {
    const result = await deleteOwnedSubmission(parsed.data);
    if (!result.ok) {
      return { success: false, error: result.error, message: null };
    }
  } catch (error) {
    console.error("deleteAssessmentSubmission failed:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again shortly.",
      message: null,
    };
  }

  revalidatePath("/dashboard/assessments");
  revalidatePath("/dashboard/assessments/past");
  revalidatePath("/dashboard");
  redirect("/dashboard/assessments");
}

/**
 * Rename own submission (in progress or completed).
 * See user-data-authorization.mdc.
 */
export async function renameAssessmentSubmission(_prevState, formData) {
  const parsed = renameSubmissionSchema.safeParse({
    submissionId: formData.get("submissionId"),
    title: formData.get("title"),
  });

  if (!parsed.success) {
    return { success: false, error: firstZodError(parsed), message: null };
  }

  try {
    const result = await renameOwnedSubmission(parsed.data);
    if (!result.ok) {
      return { success: false, error: result.error, message: null };
    }
    revalidatePath("/dashboard/assessments");
    revalidatePath("/dashboard/assessments/past");
    revalidatePath(
      `/dashboard/assessments/submissions/${parsed.data.submissionId}`,
    );
    revalidatePath("/dashboard");
    return {
      success: true,
      error: null,
      message: "Name updated.",
    };
  } catch (error) {
    console.error("renameAssessmentSubmission failed:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again shortly.",
      message: null,
    };
  }
}
