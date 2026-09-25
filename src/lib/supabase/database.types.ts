export interface Database {
  public: {
    Tables: {
      categories: {
        Row: { id: string; name: string; slug: string; is_visible: boolean; created_at: string }
        Insert: { name: string; slug: string; is_visible?: boolean }
        Update: Partial<{ name: string; slug: string; is_visible: boolean }>
        Relationships: []
      }
      posts: {
        Row: {
          id: string
          title_en: string
          title_kh: string | null
          body_en: string
          body_kh: string | null
          content_blocks: unknown
          slug: string
          category_id: string
          author_id: string | null
          author_reader_id: string | null
          source_url: string | null
          source_label: string | null
          video_url: string | null
          cover_image_url: string | null
          status: string
          published_at: string | null
          excerpt: string | null
          tags: string[]
          seo_title: string | null
          seo_description: string | null
          canonical_url: string | null
          references: unknown
          scheduled_at: string | null
          created_at: string
        }
        Insert: {
          title_en: string
          slug: string
          category_id: string
          author_reader_id: string
          status: string
          content_blocks?: unknown
          cover_image_url?: string | null
          excerpt?: string | null
          tags?: string[]
          seo_title?: string | null
          seo_description?: string | null
          canonical_url?: string | null
          references?: unknown
          scheduled_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['posts']['Row']>
        Relationships: [
          {
            foreignKeyName: 'posts_category_id_fkey'
            columns: ['category_id']
            referencedRelation: 'categories'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'posts_author_reader_id_fkey'
            columns: ['author_reader_id']
            referencedRelation: 'reader_profiles'
            referencedColumns: ['id']
          },
        ]
      }
      ads: {
        Row: {
          id: string
          campaign_name: string
          media_url: string | null
          link_url: string | null
          ad_code: string | null
          placement: string
          status: string
          is_mandatory: boolean
          duration_seconds: number
        }
        Insert: never
        Update: never
        Relationships: []
      }
      ad_events: {
        Row: { id: string; ad_id: string; event_type: 'impression' | 'click'; created_at: string }
        Insert: { ad_id: string; event_type: 'impression' | 'click' }
        Update: never
        Relationships: []
      }
      subscription_plans: {
        Row: { id: string; name: string; price_cents: number; billing_period: string; is_active: boolean }
        Insert: { name: string; price_cents: number; billing_period?: string; is_active?: boolean }
        Update: Partial<Database['public']['Tables']['subscription_plans']['Row']>
        Relationships: []
      }
      plan_benefits: {
        Row: { id: string; plan_id: string; label: string; sort_order: number }
        Insert: { plan_id: string; label: string; sort_order?: number }
        Update: Partial<Database['public']['Tables']['plan_benefits']['Row']>
        Relationships: [
          {
            foreignKeyName: 'plan_benefits_plan_id_fkey'
            columns: ['plan_id']
            referencedRelation: 'subscription_plans'
            referencedColumns: ['id']
          },
        ]
      }
      subscribers: {
        Row: { id: string; email: string; plan_id: string | null; status: string; subscribed_at: string }
        Insert: { email: string; plan_id?: string | null }
        Update: never
        Relationships: []
      }
      page_visits: {
        Row: { id: string; path: string; visited_at: string }
        Insert: { path: string }
        Update: never
        Relationships: []
      }
      site_settings: {
        Row: {
          id: number
          site_name: string
          logo_letter: string
          logo_url: string | null
          contact_email: string
          advertise_email: string
          phone: string
          terms_and_conditions: string
          cookie_policy: string
          subscriptions_enabled: boolean
          payment_instructions: string
          donate_enabled: boolean
          donate_bank_name: string
          donate_account_name: string
          donate_account_number: string
          donate_qr_image_url: string | null
          donate_note: string
          ad_interval_minutes: number
          auto_approve_contributor_posts: boolean
          updated_at: string
        }
        Insert: never
        Update: never
        Relationships: []
      }
      pages: {
        Row: { id: string; title: string; slug: string; content_blocks: unknown; show_in_footer: boolean; created_at: string }
        Insert: never
        Update: never
        Relationships: []
      }
      feedback: {
        Row: { id: string; reader_id: string | null; name: string | null; email: string | null; message: string; status: string; created_at: string }
        Insert: { reader_id?: string | null; name?: string | null; email?: string | null; message: string }
        Update: never
        Relationships: []
      }
      reader_profiles: {
        Row: { id: string; display_name: string; avatar_url: string | null; is_banned: boolean; public_contact: string | null; first_name: string | null; last_name: string | null; birthday: string | null; gender: string | null; mobile_number: string | null; suspended_until: string | null; suspend_reason: string | null; ban_reason: string | null; warning_message: string | null; warning_created_at: string | null; last_ip: string | null; last_country: string | null; last_seen_at: string | null; created_at: string }
        Insert: { id: string; display_name: string; avatar_url?: string | null }
        Update: Partial<{ display_name: string; avatar_url: string | null; public_contact: string | null; first_name: string | null; last_name: string | null; birthday: string | null; gender: string | null; mobile_number: string | null; suspended_until: string | null; suspend_reason: string | null; ban_reason: string | null; warning_message: string | null; warning_created_at: string | null; last_ip: string | null; last_country: string | null; last_seen_at: string | null }>
        Relationships: []
      }
      post_shares: {
        Row: { id: string; post_id: string; created_at: string }
        Insert: { post_id: string }
        Update: never
        Relationships: []
      }
      reader_emails: {
        Row: { reader_id: string; email: string; created_at: string }
        Insert: { reader_id: string; email: string }
        Update: never
        Relationships: []
      }
      comments: {
        Row: {
          id: string
          post_id: string
          reader_id: string
          parent_id: string | null
          body: string
          is_hidden: boolean
          created_at: string
        }
        Insert: { post_id: string; reader_id: string; parent_id?: string | null; body: string }
        Update: never
        Relationships: [
          { foreignKeyName: 'comments_reader_id_fkey'; columns: ['reader_id']; referencedRelation: 'reader_profiles'; referencedColumns: ['id'] },
        ]
      }
      post_likes: {
        Row: { reader_id: string; post_id: string; created_at: string }
        Insert: { reader_id: string; post_id: string }
        Update: never
        Relationships: []
      }
      post_bookmarks: {
        Row: { reader_id: string; post_id: string; created_at: string }
        Insert: { reader_id: string; post_id: string }
        Update: never
        Relationships: [
          { foreignKeyName: 'post_bookmarks_post_id_fkey'; columns: ['post_id']; referencedRelation: 'posts'; referencedColumns: ['id'] },
        ]
      }
      category_follows: {
        Row: { reader_id: string; category_id: string; created_at: string }
        Insert: { reader_id: string; category_id: string }
        Update: never
        Relationships: []
      }
      reports: {
        Row: { id: string; comment_id: string | null; post_id: string | null; reporter_id: string | null; reason: string; status: string; created_at: string }
        Insert: { comment_id?: string | null; post_id?: string | null; reporter_id?: string | null; reason: string }
        Update: never
        Relationships: []
      }
      books: {
        Row: { id: string; title: string; author_name: string; cover_image_url: string | null; description: string; genre: string; status: string; pdf_url: string | null; created_at: string }
        Insert: never
        Update: never
        Relationships: []
      }
      book_pages: {
        Row: { id: string; book_id: string; page_number: number; content_blocks: unknown; created_at: string }
        Insert: never
        Update: never
        Relationships: []
      }
      reading_progress: {
        Row: { reader_id: string; book_id: string; current_page: number; updated_at: string }
        Insert: { reader_id: string; book_id: string; current_page?: number }
        Update: Partial<{ current_page: number }>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
