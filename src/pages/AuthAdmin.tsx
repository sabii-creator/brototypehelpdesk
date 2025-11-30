import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Shield, ArrowLeft } from "lucide-react";
import { z } from "zod";
import brototypeLogo from "@/assets/brototype-logo.png";
import { ForgotPasswordDialog } from "@/components/ForgotPasswordDialog";
const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address").max(255),
  password: z.string().min(1, "Password is required")
});
const AuthAdmin = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [loading, setLoading] = useState(false);
  const [checkingAdmins, setCheckingAdmins] = useState(true);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    requestReason: ""
  });

  // Check if any admin exists on mount
  useEffect(() => {
    const checkAdminExists = async () => {
      try {
        const {
          count
        } = await supabase.from("user_roles").select("*", {
          count: "exact",
          head: true
        }).eq("role", "admin");
        if ((count ?? 0) === 0) {
          toast({
            title: "No Admin Account",
            description: "No admin account exists yet. Redirecting to setup..."
          });
          setTimeout(() => navigate("/setup"), 2000);
        }
      } catch (error) {
        console.error("Error checking admin:", error);
      } finally {
        setCheckingAdmins(false);
      }
    };
    checkAdminExists();
  }, [navigate, toast]);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const validated = loginSchema.parse({
        email: formData.email,
        password: formData.password
      });
      const {
        data,
        error
      } = await supabase.auth.signInWithPassword({
        email: validated.email,
        password: validated.password
      });
      if (error) throw error;

      // Check if user is admin
      const {
        data: roleData
      } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id).eq("role", "admin").single();
      if (!roleData) {
        await supabase.auth.signOut();
        toast({
          title: "Access Denied",
          description: "This account does not have admin privileges.",
          variant: "destructive"
        });
        return;
      }
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in as admin."
      });
      navigate("/admin");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive"
        });
      } else {
        const errorMsg = error.message || "Failed to login";

        // Check if it's an invalid credentials error
        if (errorMsg.includes("Invalid login credentials") || errorMsg.includes("invalid_credentials")) {
          toast({
            title: "Invalid Credentials",
            description: "The email or password you entered is incorrect. Please try again or use Forgot Password.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error",
            description: errorMsg,
            variant: "destructive"
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };
  const handleAdminRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fullName = formData.fullName;
      const email = formData.email;
      const reason = formData.requestReason;
      if (!fullName || !email) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      // First create the user account
      const {
        data: authData,
        error: authError
      } = await supabase.auth.signUp({
        email: email,
        password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8),
        // Temporary password
        options: {
          data: {
            full_name: fullName
          }
        }
      });
      if (authError) throw authError;

      // Then create the admin request
      const {
        error
      } = await supabase.from("admin_requests").insert({
        user_id: authData.user!.id,
        reason: reason
      });
      if (error) throw error;
      toast({
        title: "Request Submitted",
        description: "Your admin access request has been submitted. You'll receive an email if approved with instructions to set your password."
      });
      setFormData({
        ...formData,
        fullName: "",
        email: "",
        requestReason: ""
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit request",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  if (checkingAdmins) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>;
  }
  return <div className="min-h-screen bg-background flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-6">
          <img src={brototypeLogo} alt="Brototype Logo" className="w-14 h-14 rounded-full object-cover ring-2 ring-border" />
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">BROTOTYPE</h1>
            <p className="text-sm text-muted-foreground">Admin Portal</p>
          </div>
        </div>

        <Card className="border-2 transition-all duration-300 hover:shadow-lg">
          
        </Card>

        <Card className="transition-all duration-300 hover:shadow-lg">
          <CardHeader>
            <CardTitle>Admin Access</CardTitle>
            <CardDescription className="text-center">Login as admin</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2 font-mono text-3xl">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="request">Request Access</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email</Label>
                    <Input id="admin-email" type="email" placeholder="admin@brototype.com" value={formData.email} onChange={e => setFormData({
                    ...formData,
                    email: e.target.value
                  })} required maxLength={255} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Password</Label>
                    <Input id="admin-password" type="password" value={formData.password} onChange={e => setFormData({
                    ...formData,
                    password: e.target.value
                  })} required maxLength={128} />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Logging in..." : "Login as Admin"}
                  </Button>
                  <Button type="button" variant="link" size="sm" onClick={() => setForgotPasswordOpen(true)} className="w-full">
                    Forgot Password?
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="request">
                <form onSubmit={handleAdminRequest} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="request-name">Full Name</Label>
                    <Input id="request-name" type="text" placeholder="Enter your full name" value={formData.fullName} onChange={e => setFormData({
                    ...formData,
                    fullName: e.target.value
                  })} required maxLength={100} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="request-email">Email</Label>
                    <Input id="request-email" type="email" placeholder="Enter your email" value={formData.email} onChange={e => setFormData({
                    ...formData,
                    email: e.target.value
                  })} required maxLength={255} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="request-reason">Reason for Admin Access</Label>
                    <Input id="request-reason" type="text" placeholder="Why do you need admin access?" value={formData.requestReason} onChange={e => setFormData({
                    ...formData,
                    requestReason: e.target.value
                  })} maxLength={500} />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Submitting..." : "Request Admin Access"}
                  </Button>
                  <p className="text-sm text-muted-foreground text-center">
                    No login required. You'll receive an email if your request is approved.
                  </p>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-4 space-y-2">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate("/auth/student")} className="w-full">
                Student Login
              </Button>
            </div>
          </CardContent>
        </Card>

        <ForgotPasswordDialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen} />
      </div>
    </div>;
};
export default AuthAdmin;