import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export type Database = {
  public: {
    Tables: {
      areas: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      subareas: {
        Row: {
          id: string;
          area_id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          area_id: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          area_id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      simulator_groups: {
        Row: {
          id: string;
          name: string;
          context: string;
          code_base: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          context: string;
          code_base: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          context?: string;
          code_base?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      simulator_disciplines: {
        Row: {
          id: string;
          group_id: string;
          discipline: string;
          area_id: string;
          subarea_id: string;
          code: string;
          learning_objectives: string;
          game_mechanics: string;
          kpis: string;
          syllabus: string | null;
          dev_objectives: string | null;
          attachment_type: 'LINK' | 'EMBED' | 'FILE' | 'NONE';
          attachment_url: string | null;
          attachment_file_path: string | null;
          attachment_embed_html: string | null;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          discipline: string;
          area_id: string;
          subarea_id: string;
          code: string;
          learning_objectives: string;
          game_mechanics: string;
          kpis: string;
          syllabus?: string | null;
          dev_objectives?: string | null;
          attachment_type?: 'LINK' | 'EMBED' | 'FILE' | 'NONE';
          attachment_url?: string | null;
          attachment_file_path?: string | null;
          attachment_embed_html?: string | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          discipline?: string;
          area_id?: string;
          subarea_id?: string;
          code?: string;
          learning_objectives?: string;
          game_mechanics?: string;
          kpis?: string;
          syllabus?: string | null;
          dev_objectives?: string | null;
          attachment_type?: 'LINK' | 'EMBED' | 'FILE' | 'NONE';
          attachment_url?: string | null;
          attachment_file_path?: string | null;
          attachment_embed_html?: string | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      roadmap: {
        Row: {
          id: string;
          group_id: string;
          status: 'IDEIA' | 'PROTOTIPO' | 'PILOTO' | 'PRODUCAO';
          reach: number;
          impact: number;
          confidence: number;
          effort: number;
          rice_score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          status?: 'IDEIA' | 'PROTOTIPO' | 'PILOTO' | 'PRODUCAO';
          reach: number;
          impact: number;
          confidence: number;
          effort: number;
          rice_score: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          status?: 'IDEIA' | 'PROTOTIPO' | 'PILOTO' | 'PRODUCAO';
          reach?: number;
          impact?: number;
          confidence?: number;
          effort?: number;
          rice_score?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          role: 'VIEWER' | 'EDITOR' | 'ADMIN';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          role?: 'VIEWER' | 'EDITOR' | 'ADMIN';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          role?: 'VIEWER' | 'EDITOR' | 'ADMIN';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
