CREATE TABLE `markdown_images` (
	`id` text PRIMARY KEY NOT NULL,
	`file_data` blob NOT NULL,
	`thumbnail_data` blob NOT NULL,
	`content_type` text NOT NULL,
	`original_name` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer,
	`url` text NOT NULL,
	`is_public` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
