/*
  # Create storage bucket for Lo-Fi tracks

  1. New Storage Bucket
    - `lofi-tracks` bucket for storing processed audio files
  
  2. Security
    - Enable public access for authenticated users
    - Allow authenticated users to upload and download their tracks
*/

-- Create a new storage bucket for Lo-Fi tracks
INSERT INTO storage.buckets (id, name, public)
VALUES ('lofi-tracks', 'lofi-tracks', true);

-- Set up security policies
CREATE POLICY "Allow public access to Lo-Fi tracks"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'lofi-tracks');

CREATE POLICY "Allow authenticated users to upload Lo-Fi tracks"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'lofi-tracks');

CREATE POLICY "Allow users to update their own Lo-Fi tracks"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'lofi-tracks' AND owner = auth.uid());