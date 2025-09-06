import { z } from 'zod';

// Base schemas
export const areaSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  slug: z.string().min(1, 'Slug é obrigatório').max(100, 'Slug muito longo'),
});

export const subareaSchema = z.object({
  areaId: z.string().min(1, 'Área é obrigatória'),
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
});

export const simulatorGroupSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  context: z.string().min(1, 'Contexto é obrigatório').max(500, 'Contexto muito longo'),
  codeBase: z.string().min(1, 'Código base é obrigatório').max(20, 'Código base muito longo'),
});

export const attachmentTypeSchema = z.enum(['LINK', 'EMBED', 'FILE', 'NONE']);

export const roadmapStatusSchema = z.enum(['IDEIA', 'PROTOTIPO', 'PILOTO', 'PRODUCAO']);

export const userRoleSchema = z.enum(['VIEWER', 'EDITOR', 'ADMIN']);

// Simulator discipline schemas
export const simulatorDisciplineSchema = z.object({
  groupId: z.string().min(1, 'Grupo é obrigatório'),
  discipline: z.string().min(1, 'Disciplina é obrigatória').max(200, 'Disciplina muito longa'),
  areaId: z.string().min(1, 'Área é obrigatória'),
  subareaId: z.string().min(1, 'Subárea é obrigatória'),
  learningObjectives: z.string().min(1, 'Objetivos de aprendizagem são obrigatórios'),
  gameMechanics: z.string().min(1, 'Mecânicas do jogo são obrigatórias'),
  kpis: z.string().min(1, 'KPIs são obrigatórios'),
  syllabus: z.string().optional(),
  devObjectives: z.string().optional(),
  attachmentType: attachmentTypeSchema.default('NONE'),
  attachmentUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  attachmentFilePath: z.string().optional(),
  attachmentEmbedHtml: z.string().optional(),
  isPublished: z.boolean().default(false),
});

export const simulatorDisciplineUpdateSchema = simulatorDisciplineSchema.partial().extend({
  id: z.string().min(1, 'ID é obrigatório'),
});

export const syllabusUpdateSchema = z.object({
  id: z.string().min(1, 'ID é obrigatório'),
  syllabus: z.string().optional(),
  devObjectives: z.string().optional(),
});

export const attachmentUpdateSchema = z.object({
  id: z.string().min(1, 'ID é obrigatório'),
  attachmentType: attachmentTypeSchema,
  attachmentUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  attachmentFilePath: z.string().optional(),
  attachmentEmbedHtml: z.string().optional(),
});

// Roadmap schemas
export const roadmapSchema = z.object({
  groupId: z.string().min(1, 'Grupo é obrigatório'),
  status: roadmapStatusSchema.default('IDEIA'),
  reach: z.number().min(0, 'Reach deve ser maior ou igual a 0').max(100, 'Reach deve ser menor ou igual a 100'),
  impact: z.number().min(0, 'Impact deve ser maior ou igual a 0').max(100, 'Impact deve ser menor ou igual a 100'),
  confidence: z.number().min(0, 'Confidence deve ser maior ou igual a 0').max(100, 'Confidence deve ser menor ou igual a 100'),
  effort: z.number().min(0, 'Effort deve ser maior ou igual a 0').max(100, 'Effort deve ser menor ou igual a 100'),
});

export const roadmapUpdateSchema = roadmapSchema.partial().extend({
  id: z.string().min(1, 'ID é obrigatório'),
});

export const roadmapStatusUpdateSchema = z.object({
  id: z.string().min(1, 'ID é obrigatório'),
  status: roadmapStatusSchema,
});

// User schemas
export const userUpdateSchema = z.object({
  id: z.string().min(1, 'ID é obrigatório'),
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo').optional(),
  role: userRoleSchema,
});

// Query schemas
export const simulatorQuerySchema = z.object({
  groupId: z.string().optional(),
  areaId: z.string().optional(),
  subareaId: z.string().optional(),
  q: z.string().optional(),
  published: z.string().transform((val) => val === 'true').optional(),
  page: z.string().transform((val) => parseInt(val, 10)).default('1'),
  limit: z.string().transform((val) => parseInt(val, 10)).default('10'),
});

export const reportQuerySchema = z.object({
  top: z.string().transform((val) => parseInt(val, 10)).default('20'),
});

