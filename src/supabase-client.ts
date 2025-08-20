import { createClient } from "@supabase/supabase-js";

const supabaseURL = "https://wwutdpehzkqpsucteglh.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3dXRkcGVoemtxcHN1Y3RlZ2xoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNTYwMjcsImV4cCI6MjA3MDgzMjAyN30.2HFoe1HFvlwNVSx9yMWKMWCfGT2w_py4EE4v_Wl6tOU";

{/*import.meta.env.VITE_SUPABASE_ANON_KEY as string;*/}

export const supabase = createClient(supabaseURL, supabaseAnonKey);