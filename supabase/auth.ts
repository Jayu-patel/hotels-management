import {supabase} from "@/lib/supabase/client"
// import {createSupabaseServerClient, createSupabaseServerClientRSC, createClient} from "@/lib/supabase/server"


export async function signUp(email: string, password: string, full_name: string, role: string) {
  const { data, error } = await supabase.auth.signUp(
    { 
      email, 
      password,
    },
  );
  if(!error){
      const {user} = data
      console.log(user)
      const { error: profileError } = await supabase.from("profiles").update({email, full_name, role}).eq("id", user?.id);

      if (profileError) throw profileError.message;
      else{
        console.log("profile edited")
      }
  }
  else{
    throw error.message
  }
  return {data};
}

export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if(error){
    throw error.message
  }
  return {data};
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getRole(){
  const {data: {user}} = await supabase.auth.getUser()
  let userRole
  if(user){
    const { data: role } = await supabase.from("profiles").select("role").eq("id", user?.id).single();
    userRole = role?.role
  }

  return userRole
}