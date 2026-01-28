"use client";

import { LogInForm } from "@/components/forms/LogInForm";
import { SignUpForm } from "@/components/forms/SignUpForm";
import { Card } from "@/components/ui/card";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md">
          <Card className="p-6">
            <LogInForm />
          </Card>
        </div>
      </div>
    </div>
  );
}
