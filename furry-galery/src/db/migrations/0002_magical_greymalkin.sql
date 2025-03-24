CREATE TABLE `photographer_takeover_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`photographer_id` text NOT NULL,
	`reason` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`admin_note` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`photographer_id`) REFERENCES `photographers`(`id`) ON UPDATE no action ON DELETE cascade
);
