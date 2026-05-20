# n8n-nodes-buffer

This is an n8n community node for [Buffer](https://buffer.com). It lets you create ideas and publish posts to your social media channels directly from your n8n workflows.

[n8n](https://n8n.io/) is a fair-code licensed workflow automation platform.

## Features

- **Create Ideas** - Save content ideas to your Buffer account
- **Create Posts** - Publish to social channels (X, Instagram, TikTok, YouTube, Facebook, LinkedIn, etc.)
- **Flexible Scheduling** - Publish immediately, add to queue, or schedule for a specific time
- **Media Support** - Attach images or videos to your posts
- **Multi-Channel** - Post to any connected Buffer channel

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

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

**Media Options:**
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

## License

[MIT](LICENSE.md)
