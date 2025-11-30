-- Create storage bucket for complaint attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('complaint-attachments', 'complaint-attachments', false);

-- Create storage policies for complaint attachments
CREATE POLICY "Users can view attachments on their complaints"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'complaint-attachments' 
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR is_admin(auth.uid())
  )
);

CREATE POLICY "Users can upload attachments to their complaints"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'complaint-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete attachments on their complaints"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'complaint-attachments'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR is_admin(auth.uid())
  )
);