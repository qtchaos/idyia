CREATE TABLE `alternative_suggestions` (
	`id` text PRIMARY KEY NOT NULL,
	`alternative_id` text NOT NULL,
	`submitted_by` text,
	`type` text NOT NULL,
	`note` text NOT NULL,
	`url_after` text,
	`name_after` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`alternative_id`) REFERENCES `alternatives`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`submitted_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
