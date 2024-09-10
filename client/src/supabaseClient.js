// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://umlsynlgbixrewfeebxp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtbHN5bmxnYml4cmV3ZmVlYnhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU2MzI3NjUsImV4cCI6MjA0MTIwODc2NX0.bnGO6qPL7130HiFFdFri1-KkSyziap4ix-PyzSza6xk';

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
