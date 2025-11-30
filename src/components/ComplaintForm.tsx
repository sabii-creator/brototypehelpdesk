import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileUp, Send } from "lucide-react";

interface ComplaintFormProps {
  onSuccess?: () => void;
}

const ComplaintForm = ({ onSuccess }: ComplaintFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("medium");
  const [files, setFiles] = useState<FileList | null>(null);
  
  const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const categories = [
    "Technical Issue",
    "Course Content",
    "Facilities",
    "Faculty",
    "Administration",
    "Other"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to submit a complaint",
          variant: "destructive",
        });
        return;
      }

      // Insert complaint
      const { data: complaint, error: complaintError } = await supabase
        .from("complaints")
        .insert({
          user_id: user.id,
          title,
          description,
          category,
          priority,
        })
        .select()
        .single();

      if (complaintError) throw complaintError;

      // Upload attachments with validation
      if (files && files.length > 0 && complaint) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          
          // Validate file type
          if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            toast({
              title: "Invalid file type",
              description: `${file.name} is not allowed. Only JPEG, PNG, GIF, and PDF files are accepted.`,
              variant: "destructive",
            });
            continue;
          }
          
          // Validate file size
          if (file.size > MAX_FILE_SIZE) {
            toast({
              title: "File too large",
              description: `${file.name} exceeds 10MB limit.`,
              variant: "destructive",
            });
            continue;
          }
          
          // Sanitize filename
          const sanitizedFilename = file.name
            .replace(/[^a-zA-Z0-9.-]/g, '_')
            .substring(0, 100);
          
          const fileExt = sanitizedFilename.split('.').pop();
          const filePath = `${user.id}/${complaint.id}/${Date.now()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from("complaint-attachments")
            .upload(filePath, file);

          if (uploadError) {
            toast({
              title: "Upload failed",
              description: `Failed to upload ${sanitizedFilename}`,
              variant: "destructive",
            });
            continue;
          }

          // Save attachment record
          await supabase
            .from("complaint_attachments")
            .insert({
              complaint_id: complaint.id,
              file_path: filePath,
              file_name: sanitizedFilename,
              file_size: file.size,
              file_url: filePath,
              file_type: file.type,
            });
        }
      }

      toast({
        title: "Success",
        description: "Your complaint has been submitted successfully",
      });

      // Reset form
      setTitle("");
      setDescription("");
      setCategory("");
      setPriority("medium");
      setFiles(null);
      
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Error submitting complaint:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit complaint",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold text-foreground mb-6">Submit a Complaint</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief summary of your complaint"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide detailed information about your complaint"
            rows={5}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="attachments">Attachments (Optional)</Label>
          <Input
            id="attachments"
            type="file"
            multiple
            onChange={(e) => setFiles(e.target.files)}
            accept="image/jpeg,image/png,image/gif,application/pdf"
          />
          <p className="text-xs text-muted-foreground">
            Allowed: JPEG, PNG, GIF, PDF. Max 10MB per file.
          </p>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-primary to-info"
        >
          {isLoading ? (
            "Submitting..."
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Submit Complaint
            </>
          )}
        </Button>
      </form>
    </Card>
  );
};

export default ComplaintForm;
