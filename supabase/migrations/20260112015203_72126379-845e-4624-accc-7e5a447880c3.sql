-- Create enum for symptom severity
CREATE TYPE public.symptom_severity AS ENUM ('mild', 'moderate', 'severe');

-- Create symptoms catalog table
CREATE TABLE public.symptom_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create patient symptoms log table
CREATE TABLE public.patient_symptoms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id TEXT NOT NULL,
  symptom_type_id UUID NOT NULL REFERENCES public.symptom_types(id),
  severity symptom_severity NOT NULL DEFAULT 'mild',
  pain_level INTEGER CHECK (pain_level >= 1 AND pain_level <= 10),
  notes TEXT,
  reported_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.symptom_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_symptoms ENABLE ROW LEVEL SECURITY;

-- Symptom types are readable by everyone (reference data)
CREATE POLICY "Symptom types are viewable by everyone" 
ON public.symptom_types 
FOR SELECT 
USING (true);

-- Patient symptoms are publicly accessible for demo purposes
-- In production, this would be restricted to authenticated users
CREATE POLICY "Patient symptoms are viewable by everyone" 
ON public.patient_symptoms 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert patient symptoms" 
ON public.patient_symptoms 
FOR INSERT 
WITH CHECK (true);

-- Create index for better query performance
CREATE INDEX idx_patient_symptoms_patient_id ON public.patient_symptoms(patient_id);
CREATE INDEX idx_patient_symptoms_reported_at ON public.patient_symptoms(reported_at);

-- Insert default symptom types
INSERT INTO public.symptom_types (name, category, description) VALUES
  ('Headache', 'Neurological', 'Pain or discomfort in the head or scalp area'),
  ('Fatigue', 'General', 'Persistent tiredness or lack of energy'),
  ('Nausea', 'Gastrointestinal', 'Feeling of sickness with an inclination to vomit'),
  ('Dizziness', 'Neurological', 'Feeling faint, woozy, or unsteady'),
  ('Insomnia', 'Sleep', 'Difficulty falling or staying asleep'),
  ('Joint Pain', 'Musculoskeletal', 'Pain or discomfort in joints'),
  ('Muscle Ache', 'Musculoskeletal', 'Pain or soreness in muscles'),
  ('Rash', 'Dermatological', 'Skin irritation or eruption'),
  ('Appetite Loss', 'Gastrointestinal', 'Reduced desire to eat'),
  ('Anxiety', 'Psychological', 'Feelings of worry or unease'),
  ('Depression', 'Psychological', 'Persistent feelings of sadness'),
  ('Shortness of Breath', 'Respiratory', 'Difficulty breathing or feeling out of breath'),
  ('Chest Pain', 'Cardiovascular', 'Pain or discomfort in the chest area'),
  ('Fever', 'General', 'Elevated body temperature'),
  ('Cough', 'Respiratory', 'Forceful expulsion of air from the lungs');

-- Enable realtime for symptoms table
ALTER PUBLICATION supabase_realtime ADD TABLE public.patient_symptoms;