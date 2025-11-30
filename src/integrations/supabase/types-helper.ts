// Helper file to ensure proper type resolution
import type { Database } from './types';

export type Tables = Database['public']['Tables'];
export type Enums = Database['public']['Enums'];
export type Functions = Database['public']['Functions'];

// Table row types
export type AdminRequest = Tables['admin_requests']['Row'];
export type Complaint = Tables['complaints']['Row'];
export type ComplaintComment = Tables['complaint_comments']['Row'];
export type ComplaintAttachment = Tables['complaint_attachments']['Row'];
export type Profile = Tables['profiles']['Row'];
export type UserRole = Tables['user_roles']['Row'];
export type VerificationCode = Tables['verification_codes']['Row'];

// Insert types
export type AdminRequestInsert = Tables['admin_requests']['Insert'];
export type ComplaintInsert = Tables['complaints']['Insert'];
export type ComplaintCommentInsert = Tables['complaint_comments']['Insert'];
export type ComplaintAttachmentInsert = Tables['complaint_attachments']['Insert'];
export type ProfileInsert = Tables['profiles']['Insert'];
export type UserRoleInsert = Tables['user_roles']['Insert'];

// Update types
export type AdminRequestUpdate = Tables['admin_requests']['Update'];
export type ComplaintUpdate = Tables['complaints']['Update'];
export type ProfileUpdate = Tables['profiles']['Update'];

// Enum types
export type AppRole = Enums['app_role'];
