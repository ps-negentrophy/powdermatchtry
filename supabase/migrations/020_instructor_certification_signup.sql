-- Update instructor trigger to capture certification from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_instructor()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.raw_user_meta_data->>'role' = 'instructor' THEN
    INSERT INTO public.instructors (user_id, display_name, gender, birth_year, birth_month, certification_body, certification_number)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
      NULLIF(NEW.raw_user_meta_data->>'gender', ''),
      NULLIF(NEW.raw_user_meta_data->>'birth_year',  '')::INTEGER,
      NULLIF(NEW.raw_user_meta_data->>'birth_month', '')::INTEGER,
      NULLIF(NEW.raw_user_meta_data->>'certification_body', ''),
      NULLIF(NEW.raw_user_meta_data->>'certification_number', '')
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
