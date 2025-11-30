import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Eye, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

interface ComplaintListProps {
  isAdmin?: boolean;
  onViewDetails?: (complaint: Complaint) => void;
}

const ComplaintList = ({ isAdmin = false, onViewDetails }: ComplaintListProps) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchComplaints = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      let query = supabase
        .from("complaints")
        .select("*")
        .order("created_at", { ascending: false });

      // If not admin, only show own complaints
      if (!isAdmin) {
        query = query.eq("user_id", user.id);
      }

      const { data: complaintsData, error } = await query;

      if (error) throw error;

      // Fetch profiles for each complaint
      if (complaintsData && complaintsData.length > 0) {
        const userIds = [...new Set(complaintsData.map((c: any) => c.user_id))];
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", userIds);

        const profilesMap = new Map(profilesData?.map(p => [p.id, p]));

        const enrichedComplaints = complaintsData.map((complaint: any) => ({
          ...complaint,
          profiles: profilesMap.get(complaint.user_id),
        }));

        setComplaints(enrichedComplaints);
      } else {
        setComplaints([]);
      }
    } catch (error: any) {
      console.error("Error fetching complaints:", error);
      toast({
        title: "Error",
        description: "Failed to load complaints",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("complaints-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "complaints",
        },
        () => {
          fetchComplaints();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "in_progress":
        return <AlertCircle className="w-4 h-4" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "in_progress":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "resolved":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "rejected":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "medium":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "low":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  if (complaints.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground py-8">
          {isAdmin ? "No complaints found" : "You haven't submitted any complaints yet"}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {complaints.map((complaint) => (
        <Card key={complaint.id} className="p-6 hover:border-primary/50 transition-colors">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-lg">{complaint.title}</h3>
                  {isAdmin && complaint.profiles && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Submitted by: {complaint.profiles.full_name} ({complaint.profiles.email})
                    </p>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {complaint.description}
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className={getStatusColor(complaint.status)}>
                  {getStatusIcon(complaint.status)}
                  <span className="ml-1 capitalize">{complaint.status.replace("_", " ")}</span>
                </Badge>
                <Badge variant="outline" className={getPriorityColor(complaint.priority)}>
                  {complaint.priority.toUpperCase()} Priority
                </Badge>
                <Badge variant="outline">{complaint.category}</Badge>
                <Badge variant="outline" className="text-xs">
                  {format(new Date(complaint.created_at), "MMM dd, yyyy")}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails?.(complaint)}
            >
              <Eye className="w-4 h-4 mr-2" />
              View
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ComplaintList;
