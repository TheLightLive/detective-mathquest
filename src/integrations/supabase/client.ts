// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://tlxmybsolcjbpdrlylih.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRseG15YnNvbGNqYnBkcmx5bGloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3OTY3NTQsImV4cCI6MjA1NzM3Mjc1NH0.w_K3VvrG7nIkVpwzRxwI5GyDy3mFHRtoWrEG8Ov_YRs";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);