import { z } from 'zod';

const requestIdSchema = z.uuid();
const sessionIdSchema = z.uuid();

export const transcriptEntrySchema = z.strictObject({
  role: z.literal('assistant'),
  text: z.string().min(1).max(2_000),
});

export const webviewToHostMessageSchema = z.discriminatedUnion('type', [
  z.strictObject({
    type: z.literal('webview.ready'),
    requestId: requestIdSchema,
  }),
  z.strictObject({
    type: z.literal('webview.connectionCheck'),
    requestId: requestIdSchema,
    sessionId: sessionIdSchema,
  }),
]);

export const hostToWebviewMessageSchema = z.discriminatedUnion('type', [
  z.strictObject({
    type: z.literal('host.initialState'),
    requestId: requestIdSchema,
    sessionId: sessionIdSchema,
    connection: z.literal('mock_disconnected'),
    transcript: z.tuple([transcriptEntrySchema]),
  }),
  z.strictObject({
    type: z.literal('host.connectionCheckResult'),
    requestId: requestIdSchema,
    sessionId: sessionIdSchema,
    connection: z.literal('mock_ready'),
  }),
  z.strictObject({
    type: z.literal('host.error'),
    requestId: requestIdSchema.optional(),
    code: z.literal('invalid_message'),
    message: z.string().min(1).max(256),
  }),
]);

export type TranscriptEntry = z.infer<typeof transcriptEntrySchema>;
export type WebviewToHostMessage = z.infer<typeof webviewToHostMessageSchema>;
export type HostToWebviewMessage = z.infer<typeof hostToWebviewMessageSchema>;
