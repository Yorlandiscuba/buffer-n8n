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
			{
				displayName: 'Channel Service',
				name: 'channelService',
				type: 'hidden',
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
					},
				},
				default: '={{ $parameter["channelId"].split("|")[1] }}',
				description: 'The service type of the selected channel (auto-populated)',
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
						channelService: ['instagram', 'tiktok', 'youtube', 'Instagram', 'TikTok', 'YouTube', 'INSTAGRAM', 'TIKTOK', 'YOUTUBE'],
					},
				},
				default: 'automatic',
				description: 'How the post should be scheduled',
			},
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
			// ----------------------------------
			//         Post: Create - Images
			// ----------------------------------
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
			// ----------------------------------
			//         Post: Create - Videos
			// ----------------------------------
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
					headers: {
						'Content-Type': 'application/json',
					},
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

				if (!organizationId) {
					return [];
				}

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
					headers: {
						'Content-Type': 'application/json',
					},
					body: {
						query,
						variables: {
							input: {
								organizationId,
								filter: {
									isLocked: false,
								},
							},
						},
					},
					json: true,
				});

				const channels = response.data?.channels || [];

				// Show all channels, marking disconnected ones so users can see they need reconnecting
				// Store value as "id|service" to enable conditional field display
				return channels
					.map((channel: { id: string; name: string; service: string; isDisconnected: boolean }) => ({
						name: channel.isDisconnected
							? `${channel.name} (${channel.service}) (Disconnected)`
							: `${channel.name} (${channel.service})`,
						value: channel.isDisconnected
							? `${channel.id}|${channel.service}|disconnected`
							: `${channel.id}|${channel.service}`,
					}));
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

						// Build content input
						const content: IDataObject = {};

						if (text) {
							content.text = text;
						}
						if (title) {
							content.title = title;
						}

						// Build the input
						const input: IDataObject = {
							organizationId,
							content,
						};

						// GraphQL mutation
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
										content {
											title
											text
										}
									}
									... on IdeaResponse {
										idea {
											id
											organizationId
											groupId
											position
											createdAt
											updatedAt
											content {
												title
												text
											}
										}
										refreshIdeas
									}
									... on InvalidInputError {
										message
									}
									... on UnauthorizedError {
										message
									}
									... on UnexpectedError {
										message
									}
									... on LimitReachedError {
										message
									}
								}
							}
						`;

						const body = {
							query: mutation,
							variables: { input },
						};

						const response = await this.helpers.httpRequestWithAuthentication.call(this, 'bufferApi', {
							method: 'POST' as IHttpRequestMethods,
							url: apiUrl,
							headers: {
								'Content-Type': 'application/json',
							},
							body,
							json: true,
						});

						// Check for GraphQL errors
						if (response.errors && response.errors.length > 0) {
							throw new NodeApiError(this.getNode(), response.errors[0], { itemIndex: i });
						}

						const result = response.data?.createIdea;

						// Check for mutation-level errors
						if (result?.message) {
							throw new NodeApiError(this.getNode(), result, { itemIndex: i });
						}

						// Handle IdeaResponse wrapper
						const idea = result?.idea || result;

						returnData.push({
							json: idea,
							pairedItem: { item: i },
						});
					}
				} else if (resource === 'post') {
					if (operation === 'create') {
						const channelIdComposite = this.getNodeParameter('channelId', i) as string;
						// Check if channel is disconnected (format: "id|service|disconnected")
						if (channelIdComposite.endsWith('|disconnected')) {
							throw new NodeOperationError(
								this.getNode(),
								'The selected channel is disconnected. Please reconnect it in Buffer before posting.',
								{ itemIndex: i },
							);
						}
						// Extract channel ID from composite value (format: "id|service")
						const channelId = channelIdComposite.split('|')[0];
						const postText = this.getNodeParameter('postText', i) as string;
						const shareMode = this.getNodeParameter('shareMode', i) as string;
						const attachmentType = this.getNodeParameter('attachmentType', i) as string;
						const schedulingType = this.getNodeParameter('schedulingType', i) as string;

						// Build the input
						const input: IDataObject = {
							channelId,
							mode: shareMode,
							schedulingType,
						};

						// Add text if provided
						if (postText) {
							input.text = postText;
						}

						// Handle image attachments
						if (attachmentType === 'image') {
							const imageUrl = this.getNodeParameter('imageUrl', i) as string;

							// Validate image URL
							if (!imageUrl || imageUrl.trim() === '') {
								throw new NodeApiError(
									this.getNode(),
									{ message: 'Image URL is required and cannot be empty' },
									{ itemIndex: i },
								);
							}

							// Validate URL format
							let parsedUrl: URL;
							try {
								parsedUrl = new URL(imageUrl);
							} catch {
								throw new NodeApiError(
									this.getNode(),
									{ message: `Invalid image URL format: "${imageUrl}" is not a valid URL` },
									{ itemIndex: i },
								);
							}

							if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
								throw new NodeApiError(
									this.getNode(),
									{ message: `Invalid image URL protocol: URL must use HTTP or HTTPS (got ${parsedUrl.protocol})` },
									{ itemIndex: i },
								);
							}

							const imageInput: IDataObject = { url: imageUrl };

							// Validate and add optional thumbnail URL
							const imageThumbnailUrl = this.getNodeParameter('imageThumbnailUrl', i) as string;
							if (imageThumbnailUrl && imageThumbnailUrl.trim() !== '') {
								// Validate thumbnail URL format
								let parsedThumbUrl: URL;
								try {
									parsedThumbUrl = new URL(imageThumbnailUrl);
								} catch {
									throw new NodeApiError(
										this.getNode(),
										{ message: `Invalid thumbnail URL format: "${imageThumbnailUrl}" is not a valid URL` },
										{ itemIndex: i },
									);
								}

								if (parsedThumbUrl.protocol !== 'http:' && parsedThumbUrl.protocol !== 'https:') {
									throw new NodeApiError(
										this.getNode(),
										{ message: `Invalid thumbnail URL protocol: URL must use HTTP or HTTPS (got ${parsedThumbUrl.protocol})` },
										{ itemIndex: i },
									);
								}

								imageInput.thumbnailUrl = imageThumbnailUrl;
							}

							// Handle metadata (altText)
							const imageAltText = this.getNodeParameter('imageAltText', i) as string;
							if (imageAltText && imageAltText.trim() !== '') {
								imageInput.metadata = {
									altText: imageAltText,
								};
							}

							input.assets = [{ image: imageInput }];
						} else if (attachmentType === 'video') {
							const videoUrl = this.getNodeParameter('videoUrl', i) as string;

							// Validate video URL
							if (!videoUrl || videoUrl.trim() === '') {
								throw new NodeApiError(
									this.getNode(),
									{ message: 'Video URL is required and cannot be empty' },
									{ itemIndex: i },
								);
							}

							// Validate URL format
							let parsedUrl: URL;
							try {
								parsedUrl = new URL(videoUrl);
							} catch {
								throw new NodeApiError(
									this.getNode(),
									{ message: `Invalid video URL format: "${videoUrl}" is not a valid URL` },
									{ itemIndex: i },
								);
							}

							if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
								throw new NodeApiError(
									this.getNode(),
									{ message: `Invalid video URL protocol: URL must use HTTP or HTTPS (got ${parsedUrl.protocol})` },
									{ itemIndex: i },
								);
							}

							const videoInput: IDataObject = { url: videoUrl };

							// Validate and add optional thumbnail URL
							const videoThumbnailUrl = this.getNodeParameter('videoThumbnailUrl', i) as string;
							if (videoThumbnailUrl && videoThumbnailUrl.trim() !== '') {
								// Validate thumbnail URL format
								let parsedThumbUrl: URL;
								try {
									parsedThumbUrl = new URL(videoThumbnailUrl);
								} catch {
									throw new NodeApiError(
										this.getNode(),
										{ message: `Invalid thumbnail URL format: "${videoThumbnailUrl}" is not a valid URL` },
										{ itemIndex: i },
									);
								}

								if (parsedThumbUrl.protocol !== 'http:' && parsedThumbUrl.protocol !== 'https:') {
									throw new NodeApiError(
										this.getNode(),
										{ message: `Invalid thumbnail URL protocol: URL must use HTTP or HTTPS (got ${parsedThumbUrl.protocol})` },
										{ itemIndex: i },
									);
								}

								videoInput.thumbnailUrl = videoThumbnailUrl;
							}

							input.assets = [{ video: videoInput }];
						}

						// Add dueAt if custom scheduled
						if (shareMode === 'customScheduled') {
							const dueAt = this.getNodeParameter('dueAt', i) as string;
							// Ensure ISO 8601 format with timezone
							input.dueAt = new Date(dueAt).toISOString();
						}

						// GraphQL mutation
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
									... on InvalidInputError {
										message
									}
									... on UnauthorizedError {
										message
									}
									... on UnexpectedError {
										message
									}
									... on NotFoundError {
										message
									}
									... on LimitReachedError {
										message
									}
									... on RestProxyError {
										message
										code
										link
									}
								}
							}
						`;

						const body = {
							query: mutation,
							variables: { input },
						};

						const response = await this.helpers.httpRequestWithAuthentication.call(this, 'bufferApi', {
							method: 'POST' as IHttpRequestMethods,
							url: apiUrl,
							headers: {
								'Content-Type': 'application/json',
							},
							body,
							json: true,
						});

						// Check for GraphQL errors
						if (response.errors && response.errors.length > 0) {
							throw new NodeApiError(this.getNode(), response.errors[0], { itemIndex: i });
						}

						const result = response.data?.createPost;

						// Check for mutation-level errors
						if (result?.message) {
							throw new NodeApiError(this.getNode(), result, { itemIndex: i });
						}

						// Return the post
						const post = result?.post;

						returnData.push({
							json: post,
							pairedItem: { item: i },
						});
					}
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
