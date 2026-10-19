// Plugins bundled with the self-hosted tinymce@8.9.3 npm package (Community).
// Option names are extracted from each plugin's registerOption calls
// (scripts/extract-plugin-options.mjs), so they match this version exactly.

/** @type {{ name: string, desc: string, options: { name: string, desc: string }[] }[]} */
export const PLUGINS = [
  { name: 'accordion', desc: 'Collapsible accordion sections.', options: [] },
  {
    name: 'advlist',
    desc: 'Advanced list styles for bullet/numbered lists.',
    options: [
      { name: 'advlist_bullet_styles', desc: 'Bullet styles offered in the list dropdown.' },
      { name: 'advlist_number_styles', desc: 'Numbering styles offered in the list dropdown.' },
    ],
  },
  {
    name: 'anchor',
    desc: 'Insert named anchors/bookmarks.',
    options: [
      { name: 'allow_html_in_named_anchor', desc: 'Allow HTML inside named anchors (core option).' },
    ],
  },
  {
    name: 'autolink',
    desc: 'Turn typed URLs and emails into links automatically.',
    options: [
      { name: 'autolink_pattern', desc: 'Regex used to detect URLs while typing.' },
      { name: 'link_default_protocol', desc: 'Protocol used when none is typed.' },
      { name: 'link_default_target', desc: 'Default target attribute for new links.' },
    ],
  },
  {
    name: 'autoresize',
    desc: 'Grow/shrink the editor to fit its content.',
    options: [
      { name: 'autoresize_bottom_margin', desc: 'Space kept below the content.' },
      { name: 'autoresize_overflow_padding', desc: 'Padding applied to avoid scrollbars.' },
    ],
  },
  {
    name: 'autosave',
    desc: 'Periodically save content to local storage and restore it.',
    options: [
      { name: 'autosave_ask_before_unload', desc: 'Warn before leaving with unsaved changes.' },
      { name: 'autosave_interval', desc: 'How often to save (e.g. "30s").' },
      { name: 'autosave_prefix', desc: 'localStorage key prefix.' },
      { name: 'autosave_restore_when_empty', desc: 'Restore a draft when the editor is empty.' },
      { name: 'autosave_retention', desc: 'How long drafts are kept.' },
    ],
  },
  {
    name: 'charmap',
    desc: 'Insert special characters and symbols.',
    options: [
      { name: 'charmap', desc: 'Custom list of characters.' },
      { name: 'charmap_append', desc: 'Append characters to the default set.' },
    ],
  },
  { name: 'code', desc: 'Edit the underlying HTML source.', options: [] },
  {
    name: 'codesample',
    desc: 'Insert syntax-highlighted code samples.',
    options: [
      { name: 'codesample_languages', desc: 'Languages offered in the dropdown.' },
      { name: 'codesample_global_prismjs', desc: 'Use a global Prism.js instance for highlighting.' },
    ],
  },
  { name: 'directionality', desc: 'Switch text direction (LTR/RTL).', options: [] },
  {
    name: 'emoticons',
    desc: 'Insert emoji.',
    options: [
      { name: 'emoticons_append', desc: 'Add custom emoji.' },
      { name: 'emoticons_database', desc: 'Which emoji database to use.' },
      { name: 'emoticons_database_id', desc: 'Id of the emoji database.' },
      { name: 'emoticons_database_url', desc: 'Custom URL to an emoji database.' },
      { name: 'emoticons_images_url', desc: 'Base URL for image-based emoji.' },
    ],
  },
  {
    name: 'fullscreen',
    desc: 'Distraction-free fullscreen editing.',
    options: [{ name: 'fullscreen_native', desc: 'Use the browser Fullscreen API.' }],
  },
  {
    name: 'help',
    desc: 'Help dialog listing shortcuts and plugins.',
    options: [{ name: 'help_tabs', desc: 'Tabs shown in the Help dialog.' }],
  },
  {
    name: 'image',
    desc: 'Insert and edit images, with optional upload.',
    options: [
      { name: 'image_advtab', desc: 'Show the Advanced image tab.' },
      { name: 'image_caption', desc: 'Add a caption beneath the image.' },
      { name: 'image_class_list', desc: 'Class choices for images.' },
      { name: 'image_description', desc: 'Show the image description field.' },
      { name: 'image_dimensions', desc: 'Show width/height fields.' },
      { name: 'image_list', desc: 'Predefined list of images.' },
      { name: 'image_prepend_url', desc: 'URL prepended to image sources.' },
      { name: 'image_title', desc: 'Enable the title field.' },
      { name: 'image_uploadtab', desc: 'Show the Upload tab (needs an upload target).' },
    ],
  },
  {
    name: 'importcss',
    desc: 'Import CSS classes from your stylesheet into the formats menu.',
    options: [
      { name: 'importcss_append', desc: 'Append imported classes instead of replacing.' },
      { name: 'importcss_exclusive', desc: 'Limit class scoping to the editor.' },
      { name: 'importcss_file_filter', desc: 'Which stylesheets to scan.' },
      { name: 'importcss_groups', desc: 'Group imported classes in the menu.' },
      { name: 'importcss_merge_classes', desc: 'Merge classes rather than replace.' },
      { name: 'importcss_selector_converter', desc: 'Custom selector-to-format converter.' },
      { name: 'importcss_selector_filter', desc: 'Filter which selectors are imported.' },
    ],
  },
  {
    name: 'insertdatetime',
    desc: 'Insert the current date/time.',
    options: [
      { name: 'insertdatetime_dateformat', desc: 'Date format string.' },
      { name: 'insertdatetime_element', desc: 'Wrap output in a <time> element.' },
      { name: 'insertdatetime_formats', desc: 'List of selectable formats.' },
      { name: 'insertdatetime_timeformat', desc: 'Time format string.' },
    ],
  },
  {
    name: 'link',
    desc: 'Insert and manage hyperlinks.',
    options: [
      { name: 'allow_unsafe_link_target', desc: 'Do not force rel="noopener" on _blank links.' },
      { name: 'files_upload_handler', desc: 'Handler for file uploads via the link dialog.' },
      { name: 'link_assume_external_targets', desc: 'Auto-add http(s) to bare domains.' },
      { name: 'link_attributes_postprocess', desc: 'Post-process link attributes.' },
      { name: 'link_class_list', desc: 'Class choices for links.' },
      { name: 'link_context_toolbar', desc: 'Show link edit toolbar on click.' },
      { name: 'link_default_protocol', desc: 'Default protocol for new links.' },
      { name: 'link_default_target', desc: 'Default target attribute.' },
      { name: 'link_list', desc: 'Predefined list of links.' },
      { name: 'link_quicklink', desc: 'Insert a link from a quick toolbar.' },
      { name: 'link_rel_list', desc: 'rel attribute choices.' },
      { name: 'link_target_list', desc: 'target attribute choices.' },
      { name: 'link_title', desc: 'Enable the title field.' },
      { name: 'link_uploadtab', desc: 'Show an upload tab (needs files_upload_handler).' },
    ],
  },
  { name: 'lists', desc: 'Ordered, unordered and definition lists.', options: [] },
  {
    name: 'media',
    desc: 'Insert and embed media (video, audio, iframes).',
    options: [
      { name: 'audio_template_callback', desc: 'Custom HTML template for audio embeds.' },
      { name: 'iframe_template_callback', desc: 'Custom HTML template for iframe embeds.' },
      { name: 'media_alt_source', desc: 'Offer alternative sources.' },
      { name: 'media_dimensions', desc: 'Show width/height fields.' },
      { name: 'media_filter_html', desc: 'Sanitize embedded media HTML.' },
      { name: 'media_live_embeds', desc: 'Render a live preview in the editor.' },
      { name: 'media_poster', desc: 'Offer a poster image.' },
      { name: 'media_url_resolver', desc: 'Custom resolver for media URLs.' },
      { name: 'video_template_callback', desc: 'Custom HTML template for video embeds.' },
    ],
  },
  {
    name: 'nonbreaking',
    desc: 'Insert non-breaking spaces.',
    options: [
      { name: 'nonbreaking_force_tab', desc: 'Insert non-breaking spaces on Tab.' },
      { name: 'nonbreaking_wrap', desc: 'Wrap non-breaking spaces in a span.' },
    ],
  },
  {
    name: 'pagebreak',
    desc: 'Insert page-break markers.',
    options: [
      { name: 'pagebreak_separator', desc: 'Markup used for the page break.' },
      { name: 'pagebreak_split_block', desc: 'Split the block at the page break.' },
    ],
  },
  { name: 'preview', desc: 'Preview content as it will render on the page.', options: [] },
  {
    name: 'quickbars',
    desc: 'Contextual quick toolbars for insert/selection.',
    options: [
      { name: 'quickbars_image_toolbar', desc: 'Toolbar shown on a selected image.' },
      { name: 'quickbars_insert_toolbar', desc: 'Toolbar shown on an empty line.' },
      { name: 'quickbars_selection_toolbar', desc: 'Toolbar shown on a text selection.' },
    ],
  },
  {
    name: 'save',
    desc: 'Adds save/cancel buttons wired to callbacks.',
    options: [
      { name: 'save_enablewhendirty', desc: 'Only enable Save when content changed.' },
      { name: 'save_oncancelcallback', desc: 'Called when Cancel is pressed.' },
      { name: 'save_onsavecallback', desc: 'Called when Save is pressed.' },
    ],
  },
  { name: 'searchreplace', desc: 'Find and replace text.', options: [] },
  {
    name: 'table',
    desc: 'Insert and edit tables.',
    options: [
      { name: 'table_advtab', desc: 'Show the Advanced table tab.' },
      { name: 'table_appearance_options', desc: 'Show appearance fields in the dialog.' },
      { name: 'table_background_color_map', desc: 'Preset background colors for cells.' },
      { name: 'table_border_color_map', desc: 'Preset border colors for tables.' },
      { name: 'table_border_styles', desc: 'Preset border styles.' },
      { name: 'table_border_widths', desc: 'Preset border widths.' },
      { name: 'table_cell_advtab', desc: 'Show the Advanced cell tab.' },
      { name: 'table_cell_class_list', desc: 'Class choices for cells.' },
      { name: 'table_class_list', desc: 'Class choices for tables.' },
      { name: 'table_grid', desc: 'Show the grid selector for new tables.' },
      { name: 'table_row_advtab', desc: 'Show the Advanced row tab.' },
      { name: 'table_row_class_list', desc: 'Class choices for rows.' },
      { name: 'table_toolbar', desc: 'Toolbar shown when a table is selected.' },
    ],
  },
  {
    name: 'visualblocks',
    desc: 'Outline block elements with visible borders.',
    options: [{ name: 'visualblocks_default_state', desc: 'Start with visual blocks enabled.' }],
  },
  {
    name: 'visualchars',
    desc: 'Show invisible characters (non-breaking spaces, etc.).',
    options: [{ name: 'visualchars_default_state', desc: 'Start with invisible characters shown.' }],
  },
  { name: 'wordcount', desc: 'Live word/character count in the status bar.', options: [] },
];
