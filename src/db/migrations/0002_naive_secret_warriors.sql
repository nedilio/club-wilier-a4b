CREATE TABLE "wallet_registrations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "wallet_registrations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" text NOT NULL,
	"platform" text NOT NULL,
	"serialNumber" text NOT NULL,
	"deviceId" text NOT NULL,
	"pushToken" text NOT NULL,
	"authToken" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "wallet_registrations" ADD CONSTRAINT "wallet_registrations_userId_users_rut_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("rut") ON DELETE no action ON UPDATE no action;