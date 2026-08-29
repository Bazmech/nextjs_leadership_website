CREATE TABLE "assessment_overall_averages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" uuid NOT NULL,
	"domain_averages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"attribute_averages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"submission_count" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "assessment_overall_averages_assessment_id_unique" UNIQUE("assessment_id")
);
--> statement-breakpoint
ALTER TABLE "assessment_submissions" ADD COLUMN "domain_averages" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "assessment_submissions" ADD COLUMN "attribute_averages" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "assessment_overall_averages" ADD CONSTRAINT "assessment_overall_averages_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;