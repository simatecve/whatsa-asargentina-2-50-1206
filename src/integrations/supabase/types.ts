export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      agente_ia_config: {
        Row: {
          created_at: string
          default_delay_message: number | null
          expire_minutes: number | null
          id: string
          instance_name: string | null
          is_active: boolean
          keyword_finish: string | null
          listening_from_me: boolean | null
          nombre_agente: string
          prompt: string | null
          stop_bot_from_me: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          default_delay_message?: number | null
          expire_minutes?: number | null
          id?: string
          instance_name?: string | null
          is_active?: boolean
          keyword_finish?: string | null
          listening_from_me?: boolean | null
          nombre_agente?: string
          prompt?: string | null
          stop_bot_from_me?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          default_delay_message?: number | null
          expire_minutes?: number | null
          id?: string
          instance_name?: string | null
          is_active?: boolean
          keyword_finish?: string | null
          listening_from_me?: boolean | null
          nombre_agente?: string
          prompt?: string | null
          stop_bot_from_me?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      api_config: {
        Row: {
          api_key: string | null
          config_data: string | null
          config_type: string | null
          created_at: string
          id: string
          server_url: string | null
          updated_at: string
        }
        Insert: {
          api_key?: string | null
          config_data?: string | null
          config_type?: string | null
          created_at?: string
          id?: string
          server_url?: string | null
          updated_at?: string
        }
        Update: {
          api_key?: string | null
          config_data?: string | null
          config_type?: string | null
          created_at?: string
          id?: string
          server_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      campana_envios: {
        Row: {
          campana_id: string
          contacto_id: string
          created_at: string | null
          enviado_at: string | null
          error: string | null
          estado: string
          id: string
          updated_at: string | null
        }
        Insert: {
          campana_id: string
          contacto_id: string
          created_at?: string | null
          enviado_at?: string | null
          error?: string | null
          estado?: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          campana_id?: string
          contacto_id?: string
          created_at?: string | null
          enviado_at?: string | null
          error?: string | null
          estado?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campana_envios_campana_id_fkey"
            columns: ["campana_id"]
            isOneToOne: false
            referencedRelation: "campanas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campana_envios_contacto_id_fkey"
            columns: ["contacto_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      campanas: {
        Row: {
          archivo_url: string | null
          created_at: string | null
          delay_maximo: number
          delay_minimo: number
          estado: string
          fecha_fin: string | null
          fecha_inicio: string | null
          id: string
          instance_id: string | null
          lista_id: string
          mensaje: string | null
          nombre: string
          updated_at: string | null
          user_id: string
          webhook_id: string | null
        }
        Insert: {
          archivo_url?: string | null
          created_at?: string | null
          delay_maximo?: number
          delay_minimo?: number
          estado?: string
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          instance_id?: string | null
          lista_id: string
          mensaje?: string | null
          nombre: string
          updated_at?: string | null
          user_id: string
          webhook_id?: string | null
        }
        Update: {
          archivo_url?: string | null
          created_at?: string | null
          delay_maximo?: number
          delay_minimo?: number
          estado?: string
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          instance_id?: string | null
          lista_id?: string
          mensaje?: string | null
          nombre?: string
          updated_at?: string | null
          user_id?: string
          webhook_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campanas_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "instancias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campanas_lista_id_fkey"
            columns: ["lista_id"]
            isOneToOne: false
            referencedRelation: "contact_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campanas_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_lists: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contactos_bots: {
        Row: {
          created_at: string
          id: string
          instancia_nombre: string
          numero_contacto: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          instancia_nombre: string
          numero_contacto: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          instancia_nombre?: string
          numero_contacto?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          created_at: string
          id: string
          list_id: string
          name: string
          phone_number: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          list_id: string
          name: string
          phone_number: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          list_id?: string
          name?: string
          phone_number?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "contact_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      conversaciones: {
        Row: {
          created_at: string
          estado: string | null
          id: string
          instancia_nombre: string | null
          mensajes_no_leidos: number | null
          nombre_contacto: string | null
          numero_contacto: string
          ultimo_mensaje: string | null
          ultimo_mensaje_fecha: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          estado?: string | null
          id?: string
          instancia_nombre?: string | null
          mensajes_no_leidos?: number | null
          nombre_contacto?: string | null
          numero_contacto: string
          ultimo_mensaje?: string | null
          ultimo_mensaje_fecha?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          estado?: string | null
          id?: string
          instancia_nombre?: string | null
          mensajes_no_leidos?: number | null
          nombre_contacto?: string | null
          numero_contacto?: string
          ultimo_mensaje?: string | null
          ultimo_mensaje_fecha?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      conversation_assignments: {
        Row: {
          assigned_at: string
          assigned_by_user_id: string | null
          assigned_to_user_id: string
          conversation_id: string
          expertise_required:
            | Database["public"]["Enums"]["expertise_area"]
            | null
          id: string
          notes: string | null
          priority: number | null
          status: string | null
        }
        Insert: {
          assigned_at?: string
          assigned_by_user_id?: string | null
          assigned_to_user_id: string
          conversation_id: string
          expertise_required?:
            | Database["public"]["Enums"]["expertise_area"]
            | null
          id?: string
          notes?: string | null
          priority?: number | null
          status?: string | null
        }
        Update: {
          assigned_at?: string
          assigned_by_user_id?: string | null
          assigned_to_user_id?: string
          conversation_id?: string
          expertise_required?:
            | Database["public"]["Enums"]["expertise_area"]
            | null
          id?: string
          notes?: string | null
          priority?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_assignments_assigned_by_user_id_fkey"
            columns: ["assigned_by_user_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "conversation_assignments_assigned_to_user_id_fkey"
            columns: ["assigned_to_user_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "conversation_assignments_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversaciones"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_collaborators: {
        Row: {
          conversation_id: string
          id: string
          is_typing: boolean | null
          joined_at: string
          last_seen: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          is_typing?: boolean | null
          joined_at?: string
          last_seen?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          is_typing?: boolean | null
          joined_at?: string
          last_seen?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_collaborators_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_collaborators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["user_id"]
          },
        ]
      }
      crm_settings: {
        Row: {
          created_at: string
          crm_url: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          crm_url: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          crm_url?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      datos_negocio: {
        Row: {
          correo: string | null
          created_at: string
          descripcion: string | null
          dias_laborables: string[] | null
          direccion: string | null
          horario_apertura: string | null
          horario_cierre: string | null
          id: string
          logo_url: string | null
          nombre_empresa: string
          sitio_web: string | null
          telefono: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          correo?: string | null
          created_at?: string
          descripcion?: string | null
          dias_laborables?: string[] | null
          direccion?: string | null
          horario_apertura?: string | null
          horario_cierre?: string | null
          id?: string
          logo_url?: string | null
          nombre_empresa: string
          sitio_web?: string | null
          telefono?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          correo?: string | null
          created_at?: string
          descripcion?: string | null
          dias_laborables?: string[] | null
          direccion?: string | null
          horario_apertura?: string | null
          horario_cierre?: string | null
          id?: string
          logo_url?: string | null
          nombre_empresa?: string
          sitio_web?: string | null
          telefono?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      instancias: {
        Row: {
          color: string | null
          configuracion: Json | null
          estado: string | null
          fecha_creacion: string
          id: string
          is_active: boolean | null
          nombre: string
          qr_code: string | null
          user_id: string | null
          webhook: string | null
        }
        Insert: {
          color?: string | null
          configuracion?: Json | null
          estado?: string | null
          fecha_creacion?: string
          id?: string
          is_active?: boolean | null
          nombre: string
          qr_code?: string | null
          user_id?: string | null
          webhook?: string | null
        }
        Update: {
          color?: string | null
          configuracion?: Json | null
          estado?: string | null
          fecha_creacion?: string
          id?: string
          is_active?: boolean | null
          nombre?: string
          qr_code?: string | null
          user_id?: string | null
          webhook?: string | null
        }
        Relationships: []
      }
      internal_notes: {
        Row: {
          author_user_id: string
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_private: boolean | null
          mentioned_users: string[] | null
          updated_at: string
        }
        Insert: {
          author_user_id: string
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_private?: boolean | null
          mentioned_users?: string[] | null
          updated_at?: string
        }
        Update: {
          author_user_id?: string
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_private?: boolean | null
          mentioned_users?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "internal_notes_author_user_id_fkey"
            columns: ["author_user_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "internal_notes_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversaciones"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_columns: {
        Row: {
          color_class: string
          created_at: string
          id: string
          is_active: boolean
          is_default: boolean
          order_position: number
          status_key: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color_class: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          order_position: number
          status_key: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color_class?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          order_position?: number
          status_key?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          id: number
          instancia: string | null
          numero: string | null
          pushname: string | null
          status: string
        }
        Insert: {
          created_at?: string
          id?: number
          instancia?: string | null
          numero?: string | null
          pushname?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          id?: number
          instancia?: string | null
          numero?: string | null
          pushname?: string | null
          status?: string
        }
        Relationships: []
      }
      mensajes: {
        Row: {
          adjunto: string | null
          archivo_nombre: string | null
          archivo_tipo: string | null
          archivo_url: string | null
          conversation_id: string | null
          created_at: string
          direccion: string | null
          estado_lectura: boolean | null
          id: number
          instancia: string | null
          mensaje: string | null
          mensaje_id: string | null
          numero: string | null
          pushname: string | null
          respondido_a: string | null
          tipo_mensaje: string | null
        }
        Insert: {
          adjunto?: string | null
          archivo_nombre?: string | null
          archivo_tipo?: string | null
          archivo_url?: string | null
          conversation_id?: string | null
          created_at?: string
          direccion?: string | null
          estado_lectura?: boolean | null
          id?: number
          instancia?: string | null
          mensaje?: string | null
          mensaje_id?: string | null
          numero?: string | null
          pushname?: string | null
          respondido_a?: string | null
          tipo_mensaje?: string | null
        }
        Update: {
          adjunto?: string | null
          archivo_nombre?: string | null
          archivo_tipo?: string | null
          archivo_url?: string | null
          conversation_id?: string | null
          created_at?: string
          direccion?: string | null
          estado_lectura?: boolean | null
          id?: number
          instancia?: string | null
          mensaje?: string | null
          mensaje_id?: string | null
          numero?: string | null
          pushname?: string | null
          respondido_a?: string | null
          tipo_mensaje?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mensajes_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversaciones"
            referencedColumns: ["id"]
          },
        ]
      }
      mercadopago_config: {
        Row: {
          access_token: string
          created_at: string
          environment: string
          id: string
          public_key: string
          updated_at: string
        }
        Insert: {
          access_token: string
          created_at?: string
          environment?: string
          id?: string
          public_key: string
          updated_at?: string
        }
        Update: {
          access_token?: string
          created_at?: string
          environment?: string
          id?: string
          public_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      pagos: {
        Row: {
          created_at: string
          datos_pago: Json | null
          estado: string
          id: string
          mercadopago_id: string | null
          mercadopago_preferencia_id: string | null
          metodo_pago: string
          moneda: string
          monto: number
          paypal_order_id: string | null
          plan_id: string | null
          suscripcion_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          datos_pago?: Json | null
          estado?: string
          id?: string
          mercadopago_id?: string | null
          mercadopago_preferencia_id?: string | null
          metodo_pago: string
          moneda?: string
          monto: number
          paypal_order_id?: string | null
          plan_id?: string | null
          suscripcion_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          datos_pago?: Json | null
          estado?: string
          id?: string
          mercadopago_id?: string | null
          mercadopago_preferencia_id?: string | null
          metodo_pago?: string
          moneda?: string
          monto?: number
          paypal_order_id?: string | null
          plan_id?: string | null
          suscripcion_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_pagos_plan_id"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "planes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_pagos_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "pagos_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "planes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_suscripcion_id_fkey"
            columns: ["suscripcion_id"]
            isOneToOne: false
            referencedRelation: "suscripciones"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_configurations: {
        Row: {
          config_data: Json
          created_at: string
          id: string
          is_active: boolean | null
          provider: string
          updated_at: string
        }
        Insert: {
          config_data?: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          provider: string
          updated_at?: string
        }
        Update: {
          config_data?: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          provider?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          configuration: Json | null
          created_at: string
          display_name: string
          id: string
          is_enabled: boolean | null
          method_name: string
          updated_at: string
        }
        Insert: {
          configuration?: Json | null
          created_at?: string
          display_name: string
          id?: string
          is_enabled?: boolean | null
          method_name: string
          updated_at?: string
        }
        Update: {
          configuration?: Json | null
          created_at?: string
          display_name?: string
          id?: string
          is_enabled?: boolean | null
          method_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number | null
          created_at: string
          currency: string | null
          id: string
          payment_id: string | null
          provider_response: Json | null
          status: string
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          payment_id?: string | null
          provider_response?: Json | null
          status: string
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          payment_id?: string | null
          provider_response?: Json | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "pagos"
            referencedColumns: ["id"]
          },
        ]
      }
      planes: {
        Row: {
          created_at: string
          descripcion: string | null
          estado: boolean
          id: string
          max_campanas: number
          max_contactos: number
          max_conversaciones: number
          max_instancias: number
          max_mensajes: number
          moneda: string
          nombre: string
          periodo: string
          precio: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          descripcion?: string | null
          estado?: boolean
          id?: string
          max_campanas?: number
          max_contactos?: number
          max_conversaciones?: number
          max_instancias?: number
          max_mensajes?: number
          moneda?: string
          nombre: string
          periodo?: string
          precio: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          descripcion?: string | null
          estado?: boolean
          id?: string
          max_campanas?: number
          max_contactos?: number
          max_conversaciones?: number
          max_instancias?: number
          max_mensajes?: number
          moneda?: string
          nombre?: string
          periodo?: string
          precio?: number
          updated_at?: string
        }
        Relationships: []
      }
      quick_replies: {
        Row: {
          created_at: string
          id: number
          message: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          message: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          message?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      sistema_info: {
        Row: {
          copyright_texto: string
          created_at: string
          direccion: string | null
          email_soporte: string | null
          empresa: string
          id: string
          logo_url: string | null
          nombre_sistema: string
          sitio_web: string | null
          telefono_soporte: string | null
          updated_at: string
          version: string
        }
        Insert: {
          copyright_texto?: string
          created_at?: string
          direccion?: string | null
          email_soporte?: string | null
          empresa?: string
          id?: string
          logo_url?: string | null
          nombre_sistema?: string
          sitio_web?: string | null
          telefono_soporte?: string | null
          updated_at?: string
          version?: string
        }
        Update: {
          copyright_texto?: string
          created_at?: string
          direccion?: string | null
          email_soporte?: string | null
          empresa?: string
          id?: string
          logo_url?: string | null
          nombre_sistema?: string
          sitio_web?: string | null
          telefono_soporte?: string | null
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      smart_templates: {
        Row: {
          content: string
          context_triggers: string[] | null
          created_at: string
          expertise_area: Database["public"]["Enums"]["expertise_area"] | null
          id: string
          is_active: boolean | null
          owner_user_id: string
          title: string
          updated_at: string
          usage_count: number | null
        }
        Insert: {
          content: string
          context_triggers?: string[] | null
          created_at?: string
          expertise_area?: Database["public"]["Enums"]["expertise_area"] | null
          id?: string
          is_active?: boolean | null
          owner_user_id: string
          title: string
          updated_at?: string
          usage_count?: number | null
        }
        Update: {
          content?: string
          context_triggers?: string[] | null
          created_at?: string
          expertise_area?: Database["public"]["Enums"]["expertise_area"] | null
          id?: string
          is_active?: boolean | null
          owner_user_id?: string
          title?: string
          updated_at?: string
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "smart_templates_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["user_id"]
          },
        ]
      }
      suscripciones: {
        Row: {
          created_at: string
          estado: string
          fecha_fin: string
          fecha_inicio: string
          id: string
          pago_id: string | null
          plan_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          estado?: string
          fecha_fin: string
          fecha_inicio?: string
          id?: string
          pago_id?: string | null
          plan_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          estado?: string
          fecha_fin?: string
          fecha_inicio?: string
          id?: string
          pago_id?: string | null
          plan_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suscripciones_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "planes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suscripciones_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["user_id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string
          current_conversation_count: number | null
          expertise_areas:
            | Database["public"]["Enums"]["expertise_area"][]
            | null
          id: string
          is_active: boolean | null
          max_concurrent_conversations: number | null
          member_user_id: string
          owner_user_id: string
          role: Database["public"]["Enums"]["team_role"]
          status: Database["public"]["Enums"]["assignment_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_conversation_count?: number | null
          expertise_areas?:
            | Database["public"]["Enums"]["expertise_area"][]
            | null
          id?: string
          is_active?: boolean | null
          max_concurrent_conversations?: number | null
          member_user_id: string
          owner_user_id: string
          role?: Database["public"]["Enums"]["team_role"]
          status?: Database["public"]["Enums"]["assignment_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_conversation_count?: number | null
          expertise_areas?:
            | Database["public"]["Enums"]["expertise_area"][]
            | null
          id?: string
          is_active?: boolean | null
          max_concurrent_conversations?: number | null
          member_user_id?: string
          owner_user_id?: string
          role?: Database["public"]["Enums"]["team_role"]
          status?: Database["public"]["Enums"]["assignment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_member_user_id_fkey"
            columns: ["member_user_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "team_members_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["user_id"]
          },
        ]
      }
      token_consumption: {
        Row: {
          created_at: string
          fecha: string
          id: string
          instancia_nombre: string
          tokens_consumidos: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          fecha?: string
          id?: string
          instancia_nombre: string
          tokens_consumidos?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          fecha?: string
          id?: string
          instancia_nombre?: string
          tokens_consumidos?: number
          updated_at?: string
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          created_at: string | null
          email: string
          id: string
          nombre: string
          perfil: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          nombre: string
          perfil?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          nombre?: string
          perfil?: string | null
          user_id?: string
        }
        Relationships: []
      }
      webhooks: {
        Row: {
          created_at: string | null
          descripcion: string | null
          id: string
          nombre: string
          tipo: string
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          descripcion?: string | null
          id?: string
          nombre: string
          tipo: string
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          descripcion?: string | null
          id?: string
          nombre?: string
          tipo?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auto_assign_conversation: {
        Args: {
          p_conversation_id: string
          p_expertise_required?: Database["public"]["Enums"]["expertise_area"]
        }
        Returns: string
      }
      check_user_limits: {
        Args: { p_user_id: string; p_resource_type: string }
        Returns: boolean
      }
      create_lead_from_conversation: {
        Args: {
          p_numero_contacto: string
          p_instancia_nombre: string
          p_pushname?: string
        }
        Returns: number
      }
      get_contextual_templates: {
        Args: {
          p_user_id: string
          p_message_content?: string
          p_expertise_area?: Database["public"]["Enums"]["expertise_area"]
        }
        Returns: {
          id: string
          title: string
          content: string
          usage_count: number
        }[]
      }
      get_lead_for_conversation: {
        Args: { p_numero_contacto: string; p_instancia_nombre: string }
        Returns: {
          id: number
          pushname: string
          numero: string
          instancia: string
          status: string
          created_at: string
        }[]
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      mark_conversation_as_read: {
        Args: { conversation_uuid: string }
        Returns: undefined
      }
      process_existing_messages: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      assignment_status: "available" | "busy" | "offline"
      expertise_area: "sales" | "support" | "technical" | "billing" | "general"
      lead_status:
        | "new"
        | "contacted"
        | "qualified"
        | "proposal"
        | "negotiation"
        | "won"
        | "lost"
      team_role: "owner" | "admin" | "agent" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      assignment_status: ["available", "busy", "offline"],
      expertise_area: ["sales", "support", "technical", "billing", "general"],
      lead_status: [
        "new",
        "contacted",
        "qualified",
        "proposal",
        "negotiation",
        "won",
        "lost",
      ],
      team_role: ["owner", "admin", "agent", "viewer"],
    },
  },
} as const
