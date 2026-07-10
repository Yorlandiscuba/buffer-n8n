# n8n-nodes-buffer (Enhanced)

This is an **enhanced fork** of the official n8n community node for [Buffer](https://buffer.com). It adds missing platform-specific required fields for Facebook and YouTube channels that were causing API errors.

**Original repo:** https://github.com/bufferapp/buffer-n8n  
**Enhancements by:** Yorlandis Cuba

## ✨ Enhancements over original

- **Facebook Post Type** selector (Post / Story / Reel) — required by Buffer API
- **YouTube required fields:**
  - Video Title (required)
  - Category (required) — YouTube category IDs (e.g., 22 = People & Blogs, 27 = Education)
  - Privacy Status (optional) — Public / Private / Unlisted
  - Tags (optional) — comma-separated

These fields now appear automatically when you select a Facebook or YouTube channel, just like "Instagram Post Type" already did for Instagram.

## Features

- **Create Ideas** - Save content ideas to your Buffer account
- **Create Posts** - Publish to social channels (X, Instagram, TikTok, YouTube, Facebook, LinkedIn, etc.)
- **Flexible Scheduling** - Publish immediately, add to queue, or schedule for a specific time
- **Media Support** - Attach images or videos to your posts
- **Multi-Channel** - Post to any connected Buffer channel

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

```bash
npm install @yorlandiscuba/n8n-nodes-buffer
```

## Credentials

You need a Buffer API key to use this node. Learn more [here](https://developers.buffer.com/) to get setup!

## Operations

### Idea

| Operation | Description |
|-----------|-------------|
| Create | Create a new idea in Buffer |

**Create Idea Fields:**
- **Organization** - Select your Buffer organization
- **Text** - The content of your idea
- **Title** (optional) - A headline for the idea

### Post

| Operation | Description |
|-----------|-------------|
| Create | Create a new post for publishing |

**Create Post Fields:**
- **Organization** - Select your Buffer organization
- **Channel** - The social channel to post to
- **Text** - The post content
- **Share Mode** - "Share Now", "Add to Queue", or "Custom Schedule"
- **Scheduled At** (for Custom Schedule) - ISO 8601 datetime
- **Scheduling Type** (for Instagram/TikTok/YouTube) - "Automatic" or "Notification"

#### Platform-Specific Fields (NEW)

**Facebook** (when Facebook channel selected):
- **Facebook Post Type** (required) - Post / Story / Reel
- **First Comment** (optional) - Text for first comment
- **Link Attachment URL** (optional) - URL for link preview

**YouTube** (when YouTube channel selected):
- **Video Title** (required) - The YouTube video title
- **Category** (required) - YouTube category ID (e.g., 22 = People & Blogs)
- **Privacy Status** (optional) - Public / Private / Unlisted
- **Tags** (optional) - Comma-separated tags

**Instagram** (when Instagram channel selected):
- **Instagram Post Type** (required) - Post / Story / Reel
- **First Comment** (optional)
- **Shop Grid Link** (optional)
- **Share to Feed** (optional) - For Reels/Stories

**Google Business** (when Google Business channel selected):
- **Google Business Post Type** (required) - What's New / Offer / Event
- Type-specific fields (button, dates, title, etc.)

## Media Options

- **Attachment Type** - None, Image, or Video
- **Image URL** - Public URL to an image (must be HTTP/HTTPS)
- **Video URL** - Public URL to a video (must be HTTP/HTTPS)
- **Thumbnail URL** (optional) - Custom thumbnail for media
- **Alt Text** (optional, images only) - Accessibility description

## Compatibility

- n8n Nodes API version 1

## Resources

- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Buffer](https://buffer.com)
- [Developer Portal](https://developers.buffer.com/)
- [Original Buffer n8n Node](https://github.com/bufferapp/buffer-n8n)

## License

[MIT](LICENSE.md) - Based on work by [Joe Birch](https://github.com/bufferapp/buffer-n8n) (Buffer, Inc.)
