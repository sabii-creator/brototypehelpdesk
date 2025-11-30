import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, ArrowLeft, LogOut, Users, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import AdminUserManagement from "@/components/AdminUserManagement";
import ComplaintList from "@/components/ComplaintList";
import ComplaintDetails from "@/components/ComplaintDetails";
import AdminRequestList from "@/components/AdminRequestList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Admin = () => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [selectedComplaint, setSelectedComplaint] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-info/5 animate-fade-in">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-10 transition-all duration-300">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-info flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Brototype</h1>
                <p className="text-xs text-muted-foreground">Admin Panel</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {profile && (
                <span className="text-sm text-muted-foreground">
                  {profile.full_name}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="max-w-7xl mx-auto">
          <Card className="p-6 mb-6 transition-all duration-300 hover:shadow-lg">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Admin Panel
            </h2>
            <p className="text-muted-foreground">
              Manage complaints, administrators, and system settings.
            </p>
          </Card>

          <Tabs defaultValue="complaints" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="complaints" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Complaints
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                User Management
              </TabsTrigger>
              <TabsTrigger value="requests" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Admin Requests
              </TabsTrigger>
            </TabsList>

            <TabsContent value="complaints" className="space-y-4">
              <ComplaintList 
                isAdmin={true}
                onViewDetails={(complaint) => setSelectedComplaint(complaint.id)}
              />
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <AdminUserManagement />
            </TabsContent>

            <TabsContent value="requests" className="space-y-6">
              <AdminRequestList />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Complaint Details Modal */}
      {selectedComplaint && (
        <ComplaintDetails
          complaintId={selectedComplaint}
          isAdmin={true}
          onClose={() => setSelectedComplaint(null)}
        />
      )}
    </div>
  );
};

export default Admin;
