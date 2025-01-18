/*
- Allow authenticated users to upload and download their tracks
*/

-- Create a new storage bucket for Lo-Fi tracks
INSERT INTO storage.buckets (id, name, public)
VALUES ('lofi-tracks', 'lofi-tracks', true);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public access to Lo-Fi tracks" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload Lo-Fi tracks" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own Lo-Fi tracks" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;

-- Set up security policies
CREATE POLICY "Public read access to processed tracks"
ON storage.objects FOR SELECT
TO public
USING (
    bucket_id = 'lofi-tracks' 
    AND position('processed/' in name) > 0
);

CREATE POLICY "Users can upload tracks"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'lofi-tracks' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update own tracks"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'lofi-tracks' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own tracks"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'lofi-tracks' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can read own tracks"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'lofi-tracks' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);