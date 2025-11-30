import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield, AlertCircle } from "lucide-react";
import { z } from "zod";
import brototypeLogo from "@/assets/brototype-logo.png";

const signupSchema = z.object({
  email: z.string().trim().email("Invalid email address").max(255),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters").max(100),
});

const InitialSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [cleaningUp, setCleaningUp] = useState(false);
  const [checking, setChecking] = useState(true);
  const [adminExists, setAdminExists] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
  });

  useEffect(() => {
    checkForAdmins();
  }, []);

  const checkForAdmins = async () => {
    try {
      const { count, error } = await supabase
        .from("user_roles")
        .select("*", { count: "exact", head: true })
        .eq("role", "admin");

      if (error) throw error;

      const adminAlreadyExists = (count ?? 0) > 0;
      setAdminExists(adminAlreadyExists);
      
      // Don't automatically redirect - let user see the message and options
      if (adminAlreadyExists) {
        toast({
          title: "Admin Account Detected",
          description: "An admin role exists in the database. If you can't log in, you may need to clean up the database.",
        });
      }
    } catch (error) {
      console.error("Error checking for admins:", error);
      toast({
        title: "Error",
        description: "Failed to check admin status.",
        variant: "destructive",
      });
    } finally {
      setChecking(false);
    }
  };

  const handleCleanupOrphanedRoles = async () => {
    setCleaningUp(true);
    try {
      const { data, error } = await supabase.functions.invoke('cleanup-orphaned-admin');

      if (error) throw error;

      if (data?.cleaned > 0) {
        toast({
          title: "Cleanup Successful",
          description: `Removed ${data.cleaned} orphaned admin role(s). You can now create a new admin account.`,
        });
        // Re-check admin status
        await checkForAdmins();
      } else {
        toast({
          title: "No Orphaned Roles",
          description: "All admin roles have valid user accounts. Try using 'Forgot Password' on the login page.",
        });
      }
    } catch (error: any) {
      console.error("Cleanup error:", error);
      toast({
        title: "Cleanup Failed",
        description: error.message || "Failed to clean up orphaned roles",
        variant: "destructive",
      });
    } finally {
      setCleaningUp(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validated = signupSchema.parse(formData);

      // Call the edge function to create the first admin
      const { data, error } = await supabase.functions.invoke('create-first-admin', {
        body: {
          email: validated.email,
          password: validated.password,
          fullName: validated.fullName,
        },
      });

      if (error) {
        // Handle specific 403 error when admin already exists
        if (error.message?.includes("admin account already exists") || 
            data?.error?.includes("admin account already exists")) {
          toast({
            title: "Admin Role Already Exists",
            description: "An admin role exists in the database. This may be an orphaned role. Please contact a database administrator.",
            variant: "destructive",
          });
          // Trigger re-check to show the admin exists message
          checkForAdmins();
          return;
        }
        throw error;
      }
      
      if (data?.error) {
        // Handle error in response data
        if (data.error.includes("admin account already exists")) {
          toast({
            title: "Admin Role Already Exists",
            description: "An admin role exists in the database. Try logging in or contact an administrator.",
            variant: "destructive",
          });
          checkForAdmins();
          return;
        }
        throw new Error(data.error);
      }

      toast({
        title: "Success!",
        description: "First admin account created successfully. You can now log in.",
      });

      navigate("/auth/admin");
    } catch (error: any) {
      console.error("Create admin error:", error);
      
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        const errorMessage = error.message || "Failed to create admin account";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        
        // If it's a 403 or admin exists error, re-check admin status
        if (errorMessage.toLowerCase().includes("admin") || error.status === 403) {
          checkForAdmins();
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (adminExists) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-yellow-500 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Admin Role Detected</CardTitle>
            <CardDescription className="text-center">
              An admin role exists in the database but you may not be able to log in.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <h3 className="font-semibold text-sm">Possible Solutions:</h3>
              <ol className="text-sm space-y-2 list-decimal list-inside">
                <li>Try logging in with existing credentials</li>
                <li>Use "Forgot Password" on the login page</li>
                <li>Contact a database administrator to clean up orphaned roles</li>
              </ol>
            </div>
            <div className="space-y-2">
              <Button onClick={() => navigate("/auth/admin")} className="w-full">
                Go to Admin Login
              </Button>
              <Button 
                onClick={handleCleanupOrphanedRoles} 
                variant="destructive" 
                className="w-full"
                disabled={cleaningUp}
              >
                {cleaningUp ? "Cleaning Up..." : "Clean Up Orphaned Roles"}
              </Button>
              <Button onClick={() => navigate("/")} variant="outline" className="w-full">
                Go to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background sticky top-0 z-10 shadow-sm backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <img
              src={brototypeLogo}
              alt="Brototype Logo"
              className="w-12 h-12 rounded-full object-cover ring-2 ring-border"
            />
            <div>
              <h1 className="text-xl tracking-tight font-bold text-white">BROTOTYPE</h1>
              <p className="text-xs text-muted-foreground">Initial Setup</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <Card className="w-full max-w-md animate-fade-in">
          <CardHeader className="space-y-1 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Create First Admin</CardTitle>
            <CardDescription className="text-center">
              No admin accounts exist yet. Create the first admin account to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating..." : "Create Admin Account"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InitialSetup;
