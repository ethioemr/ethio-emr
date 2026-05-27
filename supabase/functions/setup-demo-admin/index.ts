import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Parse request body for force flag
    let forceRecreate = false;
    if (req.method === "POST") {
      try {
        const body = await req.json();
        forceRecreate = body.force === true;
      } catch {
        // Ignore parse errors
      }
    }

    // Check URL params for force flag
    const url = new URL(req.url);
    if (url.searchParams.get("force") === "true") {
      forceRecreate = true;
    }

    if (forceRecreate) {
      // Delete existing user profile first
      await supabase.from("users").delete().eq("email", "admin@hospital.com");

      // Try to delete from auth.users using admin API
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      const adminUser = authUsers.users.find(u => u.email === "admin@hospital.com");

      if (adminUser) {
        await supabase.auth.admin.deleteUser(adminUser.id);
      }
    }

    // Try to sign in first to verify password works
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: "admin@hospital.com",
      password: "demo123456",
    });

    if (signInData.user) {
      // Password works! Ensure user profile exists
      const { data: existingProfile } = await supabase
        .from("users")
        .select("id")
        .eq("id", signInData.user.id)
        .maybeSingle();

      if (!existingProfile) {
        await supabase.from("users").insert([
          {
            id: signInData.user.id,
            email: "admin@hospital.com",
            full_name: "Dr. Alemayehu Tesfaye",
            role: "hospital_admin",
            phone: "+251911000001",
            approval_status: "approved",
          },
        ]);
      } else {
        // Update profile to ensure correct role and status
        await supabase
          .from("users")
          .update({
            role: "hospital_admin",
            approval_status: "approved",
            email: "admin@hospital.com",
          })
          .eq("id", signInData.user.id);
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Demo admin credentials verified and working",
          user: {
            id: signInData.user.id,
            email: "admin@hospital.com",
          },
          credentials: {
            email: "admin@hospital.com",
            password: "demo123456",
          },
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Sign in failed, create new user
    console.log("Sign in failed:", signInError?.message);

    // Create auth user with admin credentials
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: "admin@hospital.com",
      password: "demo123456",
      options: {
        data: {
          full_name: "Dr. Alemayehu Tesfaye",
          role: "hospital_admin",
        },
      },
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "User exists but password is incorrect. Try with force=true to recreate.",
            signInError: signInError?.message,
          }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: authError.message,
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (authData.user) {
      // Create user profile
      await supabase.from("users").insert([
        {
          id: authData.user.id,
          email: "admin@hospital.com",
          full_name: "Dr. Alemayehu Tesfaye",
          role: "hospital_admin",
          phone: "+251911000001",
          approval_status: "approved",
        },
      ]);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Demo admin user created successfully",
          user: {
            id: authData.user.id,
            email: "admin@hospital.com",
          },
          credentials: {
            email: "admin@hospital.com",
            password: "demo123456",
          },
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: "Unknown error occurred",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Setup error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
