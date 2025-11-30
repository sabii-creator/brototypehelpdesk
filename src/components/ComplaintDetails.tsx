import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { X, Send, Download, User, Clock, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ComplaintDetailsProps {
  complaintId: string;
  isAdmin?: boolean;
  onClose: () => void;
}

interface Comment {
  id: string;
  comment: string;
  is_admin: boolean;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string;
  };
}

interface Attachment {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  created_at: string;
}

const ComplaintDetails = ({ complaintId, isAdmin = false, onClose }: ComplaintDetailsProps) => {
  const [complaint, setComplaint] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchComplaintDetails();
  }, [complaintId]);

  const fetchComplaintDetails = async () => {
    try {
      // Fetch complaint
      const { data: complaintData, error: complaintError } = await supabase
        .from("complaints")
        .select("*")
        .eq("id", complaintId)
        .single();

      if (complaintError) throw complaintError;

      // Fetch student profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", complaintData.user_id)
        .single();

      setComplaint({ ...complaintData, profiles: profileData });
      setNewStatus(complaintData.status);

      // Fetch comments
      const { data: commentsData, error: commentsError } = await supabase
        .from("complaint_comments")
        .select("*")
        .eq("complaint_id", complaintId)
        .order("created_at", { ascending: true });

      if (commentsError) throw commentsError;

      // Fetch profiles for comments
      if (commentsData && commentsData.length > 0) {
        const userIds = [...new Set(commentsData.map(c => c.user_id))];
        const { data: commentProfilesData } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", userIds);

        const commentProfilesMap = new Map(commentProfilesData?.map(p => [p.id, p]));

        const enrichedComments = commentsData.map(comment => ({
          ...comment,
          profiles: commentProfilesMap.get(comment.user_id),
        }));

        setComments(enrichedComments);
      } else {
        setComments([]);
      }

      // Fetch attachments
      const { data: attachmentsData, error: attachmentsError } = await supabase
        .from("complaint_attachments")
        .select("*")
        .eq("complaint_id", complaintId);

      if (attachmentsError) throw attachmentsError;
      setAttachments(attachmentsData || []);
    } catch (error: any) {
      console.error("Error fetching complaint details:", error);
      toast({
        title: "Error",
        description: "Failed to load complaint details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("complaint_comments")
        .insert({
          complaint_id: complaintId,
          user_id: user.id,
          comment: newComment,
          is_admin: isAdmin && isInternal,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Comment added successfully",
      });

      setNewComment("");
      setIsInternal(false);
      fetchComplaintDetails();
    } catch (error: any) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async () => {
    if (newStatus === complaint.status) return;

    try {
      const { error } = await supabase
        .from("complaints")
        .update({ status: newStatus })
        .eq("id", complaintId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Complaint status updated",
      });

      fetchComplaintDetails();
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const handleDownloadAttachment = async (attachment: Attachment) => {
    try {
      const { data, error } = await supabase.storage
        .from("complaint-attachments")
        .download(attachment.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = attachment.file_name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Error downloading file:", error);
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const handleDeleteComplaint = async () => {
    try {
      const { error } = await supabase
        .from("complaints")
        .delete()
        .eq("id", complaintId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Complaint deleted successfully",
      });

      onClose();
    } catch (error: any) {
      console.error("Error deleting complaint:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete complaint",
        variant: "destructive",
      });
    }
  };

  if (isLoading || !complaint) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-background border-b p-6 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-foreground">Complaint Details</h2>
          <div className="flex items-center gap-2">
            {(isAdmin || complaint.status === "pending") && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Complaint</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this complaint? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteComplaint}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Complaint Info */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-foreground">{complaint.title}</h3>
              {complaint.profiles && (
                <p className="text-sm text-muted-foreground mt-1">
                  Submitted by: {complaint.profiles.full_name} ({complaint.profiles.email})
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{complaint.category}</Badge>
              <Badge variant="outline" className="capitalize">{complaint.priority} Priority</Badge>
              <Badge variant="outline" className="capitalize">{complaint.status.replace("_", " ")}</Badge>
              <Badge variant="outline">
                <Clock className="w-3 h-3 mr-1" />
                {format(new Date(complaint.created_at), "MMM dd, yyyy HH:mm")}
              </Badge>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-foreground whitespace-pre-wrap">{complaint.description}</p>
            </div>
          </div>

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Attachments</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {attachments.map((attachment) => (
                  <Button
                    key={attachment.id}
                    variant="outline"
                    className="justify-start"
                    onClick={() => handleDownloadAttachment(attachment)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    <span className="truncate">{attachment.file_name}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Admin Controls */}
          {isAdmin && (
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Admin Controls</h4>
              <div className="flex gap-2">
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleUpdateStatus}>Update Status</Button>
              </div>
            </div>
          )}

          <Separator />

          {/* Comments */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Comments & Updates</h4>
            
            <div className="space-y-3">
              {comments.map((comment) => (
                <Card key={comment.id} className={comment.is_admin ? "bg-yellow-500/5 border-yellow-500/20" : ""}>
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{comment.profiles?.full_name}</span>
                        {comment.is_admin && (
                          <Badge variant="outline" className="text-xs">Internal</Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(comment.created_at), "MMM dd, yyyy HH:mm")}
                      </span>
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{comment.comment}</p>
                  </div>
                </Card>
              ))}
            </div>

            {/* Add Comment */}
            <div className="space-y-3">
              <Textarea
                placeholder="Add a comment or update..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
              />
              {isAdmin && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="internal"
                    checked={isInternal}
                    onCheckedChange={setIsInternal}
                  />
                  <Label htmlFor="internal" className="text-sm">
                    Internal comment (only visible to admins)
                  </Label>
                </div>
              )}
              <Button onClick={handleAddComment} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Add Comment
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ComplaintDetails;
