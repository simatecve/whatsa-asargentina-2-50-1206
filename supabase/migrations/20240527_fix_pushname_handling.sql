
-- Actualizar la función para manejar correctamente el pushname en conversaciones
CREATE OR REPLACE FUNCTION public.handle_new_message_for_conversation()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_conversation_id uuid;
  v_numero_limpio text;
  v_existing_pushname text;
BEGIN
  -- Log inicial
  RAISE LOG 'NUEVO TRIGGER: Procesando mensaje ID=%, instancia=%, numero=%, direccion=%', 
    NEW.id, NEW.instancia, NEW.numero, NEW.direccion;
  
  -- Limpiar el número (remover @s.whatsapp.net si existe)
  v_numero_limpio := REPLACE(NEW.numero, '@s.whatsapp.net', '');
  
  RAISE LOG 'Numero limpio: %', v_numero_limpio;
  
  -- Verificar si ya existe una conversación para obtener el pushname original
  SELECT nombre_contacto INTO v_existing_pushname
  FROM public.conversaciones
  WHERE instancia_nombre = NEW.instancia AND numero_contacto = v_numero_limpio;
  
  -- Crear o actualizar conversación preservando el pushname original
  BEGIN
    INSERT INTO public.conversaciones (
      instancia_nombre,
      numero_contacto,
      nombre_contacto,
      ultimo_mensaje,
      ultimo_mensaje_fecha,
      mensajes_no_leidos,
      estado,
      created_at,
      updated_at
    )
    VALUES (
      NEW.instancia,
      v_numero_limpio,
      COALESCE(NULLIF(TRIM(NEW.pushname), ''), 'Sin nombre'),
      COALESCE(NEW.mensaje, ''),
      COALESCE(NEW.created_at, now()),
      CASE WHEN NEW.direccion = 'recibido' THEN 1 ELSE 0 END,
      'activa',
      now(),
      now()
    )
    ON CONFLICT (instancia_nombre, numero_contacto) 
    DO UPDATE SET
      -- Solo actualizar el nombre si no existía antes o si el mensaje actual es recibido y tiene pushname
      nombre_contacto = CASE 
        WHEN conversaciones.nombre_contacto IS NULL OR conversaciones.nombre_contacto = 'Sin nombre' THEN
          COALESCE(NULLIF(TRIM(NEW.pushname), ''), conversaciones.nombre_contacto, 'Sin nombre')
        WHEN NEW.direccion = 'recibido' AND NULLIF(TRIM(NEW.pushname), '') IS NOT NULL THEN
          COALESCE(NULLIF(TRIM(NEW.pushname), ''), conversaciones.nombre_contacto)
        ELSE 
          conversaciones.nombre_contacto
      END,
      ultimo_mensaje = COALESCE(NEW.mensaje, ''),
      ultimo_mensaje_fecha = COALESCE(NEW.created_at, now()),
      mensajes_no_leidos = CASE 
        WHEN NEW.direccion = 'recibido' THEN conversaciones.mensajes_no_leidos + 1
        ELSE conversaciones.mensajes_no_leidos
      END,
      updated_at = now()
    RETURNING id INTO v_conversation_id;
    
    RAISE LOG 'Conversación procesada exitosamente. ID: %', v_conversation_id;
    
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'ERROR al insertar/actualizar conversación: % %', SQLSTATE, SQLERRM;
    RETURN NEW;
  END;
  
  -- Obtener conversation_id si no lo tenemos del RETURNING
  IF v_conversation_id IS NULL THEN
    SELECT id INTO v_conversation_id
    FROM public.conversaciones
    WHERE instancia_nombre = NEW.instancia AND numero_contacto = v_numero_limpio;
    RAISE LOG 'Conversation ID obtenido por SELECT: %', v_conversation_id;
  END IF;
  
  -- Actualizar el mensaje con el conversation_id
  IF v_conversation_id IS NOT NULL THEN
    BEGIN
      UPDATE public.mensajes 
      SET conversation_id = v_conversation_id
      WHERE id = NEW.id;
      
      RAISE LOG 'Mensaje actualizado con conversation_id: %', v_conversation_id;
      
    EXCEPTION WHEN OTHERS THEN
      RAISE LOG 'ERROR al actualizar mensaje: % %', SQLSTATE, SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$function$;

-- También actualizar la función process_existing_messages para manejar correctamente el pushname
CREATE OR REPLACE FUNCTION public.process_existing_messages()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_conversation_id uuid;
  v_numero_limpio text;
  mensaje_record RECORD;
BEGIN
  FOR mensaje_record IN 
    SELECT * FROM public.mensajes 
    WHERE conversation_id IS NULL 
    ORDER BY created_at DESC
    LIMIT 20  -- Procesar solo los últimos 20
  LOOP
    -- Limpiar número
    v_numero_limpio := REPLACE(mensaje_record.numero, '@s.whatsapp.net', '');
    
    -- Crear o actualizar conversación preservando el pushname del contacto
    INSERT INTO public.conversaciones (
      instancia_nombre,
      numero_contacto,
      nombre_contacto,
      ultimo_mensaje,
      ultimo_mensaje_fecha,
      mensajes_no_leidos,
      estado,
      created_at,
      updated_at
    )
    VALUES (
      mensaje_record.instancia,
      v_numero_limpio,
      COALESCE(NULLIF(TRIM(mensaje_record.pushname), ''), 'Sin nombre'),
      COALESCE(mensaje_record.mensaje, ''),
      COALESCE(mensaje_record.created_at, now()),
      CASE WHEN mensaje_record.direccion = 'recibido' THEN 1 ELSE 0 END,
      'activa',
      now(),
      now()
    )
    ON CONFLICT (instancia_nombre, numero_contacto) 
    DO UPDATE SET
      -- Solo actualizar el nombre si es de un mensaje recibido y tiene pushname válido
      nombre_contacto = CASE 
        WHEN conversaciones.nombre_contacto IS NULL OR conversaciones.nombre_contacto = 'Sin nombre' THEN
          COALESCE(NULLIF(TRIM(mensaje_record.pushname), ''), 'Sin nombre')
        WHEN mensaje_record.direccion = 'recibido' AND NULLIF(TRIM(mensaje_record.pushname), '') IS NOT NULL THEN
          COALESCE(NULLIF(TRIM(mensaje_record.pushname), ''), conversaciones.nombre_contacto)
        ELSE 
          conversaciones.nombre_contacto
      END,
      ultimo_mensaje = COALESCE(mensaje_record.mensaje, ''),
      ultimo_mensaje_fecha = COALESCE(mensaje_record.created_at, now()),
      mensajes_no_leidos = CASE 
        WHEN mensaje_record.direccion = 'recibido' THEN conversaciones.mensajes_no_leidos + 1
        ELSE conversaciones.mensajes_no_leidos
      END,
      updated_at = now()
    RETURNING id INTO v_conversation_id;
    
    -- Obtener conversation_id si no lo tenemos
    IF v_conversation_id IS NULL THEN
      SELECT id INTO v_conversation_id
      FROM public.conversaciones
      WHERE instancia_nombre = mensaje_record.instancia AND numero_contacto = v_numero_limpio;
    END IF;
    
    -- Actualizar mensaje con conversation_id
    IF v_conversation_id IS NOT NULL THEN
      UPDATE public.mensajes 
      SET conversation_id = v_conversation_id
      WHERE id = mensaje_record.id;
    END IF;
  END LOOP;
END;
$function$;
