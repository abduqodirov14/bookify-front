import os
import re

auth_page_path = r"d:\my start Up\fianny-v2\frontend\src\app\auth\page.tsx"
auth_form_path = r"d:\my start Up\fianny-v2\frontend\src\components\AuthForm.tsx"

try:
    with open(auth_page_path, "r", encoding="utf-8") as f:
        content = f.read()

    # The file has "use client"; imports, function AuthForm() { ... }, and export default function AuthPage() { ... }
    
    # Let's extract everything from "use client"; to the end of AuthForm
    # We find the start of export default function AuthPage
    auth_page_idx = content.find("export default function AuthPage")
    
    if auth_page_idx != -1:
        auth_form_content = content[:auth_page_idx]
        # Add default export to AuthForm if not there
        auth_form_content = auth_form_content.replace("function AuthForm()", "export default function AuthForm()")
        
        with open(auth_form_path, "w", encoding="utf-8") as f:
            f.write(auth_form_content)
            
        new_auth_page_content = '''"use client";

import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";
import AuthForm from "@/components/AuthForm";

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-orange-500" size={32} /></div>}>
      <AuthForm />
    </Suspense>
  );
}
'''
        with open(auth_page_path, "w", encoding="utf-8") as f:
            f.write(new_auth_page_content)
            
        print("Successfully extracted AuthForm to src/components/AuthForm.tsx")
    else:
        print("Could not find AuthPage")
except Exception as e:
    print(f"Error: {e}")
