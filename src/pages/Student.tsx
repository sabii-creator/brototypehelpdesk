import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GraduationCap, ArrowLeft, LogOut, FileText, List } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import ComplaintForm from "@/components/ComplaintForm";
import ComplaintList from "@/components/ComplaintList";
import ComplaintDetails from "@/components/ComplaintDetails";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Student = () => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [selectedComplaint, setSelectedComplaint] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("submit");

  const handleComplaintSubmitted = () => {
    setActiveTab("history");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-info/5 animate-fade-in">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-10 transition-all duration-300">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-info flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Brototype</h1>
                <p className="text-xs text-muted-foreground">Student Portal</p>
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
        <div className="max-w-6xl mx-auto">
          <Card className="p-6 mb-6 transition-all duration-300 hover:shadow-lg">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Welcome, {profile?.full_name}!
            </h2>
            <p className="text-muted-foreground">
              Submit and track your complaints from the dashboard below.
            </p>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="submit" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Submit Complaint
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <List className="w-4 h-4" />
                My Complaints
              </TabsTrigger>
            </TabsList>

            <TabsContent value="submit">
              <ComplaintForm onSuccess={handleComplaintSubmitted} />
            </TabsContent>

            <TabsContent value="history">
              <ComplaintList 
                isAdmin={false}
                onViewDetails={(complaint) => setSelectedComplaint(complaint.id)}
              />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Complaint Details Modal */}
      {selectedComplaint && (
        <ComplaintDetails
          complaintId={selectedComplaint}
          isAdmin={false}
          onClose={() => setSelectedComplaint(null)}
        />
      )}
    </div>
  );
};

export default Student;