// File upload schemas
export const fileUploadSchema = z.object({
  file: z.instanceof(File, { message: 'Arquivo é obrigatório' }),
  type: z.string().min(1, 'Tipo é obrigatório'),
});

// Import/Export schemas
export const importExcelSchema = z.object({
  file: z.instanceof(File, { message: 'Arquivo Excel é obrigatório' }),
});

export const exportExcelSchema = z.object({
  format: z.enum(['xlsx', 'csv']).default('xlsx'),
  includeUnpublished: z.boolean().default(false),
});

// URL validation schemas
export const urlValidationSchema = z.object({
  url: z.string().url('URL inválida'),
});

export const embedValidationSchema = z.object({
  url: z.string().url('URL inválida').refine(
    (url) => {
      try {
        const urlObj = new URL(url);
        const allowedDomains = [
          'itch.io',
          'sketchfab.com',
          'youtube.com',
          'vimeo.com',
          'codepen.io',
          'jsfiddle.net',
        ];
        return urlObj.protocol === 'https:' && 
               allowedDomains.some(domain => urlObj.hostname.includes(domain));
      } catch {
        return false;
      }
    },
    'Domínio não permitido para embed'
  ),
});

// HTML sanitization schema
export const htmlSanitizationSchema = z.object({
  html: z.string().refine(
    (html) => {
      // Basic HTML validation - should be enhanced with DOMPurify
      const allowedTags = ['iframe', 'div', 'span', 'p', 'br'];
      const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^<>]*>/g;
      const tags = html.match(tagRegex) || [];
      
      return tags.every(tag => {
        const tagName = tag.match(/<\/?([a-zA-Z][a-zA-Z0-9]*)/)?.[1];
        return tagName && allowedTags.includes(tagName.toLowerCase());
      });
    },
    'HTML contém tags não permitidas'
  ),
});

// Rate limiting schema
export const rateLimitSchema = z.object({
  identifier: z.string().min(1, 'Identificador é obrigatório'),
  limit: z.number().min(1, 'Limite deve ser maior que 0'),
  window: z.number().min(1, 'Janela deve ser maior que 0'),
});

// Search and filter schemas
export const searchSchema = z.object({
  query: z.string().min(1, 'Query é obrigatória').max(100, 'Query muito longa'),
  filters: z.record(z.any()).optional(),
  sort: z.object({
    field: z.string(),
    direction: z.enum(['asc', 'desc']),
  }).optional(),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().min(1, 'Página deve ser maior que 0'),
  limit: z.number().min(1, 'Limite deve ser maior que 0').max(100, 'Limite máximo é 100'),
  total: z.number().min(0, 'Total deve ser maior ou igual a 0'),
});

// Response schemas
export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

export const paginatedResponseSchema = apiResponseSchema.extend({
  data: z.object({
    items: z.array(z.any()),
    pagination: paginationSchema,
  }),
});

// Type exports
export type AreaInput = z.infer<typeof areaSchema>;
export type SubareaInput = z.infer<typeof subareaSchema>;
export type SimulatorGroupInput = z.infer<typeof simulatorGroupSchema>;
export type SimulatorDisciplineInput = z.infer<typeof simulatorDisciplineSchema>;
export type SimulatorDisciplineUpdateInput = z.infer<typeof simulatorDisciplineUpdateSchema>;
export type SyllabusUpdateInput = z.infer<typeof syllabusUpdateSchema>;
export type AttachmentUpdateInput = z.infer<typeof attachmentUpdateSchema>;
export type RoadmapInput = z.infer<typeof roadmapSchema>;
export type RoadmapUpdateInput = z.infer<typeof roadmapUpdateSchema>;
export type RoadmapStatusUpdateInput = z.infer<typeof roadmapStatusUpdateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type SimulatorQueryInput = z.infer<typeof simulatorQuerySchema>;
export type ReportQueryInput = z.infer<typeof reportQuerySchema>;
export type FileUploadInput = z.infer<typeof fileUploadSchema>;
export type ImportExcelInput = z.infer<typeof importExcelSchema>;
export type ExportExcelInput = z.infer<typeof exportExcelSchema>;
export type ApiResponse<T = any> = z.infer<typeof apiResponseSchema> & { data?: T };
export type PaginatedResponse<T = any> = z.infer<typeof paginatedResponseSchema> & { 
  data: { items: T[]; pagination: z.infer<typeof paginationSchema> } 
};
