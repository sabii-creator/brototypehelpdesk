useEffect(() => {
  const checkAdminExists = async () => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("role", "admin");

      if (error) throw error;
      setCheckingAdmins(false);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to check admin status",
        variant: "destructive",
      });
      setCheckingAdmins(false);
    }
  };

  checkAdminExists();
}, [toast]);

const handleAdminRequest = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  try {
    const { fullName, email, requestReason } = formData;
    if (!fullName || !email) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: crypto.randomUUID(), // secure temp password
      options: { data: { full_name: fullName } }
    });

    if (authError) throw authError;
    if (!authData?.user) throw new Error("User creation failed.");

    const { error } = await supabase.from("admin_requests").insert({
      user_id: authData.user.id,
      reason: requestReason
    });

    if (error) throw error;

    toast({
      title: "Request Submitted",
      description: "Your admin access request has been submitted. You'll receive an email if approved."
    });

    setFormData({ email: "", password: "", fullName: "", requestReason: "" });
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
