import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	IHttpRequestMethods,
} from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';

export class Buffer implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Buffer',
		name: 'buffer',
		icon: {
			light: 'file:../../icons/logo.svg',
			dark: 'file:../../icons/logo.dark.svg',
		} as const,
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Buffer to manage ideas and posts',
		defaults: {
			name: 'Buffer',
		},
		inputs: ['main'],
		outputs: ['main'],
		usableAsTool: true,
		credentials: [
			{
				name: 'bufferApi',
				required: true,
			},
		],
		properties: [
			// ----------------------------------
			//         Resources
			// ----------------------------------
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Idea',
						value: 'idea',
					},
					{
						name: 'Post',
						value: 'post',
					},
				],
				default: 'idea',
			},
			// ----------------------------------
			//         Operations
			// ----------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['idea'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new idea',
						action: 'Create an idea',
					},
				],
				default: 'create',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['post'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new post',
						action: 'Create a post',
					},
				],
				default: 'create',
			},
			// ----------------------------------
			//         Idea: Create
			// ----------------------------------
			{
				displayName: 'Organization Name or ID',
				name: 'organizationId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getOrganizations',
				},
				required: true,
				displayOptions: {
					show: {
						resource: ['idea'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},
			{
				displayName: 'Text',
				name: 'text',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				displayOptions: {
					show: {
						resource: ['idea'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'The main body text or description of the idea',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['idea'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'Title or headline of the idea (optional)',
			},
			// ----------------------------------
			//         Post: Create
			// ----------------------------------
			{
				displayName: 'Organization Name or ID',
				name: 'organizationId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getOrganizations',
				},
				required: true,
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},
			{
				displayName: 'Channel Name or ID',
				name: 'channelId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getChannels',
					loadOptionsDependsOn: ['organizationId'],
				},
				required: true,
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},
			// channelService: populated automatically from channelId via expression.
			// Used by displayOptions below to show platform-specific fields.
			// The value format from getChannels is "channelId|service", so we extract the service part.
			{
				displayName: 'Channel Service',
				name: 'channelService',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getChannelServices',
					loadOptionsDependsOn: ['organizationId'],
				},
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'The platform of the selected channel (auto-populated — do not change)',
			},
			{
				displayName: 'Text',
				name: 'postText',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'The text content of the post (optional for image posts)',
			},
			{
				displayName: 'Share Mode',
				name: 'shareMode',
				type: 'options',
				options: [
					{
						name: 'Share Now',
						value: 'shareNow',
						description: 'Publish the post immediately',
					},
					{
						name: 'Add to Queue',
						value: 'addToQueue',
						description: 'Add the post to the publishing queue',
					},
					{
						name: 'Share Next',
						value: 'shareNext',
						description: 'Add the post to the front of the queue',
					},
					{
						name: 'Custom Schedule',
						value: 'customScheduled',
						description: 'Schedule the post for a specific time',
					},
				],
				required: true,
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
					},
				},
				default: 'shareNow',
				description: 'When to publish the post',
			},
			{
				displayName: 'Scheduled Time',
				name: 'dueAt',
				type: 'dateTime',
				required: true,
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
						shareMode: ['customScheduled'],
					},
				},
				default: '',
				description: 'The date and time to publish the post. Example: 2026-03-26T10:28:47.545Z.',
			},
			{
				displayName: 'Scheduling Mode',
				name: 'schedulingType',
				type: 'options',
				options: [
					{
						name: 'Automatic',
						value: 'automatic',
						description: 'Post will be published automatically at the scheduled time',
					},
					{
						name: 'Notification',
						value: 'notification',
						description: 'You will receive a notification to manually publish the post',
					},
				],
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
						channelService: ['instagram', 'tiktok', 'youtube', 'facebook_group', 'facebook_page', 'facebook'],
					},
				},
				default: 'automatic',
				description: 'How the post should be scheduled',
			},
			// ----------------------------------
			//   Facebook fields
			// ----------------------------------
			{
				displayName: 'Facebook Post Type',
				name: 'facebookPostType',
				type: 'options',
				options: [
					{
						name: 'Post',
						value: 'post',
						description: 'A standard Facebook feed post',
					},
					{
						name: 'Story',
						value: 'story',
						description: 'A Facebook story',
					},
					{
						name: 'Reel',
						value: 'reel',
						description: 'A Facebook reel',
					},
				],
				required: true,
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
						channelService: ['facebook_page', 'facebook', 'facebookpage'],
					},
				},
				default: 'post',
				description: 'The type of Facebook post to create',
			},
			{
				displayName: 'Reel Title',
				name: 'facebookReelTitle',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
						channelService: ['facebook_page', 'facebook', 'facebookpage'],
						facebookPostType: ['reel'],
					},
				},
				default: '',
				description: 'Title of the Facebook Reel (required for Reel posts)',
			},
			{
				displayName: 'First Comment',
				name: 'facebookFirstComment',
				type: 'string',
				typeOptions: {
					rows: 2,
				},
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
						channelService: ['facebook_page', 'facebook', 'facebookpage'],
					},
				},
				default: '',
				description: 'Text for the first comment on the Facebook post',
			},
			{
				displayName: 'Link Attachment URL',
				name: 'facebookLinkAttachment',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
						channelService: ['facebook_page', 'facebook', 'facebookpage'],
					},
				},
				default: '',
				description: 'URL for a link preview attachment. Mutually exclusive with video assets.',
			},
			// ----------------------------------
			//   Instagram fields
			// ----------------------------------
			{
				displayName: 'Instagram Post Type',
				name: 'instagramPostType',
				type: 'options',
				options: [
					{
						name: 'Post',
						value: 'post',
						description: 'A standard Instagram feed post',
					},
					{
						name: 'Story',
						value: 'story',
						description: 'An Instagram story',
					},
					{
						name: 'Reel',
						value: 'reel',
						description: 'An Instagram reel',
					},
				],
				required: true,
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
						channelService: ['instagram'],
					},
				},
				default: 'post',
				description: 'The type of Instagram post to create',
			},
			{
				displayName: 'First Comment',
				name: 'instagramFirstComment',
				type: 'string',
				typeOptions: {
					rows: 2,
				},
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
						channelService: ['instagram'],
					},
				},
				default: '',
				description: 'Text for the first comment on the Instagram post',
			},
			{
				displayName: 'Shop Grid Link',
				name: 'instagramLink',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
						channelService: ['instagram'],
					},
				},
				default: '',
				description: 'Shop Grid link for the post',
			},
			{
				displayName: 'Share to Feed',
				name: 'instagramShareToFeed',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
						channelService: ['instagram'],
					},
				},
				default: true,
				description: 'Whether the post should also appear on your Instagram feed (relevant for reels and stories)',
			},
			// ----------------------------------
			//         YouTube fields
			// ----------------------------------
			{
				displayName: 'Video Title',
				name: 'youtubeTitle',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
						channelService: ['youtube'],
					},
				},
				default: '',
				description: 'The title of the YouTube video (required for YouTube posts)',
			},
			{
				displayName: 'Category',
				name: 'youtubeCategoryId',
				type: 'options',
				options: [
					{ name: 'Film & Animation', value: '1' },
					{ name: 'Autos & Vehicles', value: '2' },
					{ name: 'Music', value: '10' },
					{ name: 'Pets & Animals', value: '15' },
					{ name: 'Sports', value: '17' },
					{ name: 'Short Movies', value: '18' },
					{ name: 'Travel & Events', value: '19' },
					{ name: 'Gaming', value: '20' },
					{ name: 'Videoblogging', value: '21' },
					{ name: 'People & Blogs', value: '22' },
					{ name: 'Comedy', value: '23' },
					{ name: 'Entertainment', value: '24' },
					{ name: 'News & Politics', value: '25' },
					{ name: 'Howto & Style', value: '26' },
					{ name: 'Education', value: '27' },
					{ name: 'Science & Technology', value: '28' },
					{ name: 'Nonprofits & Activism', value: '29' },
					{ name: 'Movies', value: '30' },
					{ name: 'Anime/Animation', value: '31' },
					{ name: 'Action/Adventure', value: '32' },
					{ name: 'Classics', value: '33' },
					{ name: 'Documentary', value: '35' },
					{ name: 'Drama', value: '36' },
					{ name: 'Family', value: '37' },
					{ name: 'Foreign', value: '38' },
					{ name: 'Horror', value: '39' },
					{ name: 'Sci-Fi/Fantasy', value: '40' },
					{ name: 'Thriller', value: '41' },
					{ name: 'Shorts', value: '42' },
					{ name: 'Shows', value: '43' },
					{ name: 'Trailers', value: '44' },
				],
				required: true,
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
						channelService: ['youtube'],
					},
				},
				default: '22',
				description: 'YouTube video category (required)',
			},
			{
				displayName: 'Privacy Status',
				name: 'youtubePrivacyStatus',
				type: 'options',
				options: [
					{ name: 'Public', value: 'public' },
					{ name: 'Private', value: 'private' },
					{ name: 'Unlisted', value: 'unlisted' },
				],
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
						channelService: ['youtube'],
					},
				},
				default: 'public',
				description: 'Privacy status of the video',
			},
			{
				displayName: 'Tags',
				name: 'youtubeTags',
				type: 'string',
				typeOptions: {
					rows: 2,
				},
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
						channelService: ['youtube'],
					},
				},
				default: '',
				description: 'Comma-separated list of tags for the video',
			},
			// ----------------------------------
			//   Google Business fields
			// ----------------------------------
			{
				displayName: 'Google Business Post Type',
				name: 'googlePostType',
				type: 'options',
				options: [
					{
						name: "What's New",
						value: 'whats_new',
						description: 'A standard Google Business post',
					},
					{
						name: 'Offer',
						value: 'offer',
						description: 'A Google Business offer',
					},
					{
						name: 'Event',
						value: 'event',
						description: 'A Google Business event',
					},
				],
				required: true,
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
						channelService: ['google', 'googlebusiness', 'google_business'],
					},
				},
				default: 'whats_new',
				description: 'The type of Google Business post to create',
			},
			{
				displayName: 'Action Button',
				name: 'googleWhatsNewButton',
				type: 'options',
				options: [
					{ name: 'Book', value: 'book' },
					{ name: 'Call', value: 'call' },
					{ name: 'Learn More', value: 'learn_more' },
					{ name: 'None', value: 'none' },
					{ name: 'Order', value: 'order' },
					{ name: 'Shop', value: 'shop' },
					{ name: 'Sign Up', value: 'signup' },
				],
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
						channelService: ['google', 'googlebusiness', 'google_business'],
						googlePostType: ['whats_new'],
					},
				},
				default: 'none',
				description: 'The call-to-action button for the post',
			},
			{
				displayName: 'Action Button Link',
				name: 'googleWhatsNewLink',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
						channelService: ['google', 'googlebusiness', 'google_business'],
						googlePostType: ['whats_new'],
					},
				},
				default: '',
				description: 'URL for the action button',
			},
			{
				displayName: 'Offer Title',
				name: 'googleOfferTitle',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
						channelService: ['google', 'googlebusiness', 'google_business'],
						googlePostType: ['offer'],
					},
				},
				default: '',
				description: 'Title of the offer',
			},
			{
				displayName: 'Offer Start Date',
				name: 'googleOfferStartDate',
				type: 'dateTime',
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
						channelService: ['google', 'googlebusiness', 'google_business'],
						googlePostType: ['offer'],
					},
				},
				default: '',
				description: 'Start date of the offer',
			},
			{
				displayName: 'Offer End Date',
				name: 'googleOfferEndDate',
				type: 'dateTime',
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
						channelService: ['google', 'googlebusiness', 'google_business'],
						googlePostType: ['offer'],
					},
				},
				default: '',
				description: 'End date of the offer',
			},
			{
				displayName: 'Coupon Code',
				name: 'googleOfferCode',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
						channelService: ['google', 'googlebusiness', 'google_business'],
						googlePostType: ['offer'],
					},
				},
				default: '',
				description: 'Coupon code for the offer',
			},
			{
				displayName: 'Offer Link',
				name: 'googleOfferLink',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
						channelService: ['google', 'googlebusiness', 'google_business'],
						googlePostType: ['offer'],
					},
				},
				default: '',
				description: 'Link to the offer',
			},
			{
				displayName: 'Terms & Conditions',
				name: 'googleOfferTerms',
				type: 'string',
				typeOptions: {
					rows: 3,
				},
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
						channelService: ['google', 'googlebusiness', 'google_business'],
						googlePostType: ['offer'],
					},
				},
				default: '',
				description: 'Terms and conditions of the offer',
			},
			{
				displayName: 'Event Title',
				name: 'googleEventTitle',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
						channelService: ['google', 'googlebusiness', 'google_business'],
						googlePostType: ['event'],
					},
				},
				default: '',
				description: 'Title of the event',
			},
			{
				displayName: 'Event Start Date',
				name: 'googleEventStartDate',
				type: 'dateTime',
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
						channelService: ['google', 'googlebusiness', 'google_business'],
						googlePostType: ['event'],
					},
				},
				default: '',
				description: 'Start date of the event',
			},
			{
				displayName: 'Event End Date',
				name: 'googleEventEndDate',
				type: 'dateTime',
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
						channelService: ['google', 'googlebusiness', 'google_business'],
						googlePostType: ['event'],
					},
				},
				default: '',
				description: 'End date of the event',
			},
			{
				displayName: 'Full Day Event',
				name: 'googleEventIsFullDay',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
						channelService: ['google', 'googlebusiness', 'google_business'],
						googlePostType: ['event'],
					},
				},
				default: false,
				description: 'Whether the event is a full day event (no specific start/end time)',
			},
			{
				displayName: 'Action Button',
				name: 'googleEventButton',
				type: 'options',
				options: [
					{ name: 'Book', value: 'book' },
					{ name: 'Call', value: 'call' },
					{ name: 'Learn More', value: 'learn_more' },
					{ name: 'None', value: 'none' },
					{ name: 'Order', value: 'order' },
					{ name: 'Shop', value: 'shop' },
					{ name: 'Sign Up', value: 'signup' },
				],
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
						channelService: ['google', 'googlebusiness', 'google_business'],
						googlePostType: ['event'],
					},
				},
				default: 'none',
				description: 'The call-to-action button for the event',
			},
			{
				displayName: 'Action Button Link',
				name: 'googleEventLink',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
						channelService: ['google', 'googlebusiness', 'google_business'],
						googlePostType: ['event'],
					},
				},
				default: '',
				description: 'URL for the action button',
			},
			// ----------------------------------
			//   Attachment fields
			// ----------------------------------
			{
				displayName: 'Attachment Type',
				name: 'attachmentType',
				type: 'options',
				options: [
					{
						name: 'No Attachment',
						value: 'none',
						description: 'Create a text-only post',
					},
					{
						name: 'Image',
						value: 'image',
						description: 'Create a post with an image',
					},
					{
						name: 'Video',
						value: 'video',
						description: 'Create a post with a video',
					},
				],
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
					},
				},
				default: 'none',
				description: 'Type of attachment to add to the post',
			},
			{
				displayName: 'Image URL',
				name: 'imageUrl',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
						attachmentType: ['image'],
					},
				},
				default: '',
				description: 'The publicly accessible URL of the image (must be HTTP/HTTPS)',
			},
			{
				displayName: 'Alt Text',
				name: 'imageAltText',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
						attachmentType: ['image'],
					},
				},
				default: '',
				description: 'Alternative text describing the image for accessibility',
			},
			{
				displayName: 'Image Thumbnail URL',
				name: 'imageThumbnailUrl',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
						attachmentType: ['image'],
					},
				},
				default: '',
				description: 'Optional URL for a thumbnail version of the image',
			},
			{
				displayName: 'Video URL',
				name: 'videoUrl',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
						attachmentType: ['video'],
					},
				},
				default: '',
				description: 'The publicly accessible URL of the video (must be HTTP/HTTPS)',
			},
			{
				displayName: 'Video Thumbnail URL',
				name: 'videoThumbnailUrl',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
						attachmentType: ['video'],
					},
				},
				default: '',
				description: 'Optional URL for a thumbnail version of the video',
			},
		],
	};

	methods = {
		loadOptions: {
			async getOrganizations(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const credentials = await this.getCredentials('bufferApi');
				const apiUrl = (credentials.apiUrl as string) || 'https://api.buffer.com/graphql';

				const query = `
					query {
						account {
							organizations {
								id
								name
							}
						}
					}
				`;

				const response = await this.helpers.httpRequestWithAuthentication.call(this, 'bufferApi', {
					method: 'POST' as IHttpRequestMethods,
					url: apiUrl,
					headers: { 'Content-Type': 'application/json' },
					body: { query },
					json: true,
				});

				const organizations = response.data?.account?.organizations || [];
				return organizations.map((org: { id: string; name: string }) => ({
					name: org.name,
					value: org.id,
				}));
			},

			async getChannels(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const credentials = await this.getCredentials('bufferApi');
				const apiUrl = (credentials.apiUrl as string) || 'https://api.buffer.com/graphql';
				const organizationId = this.getNodeParameter('organizationId') as string;

				if (!organizationId) return [];

				const query = `
					query GetChannels($input: ChannelsInput!) {
						channels(input: $input) {
							id
							name
							service
							isLocked
							isDisconnected
						}
					}
				`;

				const response = await this.helpers.httpRequestWithAuthentication.call(this, 'bufferApi', {
					method: 'POST' as IHttpRequestMethods,
					url: apiUrl,
					headers: { 'Content-Type': 'application/json' },
					body: {
						query,
						variables: {
							input: { organizationId, filter: { isLocked: false } },
						},
					},
					json: true,
				});

				const channels = response.data?.channels || [];

				// Value format: "channelId|service" — service is used by channelService loadOptions
				return channels.map((channel: { id: string; name: string; service: string; isDisconnected: boolean }) => ({
					name: channel.isDisconnected
						? `${channel.name} (${channel.service}) (Disconnected)`
						: `${channel.name} (${channel.service})`,
					value: channel.isDisconnected
						? `${channel.id}|${channel.service}|disconnected`
						: `${channel.id}|${channel.service}`,
				}));
			},

			// Returns a list where value = service name (lowercase).
			// This mirrors getChannels but with service as the option value,
			// so that displayOptions can filter on channelService: ['instagram'] etc.
			async getChannelServices(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const credentials = await this.getCredentials('bufferApi');
				const apiUrl = (credentials.apiUrl as string) || 'https://api.buffer.com/graphql';
				const organizationId = this.getNodeParameter('organizationId') as string;

				if (!organizationId) return [];

				const query = `
					query GetChannels($input: ChannelsInput!) {
						channels(input: $input) {
							id
							name
							service
							isLocked
							isDisconnected
						}
					}
				`;

				const response = await this.helpers.httpRequestWithAuthentication.call(this, 'bufferApi', {
					method: 'POST' as IHttpRequestMethods,
					url: apiUrl,
					headers: { 'Content-Type': 'application/json' },
					body: {
						query,
						variables: {
							input: { organizationId, filter: { isLocked: false } },
						},
					},
					json: true,
				});

				const channels = response.data?.channels || [];

				// De-duplicate by service so the user sees one entry per platform
				const seen = new Set<string>();
				const options: INodePropertyOptions[] = [];
				for (const ch of channels as { id: string; name: string; service: string; isDisconnected: boolean }[]) {
					const svc = ch.service.toLowerCase();
					if (!seen.has(svc)) {
						seen.add(svc);
						options.push({ name: ch.service, value: svc });
					}
				}
				return options;
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		const credentials = await this.getCredentials('bufferApi');
		const apiUrl = (credentials.apiUrl as string) || 'https://api.buffer.com/graphql';

		for (let i = 0; i < items.length; i++) {
			try {
				if (resource === 'idea') {
					if (operation === 'create') {
						const organizationId = this.getNodeParameter('organizationId', i) as string;
						const text = this.getNodeParameter('text', i) as string;
						const title = this.getNodeParameter('title', i) as string;

						const content: IDataObject = {};
						if (text) content.text = text;
						if (title) content.title = title;

						const input: IDataObject = { organizationId, content };

						const mutation = `
							mutation CreateIdea($input: CreateIdeaInput!) {
								createIdea(input: $input) {
									... on Idea {
										id
										organizationId
										groupId
										position
										createdAt
										updatedAt
										content { title text }
									}
									... on IdeaResponse {
										idea {
											id
											organizationId
											groupId
											position
											createdAt
											updatedAt
											content { title text }
										}
										refreshIdeas
									}
									... on InvalidInputError { message }
									... on UnauthorizedError { message }
									... on UnexpectedError { message }
									... on LimitReachedError { message }
								}
							}
						`;

						const response = await this.helpers.httpRequestWithAuthentication.call(this, 'bufferApi', {
							method: 'POST' as IHttpRequestMethods,
							url: apiUrl,
							headers: { 'Content-Type': 'application/json' },
							body: { query: mutation, variables: { input } },
							json: true,
						});

						if (response.errors?.length > 0) {
							throw new NodeApiError(this.getNode(), response.errors[0], { itemIndex: i });
						}

						const result = response.data?.createIdea;
						if (result?.message) {
							throw new NodeApiError(this.getNode(), result, { itemIndex: i });
						}

						const idea = result?.idea || result;
						returnData.push({ json: idea, pairedItem: { item: i } });
					}
				} else if (resource === 'post') {
					if (operation === 'create') {
						const channelIdComposite = this.getNodeParameter('channelId', i) as string;

						if (channelIdComposite.endsWith('|disconnected')) {
							throw new NodeOperationError(
								this.getNode(),
								'The selected channel is disconnected. Please reconnect it in Buffer before posting.',
								{ itemIndex: i },
							);
						}

						// channelId format: "realId|service"
						const channelId = channelIdComposite.split('|')[0];
						const channelService = (channelIdComposite.split('|')[1] || '').trim().toLowerCase();

						const postText = this.getNodeParameter('postText', i) as string;
						const shareMode = this.getNodeParameter('shareMode', i) as string;
						const attachmentType = this.getNodeParameter('attachmentType', i) as string;
						const schedulingType = this.getNodeParameter('schedulingType', i, 'automatic') as string;

						const input: IDataObject = {
							channelId,
							mode: shareMode,
							schedulingType,
							assets: [],
						};

						// Build platform-specific metadata
						if (channelService === 'instagram') {
							const instagramPostType = this.getNodeParameter('instagramPostType', i) as string;
							const shouldShareToFeed = this.getNodeParameter('instagramShareToFeed', i) as boolean;
							const instagramFirstComment = this.getNodeParameter('instagramFirstComment', i) as string;
							const instagramLink = this.getNodeParameter('instagramLink', i) as string;
							const instagramMeta: IDataObject = { type: instagramPostType, shouldShareToFeed };
							if (instagramFirstComment) instagramMeta.firstComment = instagramFirstComment;
							if (instagramLink) instagramMeta.link = instagramLink;
							input.metadata = { instagram: instagramMeta };

						} else if (['facebook_page', 'facebook', 'facebookpage'].includes(channelService)) {
							const facebookPostType = this.getNodeParameter('facebookPostType', i) as string;
							if (!facebookPostType || facebookPostType.trim() === '') {
								throw new NodeOperationError(
									this.getNode(),
									'Facebook Post Type is required for Facebook posts',
									{ itemIndex: i },
								);
							}
							const facebookFirstComment = this.getNodeParameter('facebookFirstComment', i) as string;
							const facebookLinkAttachment = this.getNodeParameter('facebookLinkAttachment', i) as string;
							const facebookMeta: IDataObject = { type: facebookPostType };
							if (facebookFirstComment) facebookMeta.firstComment = facebookFirstComment;
							if (facebookLinkAttachment) {
								facebookMeta.linkAttachment = {
									url: facebookLinkAttachment,
									text: postText || '',
									title: 'Facebook Post',
								};
							}
							// reelTitle is only present in the UI (and relevant to the API) when type === 'reel'
							if (facebookPostType === 'reel') {
								const facebookReelTitle = this.getNodeParameter('facebookReelTitle', i, '') as string;
								if (facebookReelTitle) facebookMeta.title = facebookReelTitle;
							}
							input.metadata = { facebook: facebookMeta };

						} else if (['google', 'googlebusiness', 'google_business'].includes(channelService)) {
							const googlePostType = this.getNodeParameter('googlePostType', i) as string;
							const googleMeta: IDataObject = { type: googlePostType };

							if (googlePostType === 'whats_new') {
								const button = this.getNodeParameter('googleWhatsNewButton', i) as string;
								const link = this.getNodeParameter('googleWhatsNewLink', i) as string;
								const details: IDataObject = {};
								if (button) details.button = button;
								if (link) details.link = link;
								googleMeta.detailsWhatsNew = details;
							} else if (googlePostType === 'offer') {
								const title = this.getNodeParameter('googleOfferTitle', i) as string;
								const startDate = this.getNodeParameter('googleOfferStartDate', i) as string;
								const endDate = this.getNodeParameter('googleOfferEndDate', i) as string;
								const code = this.getNodeParameter('googleOfferCode', i) as string;
								const link = this.getNodeParameter('googleOfferLink', i) as string;
								const terms = this.getNodeParameter('googleOfferTerms', i) as string;
								const details: IDataObject = {
									title,
									startDate: new Date(startDate).toISOString(),
									endDate: new Date(endDate).toISOString(),
								};
								if (code) details.code = code;
								if (link) details.link = link;
								if (terms) details.terms = terms;
								googleMeta.detailsOffer = details;
							} else if (googlePostType === 'event') {
								const title = this.getNodeParameter('googleEventTitle', i) as string;
								const startDate = this.getNodeParameter('googleEventStartDate', i) as string;
								const endDate = this.getNodeParameter('googleEventEndDate', i) as string;
								const isFullDay = this.getNodeParameter('googleEventIsFullDay', i) as boolean;
								const button = this.getNodeParameter('googleEventButton', i) as string;
								const link = this.getNodeParameter('googleEventLink', i) as string;
								const details: IDataObject = {
									title,
									startDate: new Date(startDate).toISOString(),
									endDate: new Date(endDate).toISOString(),
									isFullDayEvent: isFullDay,
								};
								if (button) details.button = button;
								if (link) details.link = link;
								googleMeta.detailsEvent = details;
							}
							input.metadata = { google: googleMeta };

						} else if (channelService === 'youtube') {
							const youtubeTitle = this.getNodeParameter('youtubeTitle', i) as string;
							const youtubeCategoryId = this.getNodeParameter('youtubeCategoryId', i) as string;
							const youtubePrivacyStatus = this.getNodeParameter('youtubePrivacyStatus', i) as string;
							const youtubeTags = this.getNodeParameter('youtubeTags', i) as string;

							if (!youtubeTitle || youtubeTitle.trim() === '') {
								throw new NodeOperationError(
									this.getNode(),
									'Video Title is required for YouTube posts',
									{ itemIndex: i },
								);
							}

							const youtubeMeta: IDataObject = {
								title: youtubeTitle,
								categoryId: youtubeCategoryId,
								privacyStatus: youtubePrivacyStatus,
								defaultToReminders: false,
							};
							if (youtubeTags && youtubeTags.trim() !== '') {
								youtubeMeta.tags = youtubeTags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0);
							}
							input.metadata = { youtube: youtubeMeta };
						}

						if (postText) input.text = postText;

						// Attachments
						if (attachmentType === 'image') {
							const imageUrl = this.getNodeParameter('imageUrl', i) as string;
							if (!imageUrl?.trim()) {
								throw new NodeApiError(this.getNode(), { message: 'Image URL is required' }, { itemIndex: i });
							}
							let parsedUrl: URL;
							try { parsedUrl = new URL(imageUrl); } catch {
								throw new NodeApiError(this.getNode(), { message: `Invalid image URL: ${imageUrl}` }, { itemIndex: i });
							}
							if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
								throw new NodeApiError(this.getNode(), { message: 'Image URL must use HTTP or HTTPS' }, { itemIndex: i });
							}
							const imageInput: IDataObject = { url: imageUrl };
							const imageThumbnailUrl = this.getNodeParameter('imageThumbnailUrl', i) as string;
							if (imageThumbnailUrl?.trim()) imageInput.thumbnailUrl = imageThumbnailUrl;
							const imageAltText = this.getNodeParameter('imageAltText', i) as string;
							if (imageAltText?.trim()) imageInput.metadata = { altText: imageAltText };
							input.assets = [{ image: imageInput }];

						} else if (attachmentType === 'video') {
							const videoUrl = this.getNodeParameter('videoUrl', i) as string;
							if (!videoUrl?.trim()) {
								throw new NodeApiError(this.getNode(), { message: 'Video URL is required' }, { itemIndex: i });
							}
							let parsedUrl: URL;
							try { parsedUrl = new URL(videoUrl); } catch {
								throw new NodeApiError(this.getNode(), { message: `Invalid video URL: ${videoUrl}` }, { itemIndex: i });
							}
							if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
								throw new NodeApiError(this.getNode(), { message: 'Video URL must use HTTP or HTTPS' }, { itemIndex: i });
							}
							const videoInput: IDataObject = { url: videoUrl };
							const videoThumbnailUrl = this.getNodeParameter('videoThumbnailUrl', i) as string;
							if (videoThumbnailUrl?.trim()) videoInput.thumbnailUrl = videoThumbnailUrl;
							input.assets = [{ video: videoInput }];
						}

						if (shareMode === 'customScheduled') {
							const dueAt = this.getNodeParameter('dueAt', i) as string;
							input.dueAt = new Date(dueAt).toISOString();
						}

						const mutation = `
							mutation CreatePost($input: CreatePostInput!) {
								createPost(input: $input) {
									... on PostActionSuccess {
										post {
											id
											status
											text
											dueAt
											sentAt
											createdAt
											updatedAt
											channelId
											channelService
											shareMode
											isCustomScheduled
											externalLink
											assets {
												id
												type
												mimeType
												source
												thumbnail
											}
										}
									}
									... on InvalidInputError { message }
									... on UnauthorizedError { message }
									... on UnexpectedError { message }
									... on NotFoundError { message }
									... on LimitReachedError { message }
									... on RestProxyError { message code link }
								}
							}
						`;

						const response = await this.helpers.httpRequestWithAuthentication.call(this, 'bufferApi', {
							method: 'POST' as IHttpRequestMethods,
							url: apiUrl,
							headers: { 'Content-Type': 'application/json' },
							body: { query: mutation, variables: { input } },
							json: true,
						});

						if (response.errors?.length > 0) {
							throw new NodeApiError(this.getNode(), response.errors[0], { itemIndex: i });
						}

						const result = response.data?.createPost;
						if (result?.message) {
							throw new NodeApiError(this.getNode(), result, { itemIndex: i });
						}

						returnData.push({ json: result?.post, pairedItem: { item: i } });
					}
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
