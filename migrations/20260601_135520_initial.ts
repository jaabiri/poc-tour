import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`users_sessions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`created_at\` text,
  	\`expires_at\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`users_sessions_order_idx\` ON \`users_sessions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`users_sessions_parent_id_idx\` ON \`users_sessions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`users\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`role\` text DEFAULT 'contributeur' NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`email\` text NOT NULL,
  	\`reset_password_token\` text,
  	\`reset_password_expiration\` text,
  	\`salt\` text,
  	\`hash\` text,
  	\`login_attempts\` numeric DEFAULT 0,
  	\`lock_until\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`users_updated_at_idx\` ON \`users\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`users_created_at_idx\` ON \`users\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`users_email_idx\` ON \`users\` (\`email\`);`)
  await db.run(sql`CREATE TABLE \`users_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`groupes_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`groupes_id\`) REFERENCES \`groupes\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`users_rels_order_idx\` ON \`users_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`users_rels_parent_idx\` ON \`users_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`users_rels_path_idx\` ON \`users_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`users_rels_groupes_id_idx\` ON \`users_rels\` (\`groupes_id\`);`)
  await db.run(sql`CREATE TABLE \`groupes\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`description\` text,
  	\`can_publish\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`groupes_updated_at_idx\` ON \`groupes\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`groupes_created_at_idx\` ON \`groupes\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`groupes_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`rubriques_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`groupes\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`rubriques_id\`) REFERENCES \`rubriques\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`groupes_rels_order_idx\` ON \`groupes_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`groupes_rels_parent_idx\` ON \`groupes_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`groupes_rels_path_idx\` ON \`groupes_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`groupes_rels_rubriques_id_idx\` ON \`groupes_rels\` (\`rubriques_id\`);`)
  await db.run(sql`CREATE TABLE \`rubriques_blocks_hero_ctas\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`url\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rubriques_blocks_hero\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_hero_ctas_order_idx\` ON \`rubriques_blocks_hero_ctas\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_hero_ctas_parent_id_idx\` ON \`rubriques_blocks_hero_ctas\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`rubriques_blocks_hero\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`subtitle\` text,
  	\`image_id\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rubriques\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_hero_order_idx\` ON \`rubriques_blocks_hero\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_hero_parent_id_idx\` ON \`rubriques_blocks_hero\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_hero_path_idx\` ON \`rubriques_blocks_hero\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_hero_image_idx\` ON \`rubriques_blocks_hero\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`rubriques_blocks_rich_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`content\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rubriques\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_rich_text_order_idx\` ON \`rubriques_blocks_rich_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_rich_text_parent_id_idx\` ON \`rubriques_blocks_rich_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_rich_text_path_idx\` ON \`rubriques_blocks_rich_text\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`rubriques_blocks_image_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`content\` text,
  	\`image_position\` text DEFAULT 'left',
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rubriques\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_image_text_order_idx\` ON \`rubriques_blocks_image_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_image_text_parent_id_idx\` ON \`rubriques_blocks_image_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_image_text_path_idx\` ON \`rubriques_blocks_image_text\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_image_text_image_idx\` ON \`rubriques_blocks_image_text\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`rubriques_blocks_card_grid_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`text\` text,
  	\`image_id\` integer,
  	\`url\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rubriques_blocks_card_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_card_grid_cards_order_idx\` ON \`rubriques_blocks_card_grid_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_card_grid_cards_parent_id_idx\` ON \`rubriques_blocks_card_grid_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_card_grid_cards_image_idx\` ON \`rubriques_blocks_card_grid_cards\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`rubriques_blocks_card_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`source\` text DEFAULT 'manual',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rubriques\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_card_grid_order_idx\` ON \`rubriques_blocks_card_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_card_grid_parent_id_idx\` ON \`rubriques_blocks_card_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_card_grid_path_idx\` ON \`rubriques_blocks_card_grid\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`rubriques_blocks_faq_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`question\` text,
  	\`answer\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rubriques_blocks_faq\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_faq_items_order_idx\` ON \`rubriques_blocks_faq_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_faq_items_parent_id_idx\` ON \`rubriques_blocks_faq_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`rubriques_blocks_faq\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rubriques\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_faq_order_idx\` ON \`rubriques_blocks_faq\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_faq_parent_id_idx\` ON \`rubriques_blocks_faq\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_faq_path_idx\` ON \`rubriques_blocks_faq\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`rubriques_blocks_cta_form\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`description\` text,
  	\`formulaire_id\` integer,
  	\`display_mode\` text DEFAULT 'inline',
  	\`block_name\` text,
  	FOREIGN KEY (\`formulaire_id\`) REFERENCES \`formulaire\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rubriques\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_cta_form_order_idx\` ON \`rubriques_blocks_cta_form\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_cta_form_parent_id_idx\` ON \`rubriques_blocks_cta_form\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_cta_form_path_idx\` ON \`rubriques_blocks_cta_form\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_cta_form_formulaire_idx\` ON \`rubriques_blocks_cta_form\` (\`formulaire_id\`);`)
  await db.run(sql`CREATE TABLE \`rubriques_blocks_map_embed\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`arcgis_item_url\` text,
  	\`display_mode\` text DEFAULT 'fullscreen-button',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rubriques\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_map_embed_order_idx\` ON \`rubriques_blocks_map_embed\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_map_embed_parent_id_idx\` ON \`rubriques_blocks_map_embed\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_map_embed_path_idx\` ON \`rubriques_blocks_map_embed\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`rubriques_blocks_news_list\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`mode\` text DEFAULT 'auto',
  	\`limit\` numeric DEFAULT 6,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rubriques\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_news_list_order_idx\` ON \`rubriques_blocks_news_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_news_list_parent_id_idx\` ON \`rubriques_blocks_news_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_news_list_path_idx\` ON \`rubriques_blocks_news_list\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`rubriques_blocks_agenda\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`mode\` text DEFAULT 'auto',
  	\`limit\` numeric DEFAULT 6,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rubriques\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_agenda_order_idx\` ON \`rubriques_blocks_agenda\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_agenda_parent_id_idx\` ON \`rubriques_blocks_agenda\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_agenda_path_idx\` ON \`rubriques_blocks_agenda\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`rubriques_blocks_partners_partners\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`logo_id\` integer,
  	\`url\` text,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rubriques_blocks_partners\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_partners_partners_order_idx\` ON \`rubriques_blocks_partners_partners\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_partners_partners_parent_id_idx\` ON \`rubriques_blocks_partners_partners\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_partners_partners_logo_idx\` ON \`rubriques_blocks_partners_partners\` (\`logo_id\`);`)
  await db.run(sql`CREATE TABLE \`rubriques_blocks_partners\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rubriques\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_partners_order_idx\` ON \`rubriques_blocks_partners\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_partners_parent_id_idx\` ON \`rubriques_blocks_partners\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_partners_path_idx\` ON \`rubriques_blocks_partners\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`rubriques_blocks_related_links_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`type\` text DEFAULT 'internal',
  	\`rubrique_id\` integer,
  	\`label\` text,
  	\`url\` text,
  	FOREIGN KEY (\`rubrique_id\`) REFERENCES \`rubriques\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rubriques_blocks_related_links\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_related_links_links_order_idx\` ON \`rubriques_blocks_related_links_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_related_links_links_parent_id_idx\` ON \`rubriques_blocks_related_links_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_related_links_links_rubrique_idx\` ON \`rubriques_blocks_related_links_links\` (\`rubrique_id\`);`)
  await db.run(sql`CREATE TABLE \`rubriques_blocks_related_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rubriques\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_related_links_order_idx\` ON \`rubriques_blocks_related_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_related_links_parent_id_idx\` ON \`rubriques_blocks_related_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_related_links_path_idx\` ON \`rubriques_blocks_related_links\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`rubriques_blocks_download_list_files\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`file_id\` integer,
  	\`label\` text,
  	FOREIGN KEY (\`file_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rubriques_blocks_download_list\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_download_list_files_order_idx\` ON \`rubriques_blocks_download_list_files\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_download_list_files_parent_id_idx\` ON \`rubriques_blocks_download_list_files\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_download_list_files_file_idx\` ON \`rubriques_blocks_download_list_files\` (\`file_id\`);`)
  await db.run(sql`CREATE TABLE \`rubriques_blocks_download_list\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rubriques\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_download_list_order_idx\` ON \`rubriques_blocks_download_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_download_list_parent_id_idx\` ON \`rubriques_blocks_download_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_download_list_path_idx\` ON \`rubriques_blocks_download_list\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`rubriques_blocks_breadcrumb\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`show_home\` integer DEFAULT true,
  	\`current_label_override\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rubriques\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_breadcrumb_order_idx\` ON \`rubriques_blocks_breadcrumb\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_breadcrumb_parent_id_idx\` ON \`rubriques_blocks_breadcrumb\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rubriques_blocks_breadcrumb_path_idx\` ON \`rubriques_blocks_breadcrumb\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`rubriques_breadcrumbs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`doc_id\` integer,
  	\`url\` text,
  	\`label\` text,
  	FOREIGN KEY (\`doc_id\`) REFERENCES \`rubriques\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`rubriques\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rubriques_breadcrumbs_order_idx\` ON \`rubriques_breadcrumbs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`rubriques_breadcrumbs_parent_id_idx\` ON \`rubriques_breadcrumbs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rubriques_breadcrumbs_doc_idx\` ON \`rubriques_breadcrumbs\` (\`doc_id\`);`)
  await db.run(sql`CREATE TABLE \`rubriques\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`slug\` text,
  	\`visible\` integer DEFAULT true,
  	\`order\` numeric DEFAULT 0,
  	\`icon\` text,
  	\`template\` text DEFAULT 'auto',
  	\`seo_meta_title\` text,
  	\`seo_meta_description\` text,
  	\`seo_og_image_id\` integer,
  	\`parent_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`rubriques\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`rubriques_slug_idx\` ON \`rubriques\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`rubriques_seo_seo_og_image_idx\` ON \`rubriques\` (\`seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`rubriques_parent_idx\` ON \`rubriques\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rubriques_updated_at_idx\` ON \`rubriques\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`rubriques_created_at_idx\` ON \`rubriques\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`rubriques__status_idx\` ON \`rubriques\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`rubriques_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`rubriques_id\` integer,
  	\`actualite_id\` integer,
  	\`evenement_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`rubriques\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`rubriques_id\`) REFERENCES \`rubriques\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`actualite_id\`) REFERENCES \`actualite\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`evenement_id\`) REFERENCES \`evenement\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`rubriques_rels_order_idx\` ON \`rubriques_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`rubriques_rels_parent_idx\` ON \`rubriques_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`rubriques_rels_path_idx\` ON \`rubriques_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`rubriques_rels_rubriques_id_idx\` ON \`rubriques_rels\` (\`rubriques_id\`);`)
  await db.run(sql`CREATE INDEX \`rubriques_rels_actualite_id_idx\` ON \`rubriques_rels\` (\`actualite_id\`);`)
  await db.run(sql`CREATE INDEX \`rubriques_rels_evenement_id_idx\` ON \`rubriques_rels\` (\`evenement_id\`);`)
  await db.run(sql`CREATE TABLE \`_rubriques_v_blocks_hero_ctas\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`url\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_rubriques_v_blocks_hero\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_hero_ctas_order_idx\` ON \`_rubriques_v_blocks_hero_ctas\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_hero_ctas_parent_id_idx\` ON \`_rubriques_v_blocks_hero_ctas\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_rubriques_v_blocks_hero\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`subtitle\` text,
  	\`image_id\` integer,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_rubriques_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_hero_order_idx\` ON \`_rubriques_v_blocks_hero\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_hero_parent_id_idx\` ON \`_rubriques_v_blocks_hero\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_hero_path_idx\` ON \`_rubriques_v_blocks_hero\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_hero_image_idx\` ON \`_rubriques_v_blocks_hero\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_rubriques_v_blocks_rich_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`content\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_rubriques_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_rich_text_order_idx\` ON \`_rubriques_v_blocks_rich_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_rich_text_parent_id_idx\` ON \`_rubriques_v_blocks_rich_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_rich_text_path_idx\` ON \`_rubriques_v_blocks_rich_text\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_rubriques_v_blocks_image_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`content\` text,
  	\`image_position\` text DEFAULT 'left',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_rubriques_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_image_text_order_idx\` ON \`_rubriques_v_blocks_image_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_image_text_parent_id_idx\` ON \`_rubriques_v_blocks_image_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_image_text_path_idx\` ON \`_rubriques_v_blocks_image_text\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_image_text_image_idx\` ON \`_rubriques_v_blocks_image_text\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_rubriques_v_blocks_card_grid_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`text\` text,
  	\`image_id\` integer,
  	\`url\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_rubriques_v_blocks_card_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_card_grid_cards_order_idx\` ON \`_rubriques_v_blocks_card_grid_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_card_grid_cards_parent_id_idx\` ON \`_rubriques_v_blocks_card_grid_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_card_grid_cards_image_idx\` ON \`_rubriques_v_blocks_card_grid_cards\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_rubriques_v_blocks_card_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`source\` text DEFAULT 'manual',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_rubriques_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_card_grid_order_idx\` ON \`_rubriques_v_blocks_card_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_card_grid_parent_id_idx\` ON \`_rubriques_v_blocks_card_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_card_grid_path_idx\` ON \`_rubriques_v_blocks_card_grid\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_rubriques_v_blocks_faq_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`question\` text,
  	\`answer\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_rubriques_v_blocks_faq\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_faq_items_order_idx\` ON \`_rubriques_v_blocks_faq_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_faq_items_parent_id_idx\` ON \`_rubriques_v_blocks_faq_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_rubriques_v_blocks_faq\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_rubriques_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_faq_order_idx\` ON \`_rubriques_v_blocks_faq\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_faq_parent_id_idx\` ON \`_rubriques_v_blocks_faq\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_faq_path_idx\` ON \`_rubriques_v_blocks_faq\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_rubriques_v_blocks_cta_form\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`description\` text,
  	\`formulaire_id\` integer,
  	\`display_mode\` text DEFAULT 'inline',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`formulaire_id\`) REFERENCES \`formulaire\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_rubriques_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_cta_form_order_idx\` ON \`_rubriques_v_blocks_cta_form\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_cta_form_parent_id_idx\` ON \`_rubriques_v_blocks_cta_form\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_cta_form_path_idx\` ON \`_rubriques_v_blocks_cta_form\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_cta_form_formulaire_idx\` ON \`_rubriques_v_blocks_cta_form\` (\`formulaire_id\`);`)
  await db.run(sql`CREATE TABLE \`_rubriques_v_blocks_map_embed\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`arcgis_item_url\` text,
  	\`display_mode\` text DEFAULT 'fullscreen-button',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_rubriques_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_map_embed_order_idx\` ON \`_rubriques_v_blocks_map_embed\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_map_embed_parent_id_idx\` ON \`_rubriques_v_blocks_map_embed\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_map_embed_path_idx\` ON \`_rubriques_v_blocks_map_embed\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_rubriques_v_blocks_news_list\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`mode\` text DEFAULT 'auto',
  	\`limit\` numeric DEFAULT 6,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_rubriques_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_news_list_order_idx\` ON \`_rubriques_v_blocks_news_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_news_list_parent_id_idx\` ON \`_rubriques_v_blocks_news_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_news_list_path_idx\` ON \`_rubriques_v_blocks_news_list\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_rubriques_v_blocks_agenda\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`mode\` text DEFAULT 'auto',
  	\`limit\` numeric DEFAULT 6,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_rubriques_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_agenda_order_idx\` ON \`_rubriques_v_blocks_agenda\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_agenda_parent_id_idx\` ON \`_rubriques_v_blocks_agenda\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_agenda_path_idx\` ON \`_rubriques_v_blocks_agenda\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_rubriques_v_blocks_partners_partners\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`logo_id\` integer,
  	\`url\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_rubriques_v_blocks_partners\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_partners_partners_order_idx\` ON \`_rubriques_v_blocks_partners_partners\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_partners_partners_parent_id_idx\` ON \`_rubriques_v_blocks_partners_partners\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_partners_partners_logo_idx\` ON \`_rubriques_v_blocks_partners_partners\` (\`logo_id\`);`)
  await db.run(sql`CREATE TABLE \`_rubriques_v_blocks_partners\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_rubriques_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_partners_order_idx\` ON \`_rubriques_v_blocks_partners\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_partners_parent_id_idx\` ON \`_rubriques_v_blocks_partners\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_partners_path_idx\` ON \`_rubriques_v_blocks_partners\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_rubriques_v_blocks_related_links_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`type\` text DEFAULT 'internal',
  	\`rubrique_id\` integer,
  	\`label\` text,
  	\`url\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`rubrique_id\`) REFERENCES \`rubriques\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_rubriques_v_blocks_related_links\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_related_links_links_order_idx\` ON \`_rubriques_v_blocks_related_links_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_related_links_links_parent_id_idx\` ON \`_rubriques_v_blocks_related_links_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_related_links_links_rubrique_idx\` ON \`_rubriques_v_blocks_related_links_links\` (\`rubrique_id\`);`)
  await db.run(sql`CREATE TABLE \`_rubriques_v_blocks_related_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_rubriques_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_related_links_order_idx\` ON \`_rubriques_v_blocks_related_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_related_links_parent_id_idx\` ON \`_rubriques_v_blocks_related_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_related_links_path_idx\` ON \`_rubriques_v_blocks_related_links\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_rubriques_v_blocks_download_list_files\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`file_id\` integer,
  	\`label\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`file_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_rubriques_v_blocks_download_list\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_download_list_files_order_idx\` ON \`_rubriques_v_blocks_download_list_files\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_download_list_files_parent_id_idx\` ON \`_rubriques_v_blocks_download_list_files\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_download_list_files_file_idx\` ON \`_rubriques_v_blocks_download_list_files\` (\`file_id\`);`)
  await db.run(sql`CREATE TABLE \`_rubriques_v_blocks_download_list\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_rubriques_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_download_list_order_idx\` ON \`_rubriques_v_blocks_download_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_download_list_parent_id_idx\` ON \`_rubriques_v_blocks_download_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_download_list_path_idx\` ON \`_rubriques_v_blocks_download_list\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_rubriques_v_blocks_breadcrumb\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`show_home\` integer DEFAULT true,
  	\`current_label_override\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_rubriques_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_breadcrumb_order_idx\` ON \`_rubriques_v_blocks_breadcrumb\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_breadcrumb_parent_id_idx\` ON \`_rubriques_v_blocks_breadcrumb\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_blocks_breadcrumb_path_idx\` ON \`_rubriques_v_blocks_breadcrumb\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_rubriques_v_version_breadcrumbs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`doc_id\` integer,
  	\`url\` text,
  	\`label\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`doc_id\`) REFERENCES \`rubriques\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_rubriques_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_rubriques_v_version_breadcrumbs_order_idx\` ON \`_rubriques_v_version_breadcrumbs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_version_breadcrumbs_parent_id_idx\` ON \`_rubriques_v_version_breadcrumbs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_version_breadcrumbs_doc_idx\` ON \`_rubriques_v_version_breadcrumbs\` (\`doc_id\`);`)
  await db.run(sql`CREATE TABLE \`_rubriques_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_title\` text,
  	\`version_slug\` text,
  	\`version_visible\` integer DEFAULT true,
  	\`version_order\` numeric DEFAULT 0,
  	\`version_icon\` text,
  	\`version_template\` text DEFAULT 'auto',
  	\`version_seo_meta_title\` text,
  	\`version_seo_meta_description\` text,
  	\`version_seo_og_image_id\` integer,
  	\`version_parent_id\` integer,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	\`autosave\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`rubriques\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_parent_id\`) REFERENCES \`rubriques\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_rubriques_v_parent_idx\` ON \`_rubriques_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_version_version_slug_idx\` ON \`_rubriques_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_version_seo_version_seo_og_image_idx\` ON \`_rubriques_v\` (\`version_seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_version_version_parent_idx\` ON \`_rubriques_v\` (\`version_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_version_version_updated_at_idx\` ON \`_rubriques_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_version_version_created_at_idx\` ON \`_rubriques_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_version_version__status_idx\` ON \`_rubriques_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_created_at_idx\` ON \`_rubriques_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_updated_at_idx\` ON \`_rubriques_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_latest_idx\` ON \`_rubriques_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_autosave_idx\` ON \`_rubriques_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`_rubriques_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`rubriques_id\` integer,
  	\`actualite_id\` integer,
  	\`evenement_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_rubriques_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`rubriques_id\`) REFERENCES \`rubriques\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`actualite_id\`) REFERENCES \`actualite\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`evenement_id\`) REFERENCES \`evenement\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_rubriques_v_rels_order_idx\` ON \`_rubriques_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_rels_parent_idx\` ON \`_rubriques_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_rels_path_idx\` ON \`_rubriques_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_rels_rubriques_id_idx\` ON \`_rubriques_v_rels\` (\`rubriques_id\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_rels_actualite_id_idx\` ON \`_rubriques_v_rels\` (\`actualite_id\`);`)
  await db.run(sql`CREATE INDEX \`_rubriques_v_rels_evenement_id_idx\` ON \`_rubriques_v_rels\` (\`evenement_id\`);`)
  await db.run(sql`CREATE TABLE \`article_blocks_hero_ctas\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`url\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`article_blocks_hero\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`article_blocks_hero_ctas_order_idx\` ON \`article_blocks_hero_ctas\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`article_blocks_hero_ctas_parent_id_idx\` ON \`article_blocks_hero_ctas\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`article_blocks_hero\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`subtitle\` text,
  	\`image_id\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`article\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`article_blocks_hero_order_idx\` ON \`article_blocks_hero\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`article_blocks_hero_parent_id_idx\` ON \`article_blocks_hero\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`article_blocks_hero_path_idx\` ON \`article_blocks_hero\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`article_blocks_hero_image_idx\` ON \`article_blocks_hero\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`article_blocks_rich_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`content\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`article\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`article_blocks_rich_text_order_idx\` ON \`article_blocks_rich_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`article_blocks_rich_text_parent_id_idx\` ON \`article_blocks_rich_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`article_blocks_rich_text_path_idx\` ON \`article_blocks_rich_text\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`article_blocks_image_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`content\` text,
  	\`image_position\` text DEFAULT 'left',
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`article\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`article_blocks_image_text_order_idx\` ON \`article_blocks_image_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`article_blocks_image_text_parent_id_idx\` ON \`article_blocks_image_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`article_blocks_image_text_path_idx\` ON \`article_blocks_image_text\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`article_blocks_image_text_image_idx\` ON \`article_blocks_image_text\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`article_blocks_card_grid_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`text\` text,
  	\`image_id\` integer,
  	\`url\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`article_blocks_card_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`article_blocks_card_grid_cards_order_idx\` ON \`article_blocks_card_grid_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`article_blocks_card_grid_cards_parent_id_idx\` ON \`article_blocks_card_grid_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`article_blocks_card_grid_cards_image_idx\` ON \`article_blocks_card_grid_cards\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`article_blocks_card_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`source\` text DEFAULT 'manual',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`article\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`article_blocks_card_grid_order_idx\` ON \`article_blocks_card_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`article_blocks_card_grid_parent_id_idx\` ON \`article_blocks_card_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`article_blocks_card_grid_path_idx\` ON \`article_blocks_card_grid\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`article_blocks_faq_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`question\` text,
  	\`answer\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`article_blocks_faq\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`article_blocks_faq_items_order_idx\` ON \`article_blocks_faq_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`article_blocks_faq_items_parent_id_idx\` ON \`article_blocks_faq_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`article_blocks_faq\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`article\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`article_blocks_faq_order_idx\` ON \`article_blocks_faq\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`article_blocks_faq_parent_id_idx\` ON \`article_blocks_faq\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`article_blocks_faq_path_idx\` ON \`article_blocks_faq\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`article_blocks_cta_form\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`description\` text,
  	\`formulaire_id\` integer,
  	\`display_mode\` text DEFAULT 'inline',
  	\`block_name\` text,
  	FOREIGN KEY (\`formulaire_id\`) REFERENCES \`formulaire\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`article\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`article_blocks_cta_form_order_idx\` ON \`article_blocks_cta_form\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`article_blocks_cta_form_parent_id_idx\` ON \`article_blocks_cta_form\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`article_blocks_cta_form_path_idx\` ON \`article_blocks_cta_form\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`article_blocks_cta_form_formulaire_idx\` ON \`article_blocks_cta_form\` (\`formulaire_id\`);`)
  await db.run(sql`CREATE TABLE \`article_blocks_map_embed\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`arcgis_item_url\` text,
  	\`display_mode\` text DEFAULT 'fullscreen-button',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`article\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`article_blocks_map_embed_order_idx\` ON \`article_blocks_map_embed\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`article_blocks_map_embed_parent_id_idx\` ON \`article_blocks_map_embed\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`article_blocks_map_embed_path_idx\` ON \`article_blocks_map_embed\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`article_blocks_news_list\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`mode\` text DEFAULT 'auto',
  	\`limit\` numeric DEFAULT 6,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`article\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`article_blocks_news_list_order_idx\` ON \`article_blocks_news_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`article_blocks_news_list_parent_id_idx\` ON \`article_blocks_news_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`article_blocks_news_list_path_idx\` ON \`article_blocks_news_list\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`article_blocks_agenda\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`mode\` text DEFAULT 'auto',
  	\`limit\` numeric DEFAULT 6,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`article\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`article_blocks_agenda_order_idx\` ON \`article_blocks_agenda\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`article_blocks_agenda_parent_id_idx\` ON \`article_blocks_agenda\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`article_blocks_agenda_path_idx\` ON \`article_blocks_agenda\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`article_blocks_partners_partners\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`logo_id\` integer,
  	\`url\` text,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`article_blocks_partners\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`article_blocks_partners_partners_order_idx\` ON \`article_blocks_partners_partners\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`article_blocks_partners_partners_parent_id_idx\` ON \`article_blocks_partners_partners\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`article_blocks_partners_partners_logo_idx\` ON \`article_blocks_partners_partners\` (\`logo_id\`);`)
  await db.run(sql`CREATE TABLE \`article_blocks_partners\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`article\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`article_blocks_partners_order_idx\` ON \`article_blocks_partners\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`article_blocks_partners_parent_id_idx\` ON \`article_blocks_partners\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`article_blocks_partners_path_idx\` ON \`article_blocks_partners\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`article_blocks_related_links_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`type\` text DEFAULT 'internal',
  	\`rubrique_id\` integer,
  	\`label\` text,
  	\`url\` text,
  	FOREIGN KEY (\`rubrique_id\`) REFERENCES \`rubriques\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`article_blocks_related_links\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`article_blocks_related_links_links_order_idx\` ON \`article_blocks_related_links_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`article_blocks_related_links_links_parent_id_idx\` ON \`article_blocks_related_links_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`article_blocks_related_links_links_rubrique_idx\` ON \`article_blocks_related_links_links\` (\`rubrique_id\`);`)
  await db.run(sql`CREATE TABLE \`article_blocks_related_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`article\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`article_blocks_related_links_order_idx\` ON \`article_blocks_related_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`article_blocks_related_links_parent_id_idx\` ON \`article_blocks_related_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`article_blocks_related_links_path_idx\` ON \`article_blocks_related_links\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`article_blocks_download_list_files\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`file_id\` integer,
  	\`label\` text,
  	FOREIGN KEY (\`file_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`article_blocks_download_list\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`article_blocks_download_list_files_order_idx\` ON \`article_blocks_download_list_files\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`article_blocks_download_list_files_parent_id_idx\` ON \`article_blocks_download_list_files\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`article_blocks_download_list_files_file_idx\` ON \`article_blocks_download_list_files\` (\`file_id\`);`)
  await db.run(sql`CREATE TABLE \`article_blocks_download_list\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`article\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`article_blocks_download_list_order_idx\` ON \`article_blocks_download_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`article_blocks_download_list_parent_id_idx\` ON \`article_blocks_download_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`article_blocks_download_list_path_idx\` ON \`article_blocks_download_list\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`article_blocks_breadcrumb\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`show_home\` integer DEFAULT true,
  	\`current_label_override\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`article\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`article_blocks_breadcrumb_order_idx\` ON \`article_blocks_breadcrumb\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`article_blocks_breadcrumb_parent_id_idx\` ON \`article_blocks_breadcrumb\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`article_blocks_breadcrumb_path_idx\` ON \`article_blocks_breadcrumb\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`article_steps\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`rich_text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`article\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`article_steps_order_idx\` ON \`article_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`article_steps_parent_id_idx\` ON \`article_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`article_contacts\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`role\` text,
  	\`email\` text,
  	\`phone\` text,
  	\`address\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`article\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`article_contacts_order_idx\` ON \`article_contacts\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`article_contacts_parent_id_idx\` ON \`article_contacts\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`article\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`slug\` text,
  	\`type\` text DEFAULT 'presentation',
  	\`chapo\` text,
  	\`seo_meta_title\` text,
  	\`seo_meta_description\` text,
  	\`seo_og_image_id\` integer,
  	\`_schedule_publish_at\` text,
  	\`_schedule_unpublish_at\` text,
  	\`review_status\` text DEFAULT 'brouillon',
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`article_slug_idx\` ON \`article\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`article_seo_seo_og_image_idx\` ON \`article\` (\`seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`article_review_status_idx\` ON \`article\` (\`review_status\`);`)
  await db.run(sql`CREATE INDEX \`article_updated_at_idx\` ON \`article\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`article_created_at_idx\` ON \`article\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`article__status_idx\` ON \`article\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`article_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`rubriques_id\` integer,
  	\`actualite_id\` integer,
  	\`evenement_id\` integer,
  	\`media_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`article\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`rubriques_id\`) REFERENCES \`rubriques\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`actualite_id\`) REFERENCES \`actualite\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`evenement_id\`) REFERENCES \`evenement\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`article_rels_order_idx\` ON \`article_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`article_rels_parent_idx\` ON \`article_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`article_rels_path_idx\` ON \`article_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`article_rels_rubriques_id_idx\` ON \`article_rels\` (\`rubriques_id\`);`)
  await db.run(sql`CREATE INDEX \`article_rels_actualite_id_idx\` ON \`article_rels\` (\`actualite_id\`);`)
  await db.run(sql`CREATE INDEX \`article_rels_evenement_id_idx\` ON \`article_rels\` (\`evenement_id\`);`)
  await db.run(sql`CREATE INDEX \`article_rels_media_id_idx\` ON \`article_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE \`_article_v_blocks_hero_ctas\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`url\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_article_v_blocks_hero\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_hero_ctas_order_idx\` ON \`_article_v_blocks_hero_ctas\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_hero_ctas_parent_id_idx\` ON \`_article_v_blocks_hero_ctas\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_article_v_blocks_hero\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`subtitle\` text,
  	\`image_id\` integer,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_article_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_hero_order_idx\` ON \`_article_v_blocks_hero\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_hero_parent_id_idx\` ON \`_article_v_blocks_hero\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_hero_path_idx\` ON \`_article_v_blocks_hero\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_hero_image_idx\` ON \`_article_v_blocks_hero\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_article_v_blocks_rich_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`content\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_article_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_rich_text_order_idx\` ON \`_article_v_blocks_rich_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_rich_text_parent_id_idx\` ON \`_article_v_blocks_rich_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_rich_text_path_idx\` ON \`_article_v_blocks_rich_text\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_article_v_blocks_image_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`content\` text,
  	\`image_position\` text DEFAULT 'left',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_article_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_image_text_order_idx\` ON \`_article_v_blocks_image_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_image_text_parent_id_idx\` ON \`_article_v_blocks_image_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_image_text_path_idx\` ON \`_article_v_blocks_image_text\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_image_text_image_idx\` ON \`_article_v_blocks_image_text\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_article_v_blocks_card_grid_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`text\` text,
  	\`image_id\` integer,
  	\`url\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_article_v_blocks_card_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_card_grid_cards_order_idx\` ON \`_article_v_blocks_card_grid_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_card_grid_cards_parent_id_idx\` ON \`_article_v_blocks_card_grid_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_card_grid_cards_image_idx\` ON \`_article_v_blocks_card_grid_cards\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_article_v_blocks_card_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`source\` text DEFAULT 'manual',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_article_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_card_grid_order_idx\` ON \`_article_v_blocks_card_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_card_grid_parent_id_idx\` ON \`_article_v_blocks_card_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_card_grid_path_idx\` ON \`_article_v_blocks_card_grid\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_article_v_blocks_faq_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`question\` text,
  	\`answer\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_article_v_blocks_faq\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_faq_items_order_idx\` ON \`_article_v_blocks_faq_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_faq_items_parent_id_idx\` ON \`_article_v_blocks_faq_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_article_v_blocks_faq\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_article_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_faq_order_idx\` ON \`_article_v_blocks_faq\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_faq_parent_id_idx\` ON \`_article_v_blocks_faq\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_faq_path_idx\` ON \`_article_v_blocks_faq\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_article_v_blocks_cta_form\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`description\` text,
  	\`formulaire_id\` integer,
  	\`display_mode\` text DEFAULT 'inline',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`formulaire_id\`) REFERENCES \`formulaire\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_article_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_cta_form_order_idx\` ON \`_article_v_blocks_cta_form\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_cta_form_parent_id_idx\` ON \`_article_v_blocks_cta_form\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_cta_form_path_idx\` ON \`_article_v_blocks_cta_form\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_cta_form_formulaire_idx\` ON \`_article_v_blocks_cta_form\` (\`formulaire_id\`);`)
  await db.run(sql`CREATE TABLE \`_article_v_blocks_map_embed\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`arcgis_item_url\` text,
  	\`display_mode\` text DEFAULT 'fullscreen-button',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_article_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_map_embed_order_idx\` ON \`_article_v_blocks_map_embed\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_map_embed_parent_id_idx\` ON \`_article_v_blocks_map_embed\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_map_embed_path_idx\` ON \`_article_v_blocks_map_embed\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_article_v_blocks_news_list\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`mode\` text DEFAULT 'auto',
  	\`limit\` numeric DEFAULT 6,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_article_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_news_list_order_idx\` ON \`_article_v_blocks_news_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_news_list_parent_id_idx\` ON \`_article_v_blocks_news_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_news_list_path_idx\` ON \`_article_v_blocks_news_list\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_article_v_blocks_agenda\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`mode\` text DEFAULT 'auto',
  	\`limit\` numeric DEFAULT 6,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_article_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_agenda_order_idx\` ON \`_article_v_blocks_agenda\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_agenda_parent_id_idx\` ON \`_article_v_blocks_agenda\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_agenda_path_idx\` ON \`_article_v_blocks_agenda\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_article_v_blocks_partners_partners\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`logo_id\` integer,
  	\`url\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_article_v_blocks_partners\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_partners_partners_order_idx\` ON \`_article_v_blocks_partners_partners\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_partners_partners_parent_id_idx\` ON \`_article_v_blocks_partners_partners\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_partners_partners_logo_idx\` ON \`_article_v_blocks_partners_partners\` (\`logo_id\`);`)
  await db.run(sql`CREATE TABLE \`_article_v_blocks_partners\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_article_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_partners_order_idx\` ON \`_article_v_blocks_partners\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_partners_parent_id_idx\` ON \`_article_v_blocks_partners\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_partners_path_idx\` ON \`_article_v_blocks_partners\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_article_v_blocks_related_links_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`type\` text DEFAULT 'internal',
  	\`rubrique_id\` integer,
  	\`label\` text,
  	\`url\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`rubrique_id\`) REFERENCES \`rubriques\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_article_v_blocks_related_links\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_related_links_links_order_idx\` ON \`_article_v_blocks_related_links_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_related_links_links_parent_id_idx\` ON \`_article_v_blocks_related_links_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_related_links_links_rubrique_idx\` ON \`_article_v_blocks_related_links_links\` (\`rubrique_id\`);`)
  await db.run(sql`CREATE TABLE \`_article_v_blocks_related_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_article_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_related_links_order_idx\` ON \`_article_v_blocks_related_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_related_links_parent_id_idx\` ON \`_article_v_blocks_related_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_related_links_path_idx\` ON \`_article_v_blocks_related_links\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_article_v_blocks_download_list_files\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`file_id\` integer,
  	\`label\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`file_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_article_v_blocks_download_list\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_download_list_files_order_idx\` ON \`_article_v_blocks_download_list_files\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_download_list_files_parent_id_idx\` ON \`_article_v_blocks_download_list_files\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_download_list_files_file_idx\` ON \`_article_v_blocks_download_list_files\` (\`file_id\`);`)
  await db.run(sql`CREATE TABLE \`_article_v_blocks_download_list\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_article_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_download_list_order_idx\` ON \`_article_v_blocks_download_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_download_list_parent_id_idx\` ON \`_article_v_blocks_download_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_download_list_path_idx\` ON \`_article_v_blocks_download_list\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_article_v_blocks_breadcrumb\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`show_home\` integer DEFAULT true,
  	\`current_label_override\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_article_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_breadcrumb_order_idx\` ON \`_article_v_blocks_breadcrumb\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_breadcrumb_parent_id_idx\` ON \`_article_v_blocks_breadcrumb\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_blocks_breadcrumb_path_idx\` ON \`_article_v_blocks_breadcrumb\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_article_v_version_steps\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`rich_text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_article_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_article_v_version_steps_order_idx\` ON \`_article_v_version_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_version_steps_parent_id_idx\` ON \`_article_v_version_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_article_v_version_contacts\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`role\` text,
  	\`email\` text,
  	\`phone\` text,
  	\`address\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_article_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_article_v_version_contacts_order_idx\` ON \`_article_v_version_contacts\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_version_contacts_parent_id_idx\` ON \`_article_v_version_contacts\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_article_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_title\` text,
  	\`version_slug\` text,
  	\`version_type\` text DEFAULT 'presentation',
  	\`version_chapo\` text,
  	\`version_seo_meta_title\` text,
  	\`version_seo_meta_description\` text,
  	\`version_seo_og_image_id\` integer,
  	\`version__schedule_publish_at\` text,
  	\`version__schedule_unpublish_at\` text,
  	\`version_review_status\` text DEFAULT 'brouillon',
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	\`autosave\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`article\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_article_v_parent_idx\` ON \`_article_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_version_version_slug_idx\` ON \`_article_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_version_seo_version_seo_og_image_idx\` ON \`_article_v\` (\`version_seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_version_version_review_status_idx\` ON \`_article_v\` (\`version_review_status\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_version_version_updated_at_idx\` ON \`_article_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_version_version_created_at_idx\` ON \`_article_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_version_version__status_idx\` ON \`_article_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_created_at_idx\` ON \`_article_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_updated_at_idx\` ON \`_article_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_latest_idx\` ON \`_article_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_autosave_idx\` ON \`_article_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`_article_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`rubriques_id\` integer,
  	\`actualite_id\` integer,
  	\`evenement_id\` integer,
  	\`media_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_article_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`rubriques_id\`) REFERENCES \`rubriques\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`actualite_id\`) REFERENCES \`actualite\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`evenement_id\`) REFERENCES \`evenement\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_article_v_rels_order_idx\` ON \`_article_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_rels_parent_idx\` ON \`_article_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_rels_path_idx\` ON \`_article_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_rels_rubriques_id_idx\` ON \`_article_v_rels\` (\`rubriques_id\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_rels_actualite_id_idx\` ON \`_article_v_rels\` (\`actualite_id\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_rels_evenement_id_idx\` ON \`_article_v_rels\` (\`evenement_id\`);`)
  await db.run(sql`CREATE INDEX \`_article_v_rels_media_id_idx\` ON \`_article_v_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE \`actualite_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`actualite\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`actualite_gallery_order_idx\` ON \`actualite_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`actualite_gallery_parent_id_idx\` ON \`actualite_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`actualite_gallery_image_idx\` ON \`actualite_gallery\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`actualite\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`slug\` text,
  	\`tag\` text,
  	\`date\` text,
  	\`image_id\` integer,
  	\`chapo\` text,
  	\`body\` text,
  	\`featured\` integer DEFAULT false,
  	\`seo_meta_title\` text,
  	\`seo_meta_description\` text,
  	\`seo_og_image_id\` integer,
  	\`_schedule_publish_at\` text,
  	\`_schedule_unpublish_at\` text,
  	\`review_status\` text DEFAULT 'brouillon',
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`actualite_slug_idx\` ON \`actualite\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`actualite_tag_idx\` ON \`actualite\` (\`tag\`);`)
  await db.run(sql`CREATE INDEX \`actualite_date_idx\` ON \`actualite\` (\`date\`);`)
  await db.run(sql`CREATE INDEX \`actualite_image_idx\` ON \`actualite\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`actualite_featured_idx\` ON \`actualite\` (\`featured\`);`)
  await db.run(sql`CREATE INDEX \`actualite_seo_seo_og_image_idx\` ON \`actualite\` (\`seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`actualite_review_status_idx\` ON \`actualite\` (\`review_status\`);`)
  await db.run(sql`CREATE INDEX \`actualite_updated_at_idx\` ON \`actualite\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`actualite_created_at_idx\` ON \`actualite\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`actualite__status_idx\` ON \`actualite\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`actualite_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`rubriques_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`actualite\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`rubriques_id\`) REFERENCES \`rubriques\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`actualite_rels_order_idx\` ON \`actualite_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`actualite_rels_parent_idx\` ON \`actualite_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`actualite_rels_path_idx\` ON \`actualite_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`actualite_rels_rubriques_id_idx\` ON \`actualite_rels\` (\`rubriques_id\`);`)
  await db.run(sql`CREATE TABLE \`_actualite_v_version_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`caption\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_actualite_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_actualite_v_version_gallery_order_idx\` ON \`_actualite_v_version_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_actualite_v_version_gallery_parent_id_idx\` ON \`_actualite_v_version_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_actualite_v_version_gallery_image_idx\` ON \`_actualite_v_version_gallery\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_actualite_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_title\` text,
  	\`version_slug\` text,
  	\`version_tag\` text,
  	\`version_date\` text,
  	\`version_image_id\` integer,
  	\`version_chapo\` text,
  	\`version_body\` text,
  	\`version_featured\` integer DEFAULT false,
  	\`version_seo_meta_title\` text,
  	\`version_seo_meta_description\` text,
  	\`version_seo_og_image_id\` integer,
  	\`version__schedule_publish_at\` text,
  	\`version__schedule_unpublish_at\` text,
  	\`version_review_status\` text DEFAULT 'brouillon',
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	\`autosave\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`actualite\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_actualite_v_parent_idx\` ON \`_actualite_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_actualite_v_version_version_slug_idx\` ON \`_actualite_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_actualite_v_version_version_tag_idx\` ON \`_actualite_v\` (\`version_tag\`);`)
  await db.run(sql`CREATE INDEX \`_actualite_v_version_version_date_idx\` ON \`_actualite_v\` (\`version_date\`);`)
  await db.run(sql`CREATE INDEX \`_actualite_v_version_version_image_idx\` ON \`_actualite_v\` (\`version_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_actualite_v_version_version_featured_idx\` ON \`_actualite_v\` (\`version_featured\`);`)
  await db.run(sql`CREATE INDEX \`_actualite_v_version_seo_version_seo_og_image_idx\` ON \`_actualite_v\` (\`version_seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_actualite_v_version_version_review_status_idx\` ON \`_actualite_v\` (\`version_review_status\`);`)
  await db.run(sql`CREATE INDEX \`_actualite_v_version_version_updated_at_idx\` ON \`_actualite_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_actualite_v_version_version_created_at_idx\` ON \`_actualite_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_actualite_v_version_version__status_idx\` ON \`_actualite_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_actualite_v_created_at_idx\` ON \`_actualite_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_actualite_v_updated_at_idx\` ON \`_actualite_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_actualite_v_latest_idx\` ON \`_actualite_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_actualite_v_autosave_idx\` ON \`_actualite_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`_actualite_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`rubriques_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_actualite_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`rubriques_id\`) REFERENCES \`rubriques\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_actualite_v_rels_order_idx\` ON \`_actualite_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_actualite_v_rels_parent_idx\` ON \`_actualite_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_actualite_v_rels_path_idx\` ON \`_actualite_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_actualite_v_rels_rubriques_id_idx\` ON \`_actualite_v_rels\` (\`rubriques_id\`);`)
  await db.run(sql`CREATE TABLE \`evenement_blocks_event_rich_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`content\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`evenement\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`evenement_blocks_event_rich_text_order_idx\` ON \`evenement_blocks_event_rich_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`evenement_blocks_event_rich_text_parent_id_idx\` ON \`evenement_blocks_event_rich_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`evenement_blocks_event_rich_text_path_idx\` ON \`evenement_blocks_event_rich_text\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`evenement_blocks_event_programme_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`time\` text,
  	\`label\` text,
  	\`speaker\` text,
  	\`place\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`evenement_blocks_event_programme\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`evenement_blocks_event_programme_items_order_idx\` ON \`evenement_blocks_event_programme_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`evenement_blocks_event_programme_items_parent_id_idx\` ON \`evenement_blocks_event_programme_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`evenement_blocks_event_programme\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`evenement\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`evenement_blocks_event_programme_order_idx\` ON \`evenement_blocks_event_programme\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`evenement_blocks_event_programme_parent_id_idx\` ON \`evenement_blocks_event_programme\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`evenement_blocks_event_programme_path_idx\` ON \`evenement_blocks_event_programme\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`evenement_blocks_event_pratical_info_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon\` text DEFAULT 'info',
  	\`label\` text,
  	\`value\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`evenement_blocks_event_pratical_info\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`evenement_blocks_event_pratical_info_items_order_idx\` ON \`evenement_blocks_event_pratical_info_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`evenement_blocks_event_pratical_info_items_parent_id_idx\` ON \`evenement_blocks_event_pratical_info_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`evenement_blocks_event_pratical_info\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`evenement\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`evenement_blocks_event_pratical_info_order_idx\` ON \`evenement_blocks_event_pratical_info\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`evenement_blocks_event_pratical_info_parent_id_idx\` ON \`evenement_blocks_event_pratical_info\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`evenement_blocks_event_pratical_info_path_idx\` ON \`evenement_blocks_event_pratical_info\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`evenement_blocks_event_media_images\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`caption\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`evenement_blocks_event_media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`evenement_blocks_event_media_images_order_idx\` ON \`evenement_blocks_event_media_images\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`evenement_blocks_event_media_images_parent_id_idx\` ON \`evenement_blocks_event_media_images\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`evenement_blocks_event_media_images_image_idx\` ON \`evenement_blocks_event_media_images\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`evenement_blocks_event_media\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`layout\` text DEFAULT 'single',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`evenement\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`evenement_blocks_event_media_order_idx\` ON \`evenement_blocks_event_media\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`evenement_blocks_event_media_parent_id_idx\` ON \`evenement_blocks_event_media\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`evenement_blocks_event_media_path_idx\` ON \`evenement_blocks_event_media\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`evenement_blocks_event_map\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`source\` text DEFAULT 'fromEvent',
  	\`lat\` numeric,
  	\`lng\` numeric,
  	\`zoom\` numeric DEFAULT 15,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`evenement\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`evenement_blocks_event_map_order_idx\` ON \`evenement_blocks_event_map\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`evenement_blocks_event_map_parent_id_idx\` ON \`evenement_blocks_event_map\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`evenement_blocks_event_map_path_idx\` ON \`evenement_blocks_event_map\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`evenement_blocks_event_documents_files\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`file_id\` integer,
  	\`label\` text,
  	\`doc_type\` text DEFAULT 'autre',
  	FOREIGN KEY (\`file_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`evenement_blocks_event_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`evenement_blocks_event_documents_files_order_idx\` ON \`evenement_blocks_event_documents_files\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`evenement_blocks_event_documents_files_parent_id_idx\` ON \`evenement_blocks_event_documents_files\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`evenement_blocks_event_documents_files_file_idx\` ON \`evenement_blocks_event_documents_files\` (\`file_id\`);`)
  await db.run(sql`CREATE TABLE \`evenement_blocks_event_documents\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`evenement\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`evenement_blocks_event_documents_order_idx\` ON \`evenement_blocks_event_documents\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`evenement_blocks_event_documents_parent_id_idx\` ON \`evenement_blocks_event_documents\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`evenement_blocks_event_documents_path_idx\` ON \`evenement_blocks_event_documents\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`evenement_blocks_event_cta\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`text\` text,
  	\`mode\` text DEFAULT 'inscription',
  	\`url\` text,
  	\`button_label\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`evenement\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`evenement_blocks_event_cta_order_idx\` ON \`evenement_blocks_event_cta\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`evenement_blocks_event_cta_parent_id_idx\` ON \`evenement_blocks_event_cta\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`evenement_blocks_event_cta_path_idx\` ON \`evenement_blocks_event_cta\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`evenement_blocks_event_related\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`mode\` text DEFAULT 'auto',
  	\`limit\` numeric DEFAULT 3,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`evenement\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`evenement_blocks_event_related_order_idx\` ON \`evenement_blocks_event_related\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`evenement_blocks_event_related_parent_id_idx\` ON \`evenement_blocks_event_related\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`evenement_blocks_event_related_path_idx\` ON \`evenement_blocks_event_related\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`evenement\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`slug\` text,
  	\`start_date\` text,
  	\`end_date\` text,
  	\`all_day\` integer DEFAULT false,
  	\`location\` text,
  	\`location_address\` text,
  	\`image_id\` integer,
  	\`excerpt\` text,
  	\`geo\` text,
  	\`category\` text,
  	\`status\` text DEFAULT 'a-venir',
  	\`registration_url\` text,
  	\`seo_meta_title\` text,
  	\`seo_meta_description\` text,
  	\`seo_og_image_id\` integer,
  	\`_schedule_publish_at\` text,
  	\`_schedule_unpublish_at\` text,
  	\`review_status\` text DEFAULT 'brouillon',
  	\`featured\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`evenement_slug_idx\` ON \`evenement\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`evenement_image_idx\` ON \`evenement\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`evenement_category_idx\` ON \`evenement\` (\`category\`);`)
  await db.run(sql`CREATE INDEX \`evenement_seo_seo_og_image_idx\` ON \`evenement\` (\`seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`evenement_review_status_idx\` ON \`evenement\` (\`review_status\`);`)
  await db.run(sql`CREATE INDEX \`evenement_featured_idx\` ON \`evenement\` (\`featured\`);`)
  await db.run(sql`CREATE INDEX \`evenement_updated_at_idx\` ON \`evenement\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`evenement_created_at_idx\` ON \`evenement\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`evenement__status_idx\` ON \`evenement\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`evenement_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`evenement_id\` integer,
  	\`rubriques_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`evenement\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`evenement_id\`) REFERENCES \`evenement\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`rubriques_id\`) REFERENCES \`rubriques\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`evenement_rels_order_idx\` ON \`evenement_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`evenement_rels_parent_idx\` ON \`evenement_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`evenement_rels_path_idx\` ON \`evenement_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`evenement_rels_evenement_id_idx\` ON \`evenement_rels\` (\`evenement_id\`);`)
  await db.run(sql`CREATE INDEX \`evenement_rels_rubriques_id_idx\` ON \`evenement_rels\` (\`rubriques_id\`);`)
  await db.run(sql`CREATE TABLE \`_evenement_v_blocks_event_rich_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`content\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_evenement_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_evenement_v_blocks_event_rich_text_order_idx\` ON \`_evenement_v_blocks_event_rich_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_evenement_v_blocks_event_rich_text_parent_id_idx\` ON \`_evenement_v_blocks_event_rich_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_evenement_v_blocks_event_rich_text_path_idx\` ON \`_evenement_v_blocks_event_rich_text\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_evenement_v_blocks_event_programme_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`time\` text,
  	\`label\` text,
  	\`speaker\` text,
  	\`place\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_evenement_v_blocks_event_programme\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_evenement_v_blocks_event_programme_items_order_idx\` ON \`_evenement_v_blocks_event_programme_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_evenement_v_blocks_event_programme_items_parent_id_idx\` ON \`_evenement_v_blocks_event_programme_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_evenement_v_blocks_event_programme\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_evenement_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_evenement_v_blocks_event_programme_order_idx\` ON \`_evenement_v_blocks_event_programme\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_evenement_v_blocks_event_programme_parent_id_idx\` ON \`_evenement_v_blocks_event_programme\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_evenement_v_blocks_event_programme_path_idx\` ON \`_evenement_v_blocks_event_programme\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_evenement_v_blocks_event_pratical_info_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`icon\` text DEFAULT 'info',
  	\`label\` text,
  	\`value\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_evenement_v_blocks_event_pratical_info\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_evenement_v_blocks_event_pratical_info_items_order_idx\` ON \`_evenement_v_blocks_event_pratical_info_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_evenement_v_blocks_event_pratical_info_items_parent_id_idx\` ON \`_evenement_v_blocks_event_pratical_info_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_evenement_v_blocks_event_pratical_info\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_evenement_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_evenement_v_blocks_event_pratical_info_order_idx\` ON \`_evenement_v_blocks_event_pratical_info\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_evenement_v_blocks_event_pratical_info_parent_id_idx\` ON \`_evenement_v_blocks_event_pratical_info\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_evenement_v_blocks_event_pratical_info_path_idx\` ON \`_evenement_v_blocks_event_pratical_info\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_evenement_v_blocks_event_media_images\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`caption\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_evenement_v_blocks_event_media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_evenement_v_blocks_event_media_images_order_idx\` ON \`_evenement_v_blocks_event_media_images\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_evenement_v_blocks_event_media_images_parent_id_idx\` ON \`_evenement_v_blocks_event_media_images\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_evenement_v_blocks_event_media_images_image_idx\` ON \`_evenement_v_blocks_event_media_images\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_evenement_v_blocks_event_media\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`layout\` text DEFAULT 'single',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_evenement_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_evenement_v_blocks_event_media_order_idx\` ON \`_evenement_v_blocks_event_media\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_evenement_v_blocks_event_media_parent_id_idx\` ON \`_evenement_v_blocks_event_media\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_evenement_v_blocks_event_media_path_idx\` ON \`_evenement_v_blocks_event_media\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_evenement_v_blocks_event_map\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`source\` text DEFAULT 'fromEvent',
  	\`lat\` numeric,
  	\`lng\` numeric,
  	\`zoom\` numeric DEFAULT 15,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_evenement_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_evenement_v_blocks_event_map_order_idx\` ON \`_evenement_v_blocks_event_map\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_evenement_v_blocks_event_map_parent_id_idx\` ON \`_evenement_v_blocks_event_map\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_evenement_v_blocks_event_map_path_idx\` ON \`_evenement_v_blocks_event_map\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_evenement_v_blocks_event_documents_files\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`file_id\` integer,
  	\`label\` text,
  	\`doc_type\` text DEFAULT 'autre',
  	\`_uuid\` text,
  	FOREIGN KEY (\`file_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_evenement_v_blocks_event_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_evenement_v_blocks_event_documents_files_order_idx\` ON \`_evenement_v_blocks_event_documents_files\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_evenement_v_blocks_event_documents_files_parent_id_idx\` ON \`_evenement_v_blocks_event_documents_files\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_evenement_v_blocks_event_documents_files_file_idx\` ON \`_evenement_v_blocks_event_documents_files\` (\`file_id\`);`)
  await db.run(sql`CREATE TABLE \`_evenement_v_blocks_event_documents\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_evenement_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_evenement_v_blocks_event_documents_order_idx\` ON \`_evenement_v_blocks_event_documents\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_evenement_v_blocks_event_documents_parent_id_idx\` ON \`_evenement_v_blocks_event_documents\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_evenement_v_blocks_event_documents_path_idx\` ON \`_evenement_v_blocks_event_documents\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_evenement_v_blocks_event_cta\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`text\` text,
  	\`mode\` text DEFAULT 'inscription',
  	\`url\` text,
  	\`button_label\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_evenement_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_evenement_v_blocks_event_cta_order_idx\` ON \`_evenement_v_blocks_event_cta\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_evenement_v_blocks_event_cta_parent_id_idx\` ON \`_evenement_v_blocks_event_cta\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_evenement_v_blocks_event_cta_path_idx\` ON \`_evenement_v_blocks_event_cta\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_evenement_v_blocks_event_related\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`mode\` text DEFAULT 'auto',
  	\`limit\` numeric DEFAULT 3,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_evenement_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_evenement_v_blocks_event_related_order_idx\` ON \`_evenement_v_blocks_event_related\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_evenement_v_blocks_event_related_parent_id_idx\` ON \`_evenement_v_blocks_event_related\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_evenement_v_blocks_event_related_path_idx\` ON \`_evenement_v_blocks_event_related\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_evenement_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_title\` text,
  	\`version_slug\` text,
  	\`version_start_date\` text,
  	\`version_end_date\` text,
  	\`version_all_day\` integer DEFAULT false,
  	\`version_location\` text,
  	\`version_location_address\` text,
  	\`version_image_id\` integer,
  	\`version_excerpt\` text,
  	\`version_geo\` text,
  	\`version_category\` text,
  	\`version_status\` text DEFAULT 'a-venir',
  	\`version_registration_url\` text,
  	\`version_seo_meta_title\` text,
  	\`version_seo_meta_description\` text,
  	\`version_seo_og_image_id\` integer,
  	\`version__schedule_publish_at\` text,
  	\`version__schedule_unpublish_at\` text,
  	\`version_review_status\` text DEFAULT 'brouillon',
  	\`version_featured\` integer DEFAULT false,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	\`autosave\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`evenement\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_evenement_v_parent_idx\` ON \`_evenement_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_evenement_v_version_version_slug_idx\` ON \`_evenement_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_evenement_v_version_version_image_idx\` ON \`_evenement_v\` (\`version_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_evenement_v_version_version_category_idx\` ON \`_evenement_v\` (\`version_category\`);`)
  await db.run(sql`CREATE INDEX \`_evenement_v_version_seo_version_seo_og_image_idx\` ON \`_evenement_v\` (\`version_seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_evenement_v_version_version_review_status_idx\` ON \`_evenement_v\` (\`version_review_status\`);`)
  await db.run(sql`CREATE INDEX \`_evenement_v_version_version_featured_idx\` ON \`_evenement_v\` (\`version_featured\`);`)
  await db.run(sql`CREATE INDEX \`_evenement_v_version_version_updated_at_idx\` ON \`_evenement_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_evenement_v_version_version_created_at_idx\` ON \`_evenement_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_evenement_v_version_version__status_idx\` ON \`_evenement_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_evenement_v_created_at_idx\` ON \`_evenement_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_evenement_v_updated_at_idx\` ON \`_evenement_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_evenement_v_latest_idx\` ON \`_evenement_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_evenement_v_autosave_idx\` ON \`_evenement_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`_evenement_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`evenement_id\` integer,
  	\`rubriques_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_evenement_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`evenement_id\`) REFERENCES \`evenement\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`rubriques_id\`) REFERENCES \`rubriques\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_evenement_v_rels_order_idx\` ON \`_evenement_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_evenement_v_rels_parent_idx\` ON \`_evenement_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_evenement_v_rels_path_idx\` ON \`_evenement_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_evenement_v_rels_evenement_id_idx\` ON \`_evenement_v_rels\` (\`evenement_id\`);`)
  await db.run(sql`CREATE INDEX \`_evenement_v_rels_rubriques_id_idx\` ON \`_evenement_v_rels\` (\`rubriques_id\`);`)
  await db.run(sql`CREATE TABLE \`breve\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`slug\` text,
  	\`date\` text,
  	\`body\` text,
  	\`source_url\` text,
  	\`seo_meta_title\` text,
  	\`seo_meta_description\` text,
  	\`seo_og_image_id\` integer,
  	\`_schedule_publish_at\` text,
  	\`_schedule_unpublish_at\` text,
  	\`review_status\` text DEFAULT 'brouillon',
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`breve_slug_idx\` ON \`breve\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`breve_seo_seo_og_image_idx\` ON \`breve\` (\`seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`breve_review_status_idx\` ON \`breve\` (\`review_status\`);`)
  await db.run(sql`CREATE INDEX \`breve_updated_at_idx\` ON \`breve\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`breve_created_at_idx\` ON \`breve\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`breve__status_idx\` ON \`breve\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`breve_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`rubriques_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`breve\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`rubriques_id\`) REFERENCES \`rubriques\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`breve_rels_order_idx\` ON \`breve_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`breve_rels_parent_idx\` ON \`breve_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`breve_rels_path_idx\` ON \`breve_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`breve_rels_rubriques_id_idx\` ON \`breve_rels\` (\`rubriques_id\`);`)
  await db.run(sql`CREATE TABLE \`_breve_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_title\` text,
  	\`version_slug\` text,
  	\`version_date\` text,
  	\`version_body\` text,
  	\`version_source_url\` text,
  	\`version_seo_meta_title\` text,
  	\`version_seo_meta_description\` text,
  	\`version_seo_og_image_id\` integer,
  	\`version__schedule_publish_at\` text,
  	\`version__schedule_unpublish_at\` text,
  	\`version_review_status\` text DEFAULT 'brouillon',
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	\`autosave\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`breve\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_breve_v_parent_idx\` ON \`_breve_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_breve_v_version_version_slug_idx\` ON \`_breve_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_breve_v_version_seo_version_seo_og_image_idx\` ON \`_breve_v\` (\`version_seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_breve_v_version_version_review_status_idx\` ON \`_breve_v\` (\`version_review_status\`);`)
  await db.run(sql`CREATE INDEX \`_breve_v_version_version_updated_at_idx\` ON \`_breve_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_breve_v_version_version_created_at_idx\` ON \`_breve_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_breve_v_version_version__status_idx\` ON \`_breve_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_breve_v_created_at_idx\` ON \`_breve_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_breve_v_updated_at_idx\` ON \`_breve_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_breve_v_latest_idx\` ON \`_breve_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_breve_v_autosave_idx\` ON \`_breve_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`_breve_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`rubriques_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_breve_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`rubriques_id\`) REFERENCES \`rubriques\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_breve_v_rels_order_idx\` ON \`_breve_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_breve_v_rels_parent_idx\` ON \`_breve_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_breve_v_rels_path_idx\` ON \`_breve_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_breve_v_rels_rubriques_id_idx\` ON \`_breve_v_rels\` (\`rubriques_id\`);`)
  await db.run(sql`CREATE TABLE \`page_blocks_hero_ctas\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`url\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`page_blocks_hero\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`page_blocks_hero_ctas_order_idx\` ON \`page_blocks_hero_ctas\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`page_blocks_hero_ctas_parent_id_idx\` ON \`page_blocks_hero_ctas\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`page_blocks_hero\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`subtitle\` text,
  	\`image_id\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`page_blocks_hero_order_idx\` ON \`page_blocks_hero\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`page_blocks_hero_parent_id_idx\` ON \`page_blocks_hero\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`page_blocks_hero_path_idx\` ON \`page_blocks_hero\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`page_blocks_hero_image_idx\` ON \`page_blocks_hero\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`page_blocks_rich_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`content\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`page_blocks_rich_text_order_idx\` ON \`page_blocks_rich_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`page_blocks_rich_text_parent_id_idx\` ON \`page_blocks_rich_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`page_blocks_rich_text_path_idx\` ON \`page_blocks_rich_text\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`page_blocks_image_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`content\` text,
  	\`image_position\` text DEFAULT 'left',
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`page_blocks_image_text_order_idx\` ON \`page_blocks_image_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`page_blocks_image_text_parent_id_idx\` ON \`page_blocks_image_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`page_blocks_image_text_path_idx\` ON \`page_blocks_image_text\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`page_blocks_image_text_image_idx\` ON \`page_blocks_image_text\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`page_blocks_card_grid_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`text\` text,
  	\`image_id\` integer,
  	\`url\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`page_blocks_card_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`page_blocks_card_grid_cards_order_idx\` ON \`page_blocks_card_grid_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`page_blocks_card_grid_cards_parent_id_idx\` ON \`page_blocks_card_grid_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`page_blocks_card_grid_cards_image_idx\` ON \`page_blocks_card_grid_cards\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`page_blocks_card_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`source\` text DEFAULT 'manual',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`page_blocks_card_grid_order_idx\` ON \`page_blocks_card_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`page_blocks_card_grid_parent_id_idx\` ON \`page_blocks_card_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`page_blocks_card_grid_path_idx\` ON \`page_blocks_card_grid\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`page_blocks_faq_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`question\` text,
  	\`answer\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`page_blocks_faq\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`page_blocks_faq_items_order_idx\` ON \`page_blocks_faq_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`page_blocks_faq_items_parent_id_idx\` ON \`page_blocks_faq_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`page_blocks_faq\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`page_blocks_faq_order_idx\` ON \`page_blocks_faq\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`page_blocks_faq_parent_id_idx\` ON \`page_blocks_faq\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`page_blocks_faq_path_idx\` ON \`page_blocks_faq\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`page_blocks_cta_form\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`description\` text,
  	\`formulaire_id\` integer,
  	\`display_mode\` text DEFAULT 'inline',
  	\`block_name\` text,
  	FOREIGN KEY (\`formulaire_id\`) REFERENCES \`formulaire\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`page_blocks_cta_form_order_idx\` ON \`page_blocks_cta_form\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`page_blocks_cta_form_parent_id_idx\` ON \`page_blocks_cta_form\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`page_blocks_cta_form_path_idx\` ON \`page_blocks_cta_form\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`page_blocks_cta_form_formulaire_idx\` ON \`page_blocks_cta_form\` (\`formulaire_id\`);`)
  await db.run(sql`CREATE TABLE \`page_blocks_map_embed\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`arcgis_item_url\` text,
  	\`display_mode\` text DEFAULT 'fullscreen-button',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`page_blocks_map_embed_order_idx\` ON \`page_blocks_map_embed\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`page_blocks_map_embed_parent_id_idx\` ON \`page_blocks_map_embed\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`page_blocks_map_embed_path_idx\` ON \`page_blocks_map_embed\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`page_blocks_news_list\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`mode\` text DEFAULT 'auto',
  	\`limit\` numeric DEFAULT 6,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`page_blocks_news_list_order_idx\` ON \`page_blocks_news_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`page_blocks_news_list_parent_id_idx\` ON \`page_blocks_news_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`page_blocks_news_list_path_idx\` ON \`page_blocks_news_list\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`page_blocks_agenda\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`mode\` text DEFAULT 'auto',
  	\`limit\` numeric DEFAULT 6,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`page_blocks_agenda_order_idx\` ON \`page_blocks_agenda\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`page_blocks_agenda_parent_id_idx\` ON \`page_blocks_agenda\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`page_blocks_agenda_path_idx\` ON \`page_blocks_agenda\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`page_blocks_partners_partners\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`logo_id\` integer,
  	\`url\` text,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`page_blocks_partners\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`page_blocks_partners_partners_order_idx\` ON \`page_blocks_partners_partners\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`page_blocks_partners_partners_parent_id_idx\` ON \`page_blocks_partners_partners\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`page_blocks_partners_partners_logo_idx\` ON \`page_blocks_partners_partners\` (\`logo_id\`);`)
  await db.run(sql`CREATE TABLE \`page_blocks_partners\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`page_blocks_partners_order_idx\` ON \`page_blocks_partners\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`page_blocks_partners_parent_id_idx\` ON \`page_blocks_partners\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`page_blocks_partners_path_idx\` ON \`page_blocks_partners\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`page_blocks_related_links_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`type\` text DEFAULT 'internal',
  	\`rubrique_id\` integer,
  	\`label\` text,
  	\`url\` text,
  	FOREIGN KEY (\`rubrique_id\`) REFERENCES \`rubriques\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`page_blocks_related_links\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`page_blocks_related_links_links_order_idx\` ON \`page_blocks_related_links_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`page_blocks_related_links_links_parent_id_idx\` ON \`page_blocks_related_links_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`page_blocks_related_links_links_rubrique_idx\` ON \`page_blocks_related_links_links\` (\`rubrique_id\`);`)
  await db.run(sql`CREATE TABLE \`page_blocks_related_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`page_blocks_related_links_order_idx\` ON \`page_blocks_related_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`page_blocks_related_links_parent_id_idx\` ON \`page_blocks_related_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`page_blocks_related_links_path_idx\` ON \`page_blocks_related_links\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`page_blocks_download_list_files\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`file_id\` integer,
  	\`label\` text,
  	FOREIGN KEY (\`file_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`page_blocks_download_list\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`page_blocks_download_list_files_order_idx\` ON \`page_blocks_download_list_files\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`page_blocks_download_list_files_parent_id_idx\` ON \`page_blocks_download_list_files\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`page_blocks_download_list_files_file_idx\` ON \`page_blocks_download_list_files\` (\`file_id\`);`)
  await db.run(sql`CREATE TABLE \`page_blocks_download_list\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`page_blocks_download_list_order_idx\` ON \`page_blocks_download_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`page_blocks_download_list_parent_id_idx\` ON \`page_blocks_download_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`page_blocks_download_list_path_idx\` ON \`page_blocks_download_list\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`page_blocks_breadcrumb\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`show_home\` integer DEFAULT true,
  	\`current_label_override\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`page_blocks_breadcrumb_order_idx\` ON \`page_blocks_breadcrumb\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`page_blocks_breadcrumb_parent_id_idx\` ON \`page_blocks_breadcrumb\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`page_blocks_breadcrumb_path_idx\` ON \`page_blocks_breadcrumb\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`slug\` text,
  	\`seo_meta_title\` text,
  	\`seo_meta_description\` text,
  	\`seo_og_image_id\` integer,
  	\`_schedule_publish_at\` text,
  	\`_schedule_unpublish_at\` text,
  	\`review_status\` text DEFAULT 'brouillon',
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`page_slug_idx\` ON \`page\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`page_seo_seo_og_image_idx\` ON \`page\` (\`seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`page_review_status_idx\` ON \`page\` (\`review_status\`);`)
  await db.run(sql`CREATE INDEX \`page_updated_at_idx\` ON \`page\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`page_created_at_idx\` ON \`page\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`page__status_idx\` ON \`page\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`page_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`rubriques_id\` integer,
  	\`actualite_id\` integer,
  	\`evenement_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`page\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`rubriques_id\`) REFERENCES \`rubriques\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`actualite_id\`) REFERENCES \`actualite\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`evenement_id\`) REFERENCES \`evenement\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`page_rels_order_idx\` ON \`page_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`page_rels_parent_idx\` ON \`page_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`page_rels_path_idx\` ON \`page_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`page_rels_rubriques_id_idx\` ON \`page_rels\` (\`rubriques_id\`);`)
  await db.run(sql`CREATE INDEX \`page_rels_actualite_id_idx\` ON \`page_rels\` (\`actualite_id\`);`)
  await db.run(sql`CREATE INDEX \`page_rels_evenement_id_idx\` ON \`page_rels\` (\`evenement_id\`);`)
  await db.run(sql`CREATE TABLE \`_page_v_blocks_hero_ctas\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`url\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_page_v_blocks_hero\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_hero_ctas_order_idx\` ON \`_page_v_blocks_hero_ctas\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_hero_ctas_parent_id_idx\` ON \`_page_v_blocks_hero_ctas\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_page_v_blocks_hero\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`subtitle\` text,
  	\`image_id\` integer,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_hero_order_idx\` ON \`_page_v_blocks_hero\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_hero_parent_id_idx\` ON \`_page_v_blocks_hero\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_hero_path_idx\` ON \`_page_v_blocks_hero\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_hero_image_idx\` ON \`_page_v_blocks_hero\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_page_v_blocks_rich_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`content\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_rich_text_order_idx\` ON \`_page_v_blocks_rich_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_rich_text_parent_id_idx\` ON \`_page_v_blocks_rich_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_rich_text_path_idx\` ON \`_page_v_blocks_rich_text\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_page_v_blocks_image_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`content\` text,
  	\`image_position\` text DEFAULT 'left',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_image_text_order_idx\` ON \`_page_v_blocks_image_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_image_text_parent_id_idx\` ON \`_page_v_blocks_image_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_image_text_path_idx\` ON \`_page_v_blocks_image_text\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_image_text_image_idx\` ON \`_page_v_blocks_image_text\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_page_v_blocks_card_grid_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`text\` text,
  	\`image_id\` integer,
  	\`url\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_page_v_blocks_card_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_card_grid_cards_order_idx\` ON \`_page_v_blocks_card_grid_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_card_grid_cards_parent_id_idx\` ON \`_page_v_blocks_card_grid_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_card_grid_cards_image_idx\` ON \`_page_v_blocks_card_grid_cards\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_page_v_blocks_card_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`source\` text DEFAULT 'manual',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_card_grid_order_idx\` ON \`_page_v_blocks_card_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_card_grid_parent_id_idx\` ON \`_page_v_blocks_card_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_card_grid_path_idx\` ON \`_page_v_blocks_card_grid\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_page_v_blocks_faq_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`question\` text,
  	\`answer\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_page_v_blocks_faq\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_faq_items_order_idx\` ON \`_page_v_blocks_faq_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_faq_items_parent_id_idx\` ON \`_page_v_blocks_faq_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_page_v_blocks_faq\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_faq_order_idx\` ON \`_page_v_blocks_faq\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_faq_parent_id_idx\` ON \`_page_v_blocks_faq\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_faq_path_idx\` ON \`_page_v_blocks_faq\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_page_v_blocks_cta_form\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`description\` text,
  	\`formulaire_id\` integer,
  	\`display_mode\` text DEFAULT 'inline',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`formulaire_id\`) REFERENCES \`formulaire\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_cta_form_order_idx\` ON \`_page_v_blocks_cta_form\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_cta_form_parent_id_idx\` ON \`_page_v_blocks_cta_form\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_cta_form_path_idx\` ON \`_page_v_blocks_cta_form\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_cta_form_formulaire_idx\` ON \`_page_v_blocks_cta_form\` (\`formulaire_id\`);`)
  await db.run(sql`CREATE TABLE \`_page_v_blocks_map_embed\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`arcgis_item_url\` text,
  	\`display_mode\` text DEFAULT 'fullscreen-button',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_map_embed_order_idx\` ON \`_page_v_blocks_map_embed\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_map_embed_parent_id_idx\` ON \`_page_v_blocks_map_embed\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_map_embed_path_idx\` ON \`_page_v_blocks_map_embed\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_page_v_blocks_news_list\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`mode\` text DEFAULT 'auto',
  	\`limit\` numeric DEFAULT 6,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_news_list_order_idx\` ON \`_page_v_blocks_news_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_news_list_parent_id_idx\` ON \`_page_v_blocks_news_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_news_list_path_idx\` ON \`_page_v_blocks_news_list\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_page_v_blocks_agenda\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`mode\` text DEFAULT 'auto',
  	\`limit\` numeric DEFAULT 6,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_agenda_order_idx\` ON \`_page_v_blocks_agenda\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_agenda_parent_id_idx\` ON \`_page_v_blocks_agenda\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_agenda_path_idx\` ON \`_page_v_blocks_agenda\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_page_v_blocks_partners_partners\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`logo_id\` integer,
  	\`url\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_page_v_blocks_partners\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_partners_partners_order_idx\` ON \`_page_v_blocks_partners_partners\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_partners_partners_parent_id_idx\` ON \`_page_v_blocks_partners_partners\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_partners_partners_logo_idx\` ON \`_page_v_blocks_partners_partners\` (\`logo_id\`);`)
  await db.run(sql`CREATE TABLE \`_page_v_blocks_partners\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_partners_order_idx\` ON \`_page_v_blocks_partners\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_partners_parent_id_idx\` ON \`_page_v_blocks_partners\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_partners_path_idx\` ON \`_page_v_blocks_partners\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_page_v_blocks_related_links_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`type\` text DEFAULT 'internal',
  	\`rubrique_id\` integer,
  	\`label\` text,
  	\`url\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`rubrique_id\`) REFERENCES \`rubriques\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_page_v_blocks_related_links\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_related_links_links_order_idx\` ON \`_page_v_blocks_related_links_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_related_links_links_parent_id_idx\` ON \`_page_v_blocks_related_links_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_related_links_links_rubrique_idx\` ON \`_page_v_blocks_related_links_links\` (\`rubrique_id\`);`)
  await db.run(sql`CREATE TABLE \`_page_v_blocks_related_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_related_links_order_idx\` ON \`_page_v_blocks_related_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_related_links_parent_id_idx\` ON \`_page_v_blocks_related_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_related_links_path_idx\` ON \`_page_v_blocks_related_links\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_page_v_blocks_download_list_files\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`file_id\` integer,
  	\`label\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`file_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_page_v_blocks_download_list\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_download_list_files_order_idx\` ON \`_page_v_blocks_download_list_files\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_download_list_files_parent_id_idx\` ON \`_page_v_blocks_download_list_files\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_download_list_files_file_idx\` ON \`_page_v_blocks_download_list_files\` (\`file_id\`);`)
  await db.run(sql`CREATE TABLE \`_page_v_blocks_download_list\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_download_list_order_idx\` ON \`_page_v_blocks_download_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_download_list_parent_id_idx\` ON \`_page_v_blocks_download_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_download_list_path_idx\` ON \`_page_v_blocks_download_list\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_page_v_blocks_breadcrumb\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`show_home\` integer DEFAULT true,
  	\`current_label_override\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_breadcrumb_order_idx\` ON \`_page_v_blocks_breadcrumb\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_breadcrumb_parent_id_idx\` ON \`_page_v_blocks_breadcrumb\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_blocks_breadcrumb_path_idx\` ON \`_page_v_blocks_breadcrumb\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_page_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_title\` text,
  	\`version_slug\` text,
  	\`version_seo_meta_title\` text,
  	\`version_seo_meta_description\` text,
  	\`version_seo_og_image_id\` integer,
  	\`version__schedule_publish_at\` text,
  	\`version__schedule_unpublish_at\` text,
  	\`version_review_status\` text DEFAULT 'brouillon',
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	\`autosave\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`page\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_page_v_parent_idx\` ON \`_page_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_version_version_slug_idx\` ON \`_page_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_version_seo_version_seo_og_image_idx\` ON \`_page_v\` (\`version_seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_version_version_review_status_idx\` ON \`_page_v\` (\`version_review_status\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_version_version_updated_at_idx\` ON \`_page_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_version_version_created_at_idx\` ON \`_page_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_version_version__status_idx\` ON \`_page_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_created_at_idx\` ON \`_page_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_updated_at_idx\` ON \`_page_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_latest_idx\` ON \`_page_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_autosave_idx\` ON \`_page_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`_page_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`rubriques_id\` integer,
  	\`actualite_id\` integer,
  	\`evenement_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`rubriques_id\`) REFERENCES \`rubriques\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`actualite_id\`) REFERENCES \`actualite\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`evenement_id\`) REFERENCES \`evenement\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_page_v_rels_order_idx\` ON \`_page_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_rels_parent_idx\` ON \`_page_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_rels_path_idx\` ON \`_page_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_rels_rubriques_id_idx\` ON \`_page_v_rels\` (\`rubriques_id\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_rels_actualite_id_idx\` ON \`_page_v_rels\` (\`actualite_id\`);`)
  await db.run(sql`CREATE INDEX \`_page_v_rels_evenement_id_idx\` ON \`_page_v_rels\` (\`evenement_id\`);`)
  await db.run(sql`CREATE TABLE \`media\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`alt\` text,
  	\`caption\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric,
  	\`focal_x\` numeric,
  	\`focal_y\` numeric,
  	\`sizes_thumbnail_url\` text,
  	\`sizes_thumbnail_width\` numeric,
  	\`sizes_thumbnail_height\` numeric,
  	\`sizes_thumbnail_mime_type\` text,
  	\`sizes_thumbnail_filesize\` numeric,
  	\`sizes_thumbnail_filename\` text,
  	\`sizes_card_url\` text,
  	\`sizes_card_width\` numeric,
  	\`sizes_card_height\` numeric,
  	\`sizes_card_mime_type\` text,
  	\`sizes_card_filesize\` numeric,
  	\`sizes_card_filename\` text,
  	\`sizes_tablet_url\` text,
  	\`sizes_tablet_width\` numeric,
  	\`sizes_tablet_height\` numeric,
  	\`sizes_tablet_mime_type\` text,
  	\`sizes_tablet_filesize\` numeric,
  	\`sizes_tablet_filename\` text,
  	\`sizes_desktop_url\` text,
  	\`sizes_desktop_width\` numeric,
  	\`sizes_desktop_height\` numeric,
  	\`sizes_desktop_mime_type\` text,
  	\`sizes_desktop_filesize\` numeric,
  	\`sizes_desktop_filename\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`media_updated_at_idx\` ON \`media\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`media_created_at_idx\` ON \`media\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`media__status_idx\` ON \`media\` (\`_status\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`media_filename_idx\` ON \`media\` (\`filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_thumbnail_sizes_thumbnail_filename_idx\` ON \`media\` (\`sizes_thumbnail_filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_card_sizes_card_filename_idx\` ON \`media\` (\`sizes_card_filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_tablet_sizes_tablet_filename_idx\` ON \`media\` (\`sizes_tablet_filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_desktop_sizes_desktop_filename_idx\` ON \`media\` (\`sizes_desktop_filename\`);`)
  await db.run(sql`CREATE TABLE \`media_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`rubriques_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`rubriques_id\`) REFERENCES \`rubriques\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`media_rels_order_idx\` ON \`media_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`media_rels_parent_idx\` ON \`media_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`media_rels_path_idx\` ON \`media_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`media_rels_rubriques_id_idx\` ON \`media_rels\` (\`rubriques_id\`);`)
  await db.run(sql`CREATE TABLE \`_media_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_alt\` text,
  	\`version_caption\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`version_url\` text,
  	\`version_thumbnail_u_r_l\` text,
  	\`version_filename\` text,
  	\`version_mime_type\` text,
  	\`version_filesize\` numeric,
  	\`version_width\` numeric,
  	\`version_height\` numeric,
  	\`version_focal_x\` numeric,
  	\`version_focal_y\` numeric,
  	\`version_sizes_thumbnail_url\` text,
  	\`version_sizes_thumbnail_width\` numeric,
  	\`version_sizes_thumbnail_height\` numeric,
  	\`version_sizes_thumbnail_mime_type\` text,
  	\`version_sizes_thumbnail_filesize\` numeric,
  	\`version_sizes_thumbnail_filename\` text,
  	\`version_sizes_card_url\` text,
  	\`version_sizes_card_width\` numeric,
  	\`version_sizes_card_height\` numeric,
  	\`version_sizes_card_mime_type\` text,
  	\`version_sizes_card_filesize\` numeric,
  	\`version_sizes_card_filename\` text,
  	\`version_sizes_tablet_url\` text,
  	\`version_sizes_tablet_width\` numeric,
  	\`version_sizes_tablet_height\` numeric,
  	\`version_sizes_tablet_mime_type\` text,
  	\`version_sizes_tablet_filesize\` numeric,
  	\`version_sizes_tablet_filename\` text,
  	\`version_sizes_desktop_url\` text,
  	\`version_sizes_desktop_width\` numeric,
  	\`version_sizes_desktop_height\` numeric,
  	\`version_sizes_desktop_mime_type\` text,
  	\`version_sizes_desktop_filesize\` numeric,
  	\`version_sizes_desktop_filename\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_media_v_parent_idx\` ON \`_media_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_media_v_version_version_updated_at_idx\` ON \`_media_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_media_v_version_version_created_at_idx\` ON \`_media_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_media_v_version_version__status_idx\` ON \`_media_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_media_v_version_version_filename_idx\` ON \`_media_v\` (\`version_filename\`);`)
  await db.run(sql`CREATE INDEX \`_media_v_version_sizes_thumbnail_version_sizes_thumbnail_idx\` ON \`_media_v\` (\`version_sizes_thumbnail_filename\`);`)
  await db.run(sql`CREATE INDEX \`_media_v_version_sizes_card_version_sizes_card_filename_idx\` ON \`_media_v\` (\`version_sizes_card_filename\`);`)
  await db.run(sql`CREATE INDEX \`_media_v_version_sizes_tablet_version_sizes_tablet_filen_idx\` ON \`_media_v\` (\`version_sizes_tablet_filename\`);`)
  await db.run(sql`CREATE INDEX \`_media_v_version_sizes_desktop_version_sizes_desktop_fil_idx\` ON \`_media_v\` (\`version_sizes_desktop_filename\`);`)
  await db.run(sql`CREATE INDEX \`_media_v_created_at_idx\` ON \`_media_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_media_v_updated_at_idx\` ON \`_media_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_media_v_latest_idx\` ON \`_media_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_media_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`rubriques_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_media_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`rubriques_id\`) REFERENCES \`rubriques\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_media_v_rels_order_idx\` ON \`_media_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_media_v_rels_parent_idx\` ON \`_media_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_media_v_rels_path_idx\` ON \`_media_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_media_v_rels_rubriques_id_idx\` ON \`_media_v_rels\` (\`rubriques_id\`);`)
  await db.run(sql`CREATE TABLE \`formulaire_blocks_checkbox\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`label\` text,
  	\`width\` numeric,
  	\`required\` integer,
  	\`default_value\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`formulaire\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`formulaire_blocks_checkbox_order_idx\` ON \`formulaire_blocks_checkbox\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`formulaire_blocks_checkbox_parent_id_idx\` ON \`formulaire_blocks_checkbox\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`formulaire_blocks_checkbox_path_idx\` ON \`formulaire_blocks_checkbox\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`formulaire_blocks_country\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`label\` text,
  	\`width\` numeric,
  	\`required\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`formulaire\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`formulaire_blocks_country_order_idx\` ON \`formulaire_blocks_country\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`formulaire_blocks_country_parent_id_idx\` ON \`formulaire_blocks_country\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`formulaire_blocks_country_path_idx\` ON \`formulaire_blocks_country\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`formulaire_blocks_email\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`label\` text,
  	\`width\` numeric,
  	\`required\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`formulaire\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`formulaire_blocks_email_order_idx\` ON \`formulaire_blocks_email\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`formulaire_blocks_email_parent_id_idx\` ON \`formulaire_blocks_email\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`formulaire_blocks_email_path_idx\` ON \`formulaire_blocks_email\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`formulaire_blocks_message\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`message\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`formulaire\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`formulaire_blocks_message_order_idx\` ON \`formulaire_blocks_message\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`formulaire_blocks_message_parent_id_idx\` ON \`formulaire_blocks_message\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`formulaire_blocks_message_path_idx\` ON \`formulaire_blocks_message\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`formulaire_blocks_number\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`label\` text,
  	\`width\` numeric,
  	\`default_value\` numeric,
  	\`required\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`formulaire\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`formulaire_blocks_number_order_idx\` ON \`formulaire_blocks_number\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`formulaire_blocks_number_parent_id_idx\` ON \`formulaire_blocks_number\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`formulaire_blocks_number_path_idx\` ON \`formulaire_blocks_number\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`formulaire_blocks_select_options\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`value\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`formulaire_blocks_select\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`formulaire_blocks_select_options_order_idx\` ON \`formulaire_blocks_select_options\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`formulaire_blocks_select_options_parent_id_idx\` ON \`formulaire_blocks_select_options\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`formulaire_blocks_select\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`label\` text,
  	\`width\` numeric,
  	\`default_value\` text,
  	\`placeholder\` text,
  	\`required\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`formulaire\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`formulaire_blocks_select_order_idx\` ON \`formulaire_blocks_select\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`formulaire_blocks_select_parent_id_idx\` ON \`formulaire_blocks_select\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`formulaire_blocks_select_path_idx\` ON \`formulaire_blocks_select\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`formulaire_blocks_state\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`label\` text,
  	\`width\` numeric,
  	\`required\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`formulaire\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`formulaire_blocks_state_order_idx\` ON \`formulaire_blocks_state\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`formulaire_blocks_state_parent_id_idx\` ON \`formulaire_blocks_state\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`formulaire_blocks_state_path_idx\` ON \`formulaire_blocks_state\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`formulaire_blocks_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`label\` text,
  	\`width\` numeric,
  	\`default_value\` text,
  	\`required\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`formulaire\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`formulaire_blocks_text_order_idx\` ON \`formulaire_blocks_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`formulaire_blocks_text_parent_id_idx\` ON \`formulaire_blocks_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`formulaire_blocks_text_path_idx\` ON \`formulaire_blocks_text\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`formulaire_blocks_textarea\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`label\` text,
  	\`width\` numeric,
  	\`default_value\` text,
  	\`required\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`formulaire\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`formulaire_blocks_textarea_order_idx\` ON \`formulaire_blocks_textarea\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`formulaire_blocks_textarea_parent_id_idx\` ON \`formulaire_blocks_textarea\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`formulaire_blocks_textarea_path_idx\` ON \`formulaire_blocks_textarea\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`formulaire_blocks_upload_mime_types\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`mime_type\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`formulaire_blocks_upload\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`formulaire_blocks_upload_mime_types_order_idx\` ON \`formulaire_blocks_upload_mime_types\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`formulaire_blocks_upload_mime_types_parent_id_idx\` ON \`formulaire_blocks_upload_mime_types\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`formulaire_blocks_upload\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`label\` text,
  	\`upload_collection\` text NOT NULL,
  	\`width\` numeric,
  	\`max_file_size\` numeric,
  	\`required\` integer,
  	\`multiple\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`formulaire\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`formulaire_blocks_upload_order_idx\` ON \`formulaire_blocks_upload\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`formulaire_blocks_upload_parent_id_idx\` ON \`formulaire_blocks_upload\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`formulaire_blocks_upload_path_idx\` ON \`formulaire_blocks_upload\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`formulaire_emails\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`email_to\` text,
  	\`cc\` text,
  	\`bcc\` text,
  	\`reply_to\` text,
  	\`email_from\` text,
  	\`subject\` text DEFAULT 'You''ve received a new message.' NOT NULL,
  	\`message\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`formulaire\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`formulaire_emails_order_idx\` ON \`formulaire_emails\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`formulaire_emails_parent_id_idx\` ON \`formulaire_emails\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`formulaire\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`submit_button_label\` text,
  	\`confirmation_type\` text DEFAULT 'message',
  	\`confirmation_message\` text,
  	\`redirect_type\` text DEFAULT 'reference',
  	\`redirect_url\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`formulaire_updated_at_idx\` ON \`formulaire\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`formulaire_created_at_idx\` ON \`formulaire\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`formulaire_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`rubriques_id\` integer,
  	\`page_id\` integer,
  	\`actualite_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`formulaire\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`rubriques_id\`) REFERENCES \`rubriques\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`page_id\`) REFERENCES \`page\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`actualite_id\`) REFERENCES \`actualite\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`formulaire_rels_order_idx\` ON \`formulaire_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`formulaire_rels_parent_idx\` ON \`formulaire_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`formulaire_rels_path_idx\` ON \`formulaire_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`formulaire_rels_rubriques_id_idx\` ON \`formulaire_rels\` (\`rubriques_id\`);`)
  await db.run(sql`CREATE INDEX \`formulaire_rels_page_id_idx\` ON \`formulaire_rels\` (\`page_id\`);`)
  await db.run(sql`CREATE INDEX \`formulaire_rels_actualite_id_idx\` ON \`formulaire_rels\` (\`actualite_id\`);`)
  await db.run(sql`CREATE TABLE \`form_submissions_submission_data\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`field\` text NOT NULL,
  	\`value\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`form_submissions\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`form_submissions_submission_data_order_idx\` ON \`form_submissions_submission_data\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`form_submissions_submission_data_parent_id_idx\` ON \`form_submissions_submission_data\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`form_submissions_submission_uploads\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`field\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`form_submissions\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`form_submissions_submission_uploads_order_idx\` ON \`form_submissions_submission_uploads\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`form_submissions_submission_uploads_parent_id_idx\` ON \`form_submissions_submission_uploads\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`form_submissions\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`form_id\` integer NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`form_id\`) REFERENCES \`formulaire\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`form_submissions_form_idx\` ON \`form_submissions\` (\`form_id\`);`)
  await db.run(sql`CREATE INDEX \`form_submissions_updated_at_idx\` ON \`form_submissions\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`form_submissions_created_at_idx\` ON \`form_submissions\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`form_submissions_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`media_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`form_submissions\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`form_submissions_rels_order_idx\` ON \`form_submissions_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`form_submissions_rels_parent_idx\` ON \`form_submissions_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`form_submissions_rels_path_idx\` ON \`form_submissions_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`form_submissions_rels_media_id_idx\` ON \`form_submissions_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE \`search\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`priority\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`search_updated_at_idx\` ON \`search\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`search_created_at_idx\` ON \`search\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`search_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`actualite_id\` integer,
  	\`evenement_id\` integer,
  	\`article_id\` integer,
  	\`page_id\` integer,
  	\`breve_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`search\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`actualite_id\`) REFERENCES \`actualite\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`evenement_id\`) REFERENCES \`evenement\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`article_id\`) REFERENCES \`article\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`page_id\`) REFERENCES \`page\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`breve_id\`) REFERENCES \`breve\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`search_rels_order_idx\` ON \`search_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`search_rels_parent_idx\` ON \`search_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`search_rels_path_idx\` ON \`search_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`search_rels_actualite_id_idx\` ON \`search_rels\` (\`actualite_id\`);`)
  await db.run(sql`CREATE INDEX \`search_rels_evenement_id_idx\` ON \`search_rels\` (\`evenement_id\`);`)
  await db.run(sql`CREATE INDEX \`search_rels_article_id_idx\` ON \`search_rels\` (\`article_id\`);`)
  await db.run(sql`CREATE INDEX \`search_rels_page_id_idx\` ON \`search_rels\` (\`page_id\`);`)
  await db.run(sql`CREATE INDEX \`search_rels_breve_id_idx\` ON \`search_rels\` (\`breve_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_kv\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text NOT NULL,
  	\`data\` text NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`payload_kv_key_idx\` ON \`payload_kv\` (\`key\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`global_slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_global_slug_idx\` ON \`payload_locked_documents\` (\`global_slug\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_updated_at_idx\` ON \`payload_locked_documents\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_created_at_idx\` ON \`payload_locked_documents\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`groupes_id\` integer,
  	\`rubriques_id\` integer,
  	\`article_id\` integer,
  	\`actualite_id\` integer,
  	\`evenement_id\` integer,
  	\`breve_id\` integer,
  	\`page_id\` integer,
  	\`media_id\` integer,
  	\`formulaire_id\` integer,
  	\`form_submissions_id\` integer,
  	\`search_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`groupes_id\`) REFERENCES \`groupes\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`rubriques_id\`) REFERENCES \`rubriques\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`article_id\`) REFERENCES \`article\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`actualite_id\`) REFERENCES \`actualite\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`evenement_id\`) REFERENCES \`evenement\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`breve_id\`) REFERENCES \`breve\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`page_id\`) REFERENCES \`page\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`formulaire_id\`) REFERENCES \`formulaire\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`form_submissions_id\`) REFERENCES \`form_submissions\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`search_id\`) REFERENCES \`search\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_groupes_id_idx\` ON \`payload_locked_documents_rels\` (\`groupes_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_rubriques_id_idx\` ON \`payload_locked_documents_rels\` (\`rubriques_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_article_id_idx\` ON \`payload_locked_documents_rels\` (\`article_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_actualite_id_idx\` ON \`payload_locked_documents_rels\` (\`actualite_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_evenement_id_idx\` ON \`payload_locked_documents_rels\` (\`evenement_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_breve_id_idx\` ON \`payload_locked_documents_rels\` (\`breve_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_page_id_idx\` ON \`payload_locked_documents_rels\` (\`page_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_formulaire_id_idx\` ON \`payload_locked_documents_rels\` (\`formulaire_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_form_submissions_id_idx\` ON \`payload_locked_documents_rels\` (\`form_submissions_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_search_id_idx\` ON \`payload_locked_documents_rels\` (\`search_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text,
  	\`value\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_key_idx\` ON \`payload_preferences\` (\`key\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_updated_at_idx\` ON \`payload_preferences\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_created_at_idx\` ON \`payload_preferences\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_preferences\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_order_idx\` ON \`payload_preferences_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_parent_idx\` ON \`payload_preferences_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_path_idx\` ON \`payload_preferences_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_users_id_idx\` ON \`payload_preferences_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_migrations\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`batch\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_migrations_updated_at_idx\` ON \`payload_migrations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_migrations_created_at_idx\` ON \`payload_migrations\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`header_topbar_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`type\` text DEFAULT 'rubrique' NOT NULL,
  	\`label\` text NOT NULL,
  	\`rubrique_id\` integer,
  	\`url\` text,
  	\`new_tab\` integer DEFAULT false,
  	FOREIGN KEY (\`rubrique_id\`) REFERENCES \`rubriques\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`header\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`header_topbar_links_order_idx\` ON \`header_topbar_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`header_topbar_links_parent_id_idx\` ON \`header_topbar_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`header_topbar_links_rubrique_idx\` ON \`header_topbar_links\` (\`rubrique_id\`);`)
  await db.run(sql`CREATE TABLE \`header_primary_nav_sublinks\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`type\` text DEFAULT 'rubrique',
  	\`label\` text,
  	\`rubrique_id\` integer,
  	\`url\` text,
  	\`new_tab\` integer DEFAULT false,
  	FOREIGN KEY (\`rubrique_id\`) REFERENCES \`rubriques\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`header_primary_nav\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`header_primary_nav_sublinks_order_idx\` ON \`header_primary_nav_sublinks\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`header_primary_nav_sublinks_parent_id_idx\` ON \`header_primary_nav_sublinks\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`header_primary_nav_sublinks_rubrique_idx\` ON \`header_primary_nav_sublinks\` (\`rubrique_id\`);`)
  await db.run(sql`CREATE TABLE \`header_primary_nav_columns_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`type\` text DEFAULT 'rubrique',
  	\`label\` text,
  	\`rubrique_id\` integer,
  	\`url\` text,
  	\`new_tab\` integer DEFAULT false,
  	FOREIGN KEY (\`rubrique_id\`) REFERENCES \`rubriques\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`header_primary_nav_columns\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`header_primary_nav_columns_links_order_idx\` ON \`header_primary_nav_columns_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`header_primary_nav_columns_links_parent_id_idx\` ON \`header_primary_nav_columns_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`header_primary_nav_columns_links_rubrique_idx\` ON \`header_primary_nav_columns_links\` (\`rubrique_id\`);`)
  await db.run(sql`CREATE TABLE \`header_primary_nav_columns\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`header_primary_nav\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`header_primary_nav_columns_order_idx\` ON \`header_primary_nav_columns\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`header_primary_nav_columns_parent_id_idx\` ON \`header_primary_nav_columns\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`header_primary_nav\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`menu_type\` text DEFAULT 'direct' NOT NULL,
  	\`type\` text DEFAULT 'rubrique' NOT NULL,
  	\`label\` text NOT NULL,
  	\`rubrique_id\` integer,
  	\`url\` text,
  	\`new_tab\` integer DEFAULT false,
  	FOREIGN KEY (\`rubrique_id\`) REFERENCES \`rubriques\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`header\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`header_primary_nav_order_idx\` ON \`header_primary_nav\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`header_primary_nav_parent_id_idx\` ON \`header_primary_nav\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`header_primary_nav_rubrique_idx\` ON \`header_primary_nav\` (\`rubrique_id\`);`)
  await db.run(sql`CREATE TABLE \`header\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`topbar_intro\` text,
  	\`topbar_private_space_type\` text DEFAULT 'rubrique' NOT NULL,
  	\`topbar_private_space_label\` text NOT NULL,
  	\`topbar_private_space_rubrique_id\` integer,
  	\`topbar_private_space_url\` text,
  	\`topbar_private_space_new_tab\` integer DEFAULT false,
  	\`search_enabled\` integer DEFAULT true,
  	\`search_placeholder\` text DEFAULT 'Rechercher…',
  	\`search_action\` text DEFAULT '/recherche',
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`topbar_private_space_rubrique_id\`) REFERENCES \`rubriques\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`header_topbar_private_space_topbar_private_space_rubriqu_idx\` ON \`header\` (\`topbar_private_space_rubrique_id\`);`)
  await db.run(sql`CREATE TABLE \`footer_socials\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`network\` text NOT NULL,
  	\`url\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`footer\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`footer_socials_order_idx\` ON \`footer_socials\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`footer_socials_parent_id_idx\` ON \`footer_socials\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`footer_columns_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`type\` text DEFAULT 'rubrique' NOT NULL,
  	\`label\` text NOT NULL,
  	\`rubrique_id\` integer,
  	\`url\` text,
  	\`new_tab\` integer DEFAULT false,
  	FOREIGN KEY (\`rubrique_id\`) REFERENCES \`rubriques\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`footer_columns\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`footer_columns_links_order_idx\` ON \`footer_columns_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`footer_columns_links_parent_id_idx\` ON \`footer_columns_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`footer_columns_links_rubrique_idx\` ON \`footer_columns_links\` (\`rubrique_id\`);`)
  await db.run(sql`CREATE TABLE \`footer_columns\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`footer\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`footer_columns_order_idx\` ON \`footer_columns\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`footer_columns_parent_id_idx\` ON \`footer_columns\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`footer_legal_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`type\` text DEFAULT 'rubrique' NOT NULL,
  	\`label\` text NOT NULL,
  	\`rubrique_id\` integer,
  	\`url\` text,
  	\`new_tab\` integer DEFAULT false,
  	FOREIGN KEY (\`rubrique_id\`) REFERENCES \`rubriques\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`footer\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`footer_legal_links_order_idx\` ON \`footer_legal_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`footer_legal_links_parent_id_idx\` ON \`footer_legal_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`footer_legal_links_rubrique_idx\` ON \`footer_legal_links\` (\`rubrique_id\`);`)
  await db.run(sql`CREATE TABLE \`footer\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`newsletter_title\` text,
  	\`newsletter_description\` text,
  	\`newsletter_placeholder\` text,
  	\`newsletter_button\` text,
  	\`contact_address\` text,
  	\`contact_phone\` text,
  	\`contact_email\` text,
  	\`copyright\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`users_sessions\`;`)
  await db.run(sql`DROP TABLE \`users\`;`)
  await db.run(sql`DROP TABLE \`users_rels\`;`)
  await db.run(sql`DROP TABLE \`groupes\`;`)
  await db.run(sql`DROP TABLE \`groupes_rels\`;`)
  await db.run(sql`DROP TABLE \`rubriques_blocks_hero_ctas\`;`)
  await db.run(sql`DROP TABLE \`rubriques_blocks_hero\`;`)
  await db.run(sql`DROP TABLE \`rubriques_blocks_rich_text\`;`)
  await db.run(sql`DROP TABLE \`rubriques_blocks_image_text\`;`)
  await db.run(sql`DROP TABLE \`rubriques_blocks_card_grid_cards\`;`)
  await db.run(sql`DROP TABLE \`rubriques_blocks_card_grid\`;`)
  await db.run(sql`DROP TABLE \`rubriques_blocks_faq_items\`;`)
  await db.run(sql`DROP TABLE \`rubriques_blocks_faq\`;`)
  await db.run(sql`DROP TABLE \`rubriques_blocks_cta_form\`;`)
  await db.run(sql`DROP TABLE \`rubriques_blocks_map_embed\`;`)
  await db.run(sql`DROP TABLE \`rubriques_blocks_news_list\`;`)
  await db.run(sql`DROP TABLE \`rubriques_blocks_agenda\`;`)
  await db.run(sql`DROP TABLE \`rubriques_blocks_partners_partners\`;`)
  await db.run(sql`DROP TABLE \`rubriques_blocks_partners\`;`)
  await db.run(sql`DROP TABLE \`rubriques_blocks_related_links_links\`;`)
  await db.run(sql`DROP TABLE \`rubriques_blocks_related_links\`;`)
  await db.run(sql`DROP TABLE \`rubriques_blocks_download_list_files\`;`)
  await db.run(sql`DROP TABLE \`rubriques_blocks_download_list\`;`)
  await db.run(sql`DROP TABLE \`rubriques_blocks_breadcrumb\`;`)
  await db.run(sql`DROP TABLE \`rubriques_breadcrumbs\`;`)
  await db.run(sql`DROP TABLE \`rubriques\`;`)
  await db.run(sql`DROP TABLE \`rubriques_rels\`;`)
  await db.run(sql`DROP TABLE \`_rubriques_v_blocks_hero_ctas\`;`)
  await db.run(sql`DROP TABLE \`_rubriques_v_blocks_hero\`;`)
  await db.run(sql`DROP TABLE \`_rubriques_v_blocks_rich_text\`;`)
  await db.run(sql`DROP TABLE \`_rubriques_v_blocks_image_text\`;`)
  await db.run(sql`DROP TABLE \`_rubriques_v_blocks_card_grid_cards\`;`)
  await db.run(sql`DROP TABLE \`_rubriques_v_blocks_card_grid\`;`)
  await db.run(sql`DROP TABLE \`_rubriques_v_blocks_faq_items\`;`)
  await db.run(sql`DROP TABLE \`_rubriques_v_blocks_faq\`;`)
  await db.run(sql`DROP TABLE \`_rubriques_v_blocks_cta_form\`;`)
  await db.run(sql`DROP TABLE \`_rubriques_v_blocks_map_embed\`;`)
  await db.run(sql`DROP TABLE \`_rubriques_v_blocks_news_list\`;`)
  await db.run(sql`DROP TABLE \`_rubriques_v_blocks_agenda\`;`)
  await db.run(sql`DROP TABLE \`_rubriques_v_blocks_partners_partners\`;`)
  await db.run(sql`DROP TABLE \`_rubriques_v_blocks_partners\`;`)
  await db.run(sql`DROP TABLE \`_rubriques_v_blocks_related_links_links\`;`)
  await db.run(sql`DROP TABLE \`_rubriques_v_blocks_related_links\`;`)
  await db.run(sql`DROP TABLE \`_rubriques_v_blocks_download_list_files\`;`)
  await db.run(sql`DROP TABLE \`_rubriques_v_blocks_download_list\`;`)
  await db.run(sql`DROP TABLE \`_rubriques_v_blocks_breadcrumb\`;`)
  await db.run(sql`DROP TABLE \`_rubriques_v_version_breadcrumbs\`;`)
  await db.run(sql`DROP TABLE \`_rubriques_v\`;`)
  await db.run(sql`DROP TABLE \`_rubriques_v_rels\`;`)
  await db.run(sql`DROP TABLE \`article_blocks_hero_ctas\`;`)
  await db.run(sql`DROP TABLE \`article_blocks_hero\`;`)
  await db.run(sql`DROP TABLE \`article_blocks_rich_text\`;`)
  await db.run(sql`DROP TABLE \`article_blocks_image_text\`;`)
  await db.run(sql`DROP TABLE \`article_blocks_card_grid_cards\`;`)
  await db.run(sql`DROP TABLE \`article_blocks_card_grid\`;`)
  await db.run(sql`DROP TABLE \`article_blocks_faq_items\`;`)
  await db.run(sql`DROP TABLE \`article_blocks_faq\`;`)
  await db.run(sql`DROP TABLE \`article_blocks_cta_form\`;`)
  await db.run(sql`DROP TABLE \`article_blocks_map_embed\`;`)
  await db.run(sql`DROP TABLE \`article_blocks_news_list\`;`)
  await db.run(sql`DROP TABLE \`article_blocks_agenda\`;`)
  await db.run(sql`DROP TABLE \`article_blocks_partners_partners\`;`)
  await db.run(sql`DROP TABLE \`article_blocks_partners\`;`)
  await db.run(sql`DROP TABLE \`article_blocks_related_links_links\`;`)
  await db.run(sql`DROP TABLE \`article_blocks_related_links\`;`)
  await db.run(sql`DROP TABLE \`article_blocks_download_list_files\`;`)
  await db.run(sql`DROP TABLE \`article_blocks_download_list\`;`)
  await db.run(sql`DROP TABLE \`article_blocks_breadcrumb\`;`)
  await db.run(sql`DROP TABLE \`article_steps\`;`)
  await db.run(sql`DROP TABLE \`article_contacts\`;`)
  await db.run(sql`DROP TABLE \`article\`;`)
  await db.run(sql`DROP TABLE \`article_rels\`;`)
  await db.run(sql`DROP TABLE \`_article_v_blocks_hero_ctas\`;`)
  await db.run(sql`DROP TABLE \`_article_v_blocks_hero\`;`)
  await db.run(sql`DROP TABLE \`_article_v_blocks_rich_text\`;`)
  await db.run(sql`DROP TABLE \`_article_v_blocks_image_text\`;`)
  await db.run(sql`DROP TABLE \`_article_v_blocks_card_grid_cards\`;`)
  await db.run(sql`DROP TABLE \`_article_v_blocks_card_grid\`;`)
  await db.run(sql`DROP TABLE \`_article_v_blocks_faq_items\`;`)
  await db.run(sql`DROP TABLE \`_article_v_blocks_faq\`;`)
  await db.run(sql`DROP TABLE \`_article_v_blocks_cta_form\`;`)
  await db.run(sql`DROP TABLE \`_article_v_blocks_map_embed\`;`)
  await db.run(sql`DROP TABLE \`_article_v_blocks_news_list\`;`)
  await db.run(sql`DROP TABLE \`_article_v_blocks_agenda\`;`)
  await db.run(sql`DROP TABLE \`_article_v_blocks_partners_partners\`;`)
  await db.run(sql`DROP TABLE \`_article_v_blocks_partners\`;`)
  await db.run(sql`DROP TABLE \`_article_v_blocks_related_links_links\`;`)
  await db.run(sql`DROP TABLE \`_article_v_blocks_related_links\`;`)
  await db.run(sql`DROP TABLE \`_article_v_blocks_download_list_files\`;`)
  await db.run(sql`DROP TABLE \`_article_v_blocks_download_list\`;`)
  await db.run(sql`DROP TABLE \`_article_v_blocks_breadcrumb\`;`)
  await db.run(sql`DROP TABLE \`_article_v_version_steps\`;`)
  await db.run(sql`DROP TABLE \`_article_v_version_contacts\`;`)
  await db.run(sql`DROP TABLE \`_article_v\`;`)
  await db.run(sql`DROP TABLE \`_article_v_rels\`;`)
  await db.run(sql`DROP TABLE \`actualite_gallery\`;`)
  await db.run(sql`DROP TABLE \`actualite\`;`)
  await db.run(sql`DROP TABLE \`actualite_rels\`;`)
  await db.run(sql`DROP TABLE \`_actualite_v_version_gallery\`;`)
  await db.run(sql`DROP TABLE \`_actualite_v\`;`)
  await db.run(sql`DROP TABLE \`_actualite_v_rels\`;`)
  await db.run(sql`DROP TABLE \`evenement_blocks_event_rich_text\`;`)
  await db.run(sql`DROP TABLE \`evenement_blocks_event_programme_items\`;`)
  await db.run(sql`DROP TABLE \`evenement_blocks_event_programme\`;`)
  await db.run(sql`DROP TABLE \`evenement_blocks_event_pratical_info_items\`;`)
  await db.run(sql`DROP TABLE \`evenement_blocks_event_pratical_info\`;`)
  await db.run(sql`DROP TABLE \`evenement_blocks_event_media_images\`;`)
  await db.run(sql`DROP TABLE \`evenement_blocks_event_media\`;`)
  await db.run(sql`DROP TABLE \`evenement_blocks_event_map\`;`)
  await db.run(sql`DROP TABLE \`evenement_blocks_event_documents_files\`;`)
  await db.run(sql`DROP TABLE \`evenement_blocks_event_documents\`;`)
  await db.run(sql`DROP TABLE \`evenement_blocks_event_cta\`;`)
  await db.run(sql`DROP TABLE \`evenement_blocks_event_related\`;`)
  await db.run(sql`DROP TABLE \`evenement\`;`)
  await db.run(sql`DROP TABLE \`evenement_rels\`;`)
  await db.run(sql`DROP TABLE \`_evenement_v_blocks_event_rich_text\`;`)
  await db.run(sql`DROP TABLE \`_evenement_v_blocks_event_programme_items\`;`)
  await db.run(sql`DROP TABLE \`_evenement_v_blocks_event_programme\`;`)
  await db.run(sql`DROP TABLE \`_evenement_v_blocks_event_pratical_info_items\`;`)
  await db.run(sql`DROP TABLE \`_evenement_v_blocks_event_pratical_info\`;`)
  await db.run(sql`DROP TABLE \`_evenement_v_blocks_event_media_images\`;`)
  await db.run(sql`DROP TABLE \`_evenement_v_blocks_event_media\`;`)
  await db.run(sql`DROP TABLE \`_evenement_v_blocks_event_map\`;`)
  await db.run(sql`DROP TABLE \`_evenement_v_blocks_event_documents_files\`;`)
  await db.run(sql`DROP TABLE \`_evenement_v_blocks_event_documents\`;`)
  await db.run(sql`DROP TABLE \`_evenement_v_blocks_event_cta\`;`)
  await db.run(sql`DROP TABLE \`_evenement_v_blocks_event_related\`;`)
  await db.run(sql`DROP TABLE \`_evenement_v\`;`)
  await db.run(sql`DROP TABLE \`_evenement_v_rels\`;`)
  await db.run(sql`DROP TABLE \`breve\`;`)
  await db.run(sql`DROP TABLE \`breve_rels\`;`)
  await db.run(sql`DROP TABLE \`_breve_v\`;`)
  await db.run(sql`DROP TABLE \`_breve_v_rels\`;`)
  await db.run(sql`DROP TABLE \`page_blocks_hero_ctas\`;`)
  await db.run(sql`DROP TABLE \`page_blocks_hero\`;`)
  await db.run(sql`DROP TABLE \`page_blocks_rich_text\`;`)
  await db.run(sql`DROP TABLE \`page_blocks_image_text\`;`)
  await db.run(sql`DROP TABLE \`page_blocks_card_grid_cards\`;`)
  await db.run(sql`DROP TABLE \`page_blocks_card_grid\`;`)
  await db.run(sql`DROP TABLE \`page_blocks_faq_items\`;`)
  await db.run(sql`DROP TABLE \`page_blocks_faq\`;`)
  await db.run(sql`DROP TABLE \`page_blocks_cta_form\`;`)
  await db.run(sql`DROP TABLE \`page_blocks_map_embed\`;`)
  await db.run(sql`DROP TABLE \`page_blocks_news_list\`;`)
  await db.run(sql`DROP TABLE \`page_blocks_agenda\`;`)
  await db.run(sql`DROP TABLE \`page_blocks_partners_partners\`;`)
  await db.run(sql`DROP TABLE \`page_blocks_partners\`;`)
  await db.run(sql`DROP TABLE \`page_blocks_related_links_links\`;`)
  await db.run(sql`DROP TABLE \`page_blocks_related_links\`;`)
  await db.run(sql`DROP TABLE \`page_blocks_download_list_files\`;`)
  await db.run(sql`DROP TABLE \`page_blocks_download_list\`;`)
  await db.run(sql`DROP TABLE \`page_blocks_breadcrumb\`;`)
  await db.run(sql`DROP TABLE \`page\`;`)
  await db.run(sql`DROP TABLE \`page_rels\`;`)
  await db.run(sql`DROP TABLE \`_page_v_blocks_hero_ctas\`;`)
  await db.run(sql`DROP TABLE \`_page_v_blocks_hero\`;`)
  await db.run(sql`DROP TABLE \`_page_v_blocks_rich_text\`;`)
  await db.run(sql`DROP TABLE \`_page_v_blocks_image_text\`;`)
  await db.run(sql`DROP TABLE \`_page_v_blocks_card_grid_cards\`;`)
  await db.run(sql`DROP TABLE \`_page_v_blocks_card_grid\`;`)
  await db.run(sql`DROP TABLE \`_page_v_blocks_faq_items\`;`)
  await db.run(sql`DROP TABLE \`_page_v_blocks_faq\`;`)
  await db.run(sql`DROP TABLE \`_page_v_blocks_cta_form\`;`)
  await db.run(sql`DROP TABLE \`_page_v_blocks_map_embed\`;`)
  await db.run(sql`DROP TABLE \`_page_v_blocks_news_list\`;`)
  await db.run(sql`DROP TABLE \`_page_v_blocks_agenda\`;`)
  await db.run(sql`DROP TABLE \`_page_v_blocks_partners_partners\`;`)
  await db.run(sql`DROP TABLE \`_page_v_blocks_partners\`;`)
  await db.run(sql`DROP TABLE \`_page_v_blocks_related_links_links\`;`)
  await db.run(sql`DROP TABLE \`_page_v_blocks_related_links\`;`)
  await db.run(sql`DROP TABLE \`_page_v_blocks_download_list_files\`;`)
  await db.run(sql`DROP TABLE \`_page_v_blocks_download_list\`;`)
  await db.run(sql`DROP TABLE \`_page_v_blocks_breadcrumb\`;`)
  await db.run(sql`DROP TABLE \`_page_v\`;`)
  await db.run(sql`DROP TABLE \`_page_v_rels\`;`)
  await db.run(sql`DROP TABLE \`media\`;`)
  await db.run(sql`DROP TABLE \`media_rels\`;`)
  await db.run(sql`DROP TABLE \`_media_v\`;`)
  await db.run(sql`DROP TABLE \`_media_v_rels\`;`)
  await db.run(sql`DROP TABLE \`formulaire_blocks_checkbox\`;`)
  await db.run(sql`DROP TABLE \`formulaire_blocks_country\`;`)
  await db.run(sql`DROP TABLE \`formulaire_blocks_email\`;`)
  await db.run(sql`DROP TABLE \`formulaire_blocks_message\`;`)
  await db.run(sql`DROP TABLE \`formulaire_blocks_number\`;`)
  await db.run(sql`DROP TABLE \`formulaire_blocks_select_options\`;`)
  await db.run(sql`DROP TABLE \`formulaire_blocks_select\`;`)
  await db.run(sql`DROP TABLE \`formulaire_blocks_state\`;`)
  await db.run(sql`DROP TABLE \`formulaire_blocks_text\`;`)
  await db.run(sql`DROP TABLE \`formulaire_blocks_textarea\`;`)
  await db.run(sql`DROP TABLE \`formulaire_blocks_upload_mime_types\`;`)
  await db.run(sql`DROP TABLE \`formulaire_blocks_upload\`;`)
  await db.run(sql`DROP TABLE \`formulaire_emails\`;`)
  await db.run(sql`DROP TABLE \`formulaire\`;`)
  await db.run(sql`DROP TABLE \`formulaire_rels\`;`)
  await db.run(sql`DROP TABLE \`form_submissions_submission_data\`;`)
  await db.run(sql`DROP TABLE \`form_submissions_submission_uploads\`;`)
  await db.run(sql`DROP TABLE \`form_submissions\`;`)
  await db.run(sql`DROP TABLE \`form_submissions_rels\`;`)
  await db.run(sql`DROP TABLE \`search\`;`)
  await db.run(sql`DROP TABLE \`search_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_kv\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_migrations\`;`)
  await db.run(sql`DROP TABLE \`header_topbar_links\`;`)
  await db.run(sql`DROP TABLE \`header_primary_nav_sublinks\`;`)
  await db.run(sql`DROP TABLE \`header_primary_nav_columns_links\`;`)
  await db.run(sql`DROP TABLE \`header_primary_nav_columns\`;`)
  await db.run(sql`DROP TABLE \`header_primary_nav\`;`)
  await db.run(sql`DROP TABLE \`header\`;`)
  await db.run(sql`DROP TABLE \`footer_socials\`;`)
  await db.run(sql`DROP TABLE \`footer_columns_links\`;`)
  await db.run(sql`DROP TABLE \`footer_columns\`;`)
  await db.run(sql`DROP TABLE \`footer_legal_links\`;`)
  await db.run(sql`DROP TABLE \`footer\`;`)
}
