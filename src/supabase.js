import { createClient } from '@supabase/supabase-js';

// 请替换为你的Supabase项目的URL和anon key
const supabaseUrl = 'https://weklfkelnklhoahwcnoj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indla2xma2VsbmtsaG9haHdjbm9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5MjIxMjYsImV4cCI6MjA2NjQ5ODEyNn0.fWlmcKQY7bFH-r_EKn_KfX1QO-VxUSA_CRV3jZPJYEg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 