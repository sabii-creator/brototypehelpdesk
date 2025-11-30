import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface AdminRequest {
  id: string;
  email: string;
  full_name: string;
  reason: string;
  status: string;
  created_at: string;
}

const AdminRequestList = () => {
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_requests")
        .select(`
          *,
          profiles!admin_requests_user_id_fkey (
            full_name,
            email
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Transform the data to match expected structure
      const transformedData = data?.map((request: any) => ({
        ...request,
        full_name: request.profiles?.full_name || 'Unknown',
        email: request.profiles?.email || 'Unknown',
      })) || [];
      
      setRequests(transformedData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleRequest = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      const { error } = await supabase.functions.invoke('approve-admin-request', {
        body: { requestId, action },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Admin request ${action}d successfully`,
      });

      fetchRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Admin Access Requests</h3>
      {requests.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">
          No admin requests found
        </Card>
      ) : (
        requests.map((request) => (
          <Card key={request.id} className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-foreground">{request.full_name}</h4>
                  <Badge
                    variant={
                      request.status === "approved"
                        ? "default"
                        : request.status === "rejected"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {request.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                    {request.status === "approved" && <CheckCircle className="w-3 h-3 mr-1" />}
                    {request.status === "rejected" && <XCircle className="w-3 h-3 mr-1" />}
                    {request.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{request.email}</p>
                {request.reason && (
                  <p className="text-sm text-foreground">{request.reason}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Requested: {new Date(request.created_at).toLocaleDateString()}
                </p>
              </div>
              {request.status === "pending" && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleRequest(request.id, "approve")}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRequest(request.id, "reject")}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))
      )}
    </div>
  );
};

export default AdminRequestList;