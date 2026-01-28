import { auth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { ChevronRight, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export function SignUpForm() {
  // Data used to create User
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  // Check if the passwords match
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          sendEmailVerification(user)
            .then(() => {
              console.log("Email verification sent!");
            })
            .catch((error) => {
              console.error("Error sending verification email: ", error);
            });
          handleNext();
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          setError(errorMessage);
        });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const canProceed =
    email.length > 0 && password.length > 0 && confirmPassword.length > 0;

  const handleNext = () => {
    router.push("/onboarding");
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center">
          <User className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Sign Up</h2>
        <p className="text-sm text-muted-foreground">
          Enter your email and create a password
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Email
          </label>
          <Input
            placeholder="Enter your email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            className="h-12 rounded-xl"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Password
          </label>
          <Input
            placeholder="Enter your password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            className="h-12 rounded-xl"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Confirm your password
          </label>
          <Input
            placeholder="Re-enter your password"
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setError("");
            }}
            className="h-12 rounded-xl"
          />
        </div>
      </div>
      <div className="p-4">
        {error && <p style={{ color: "red" }}>{error}</p>}
        <Button
          type="submit"
          disabled={!canProceed || loading}
          className="w-full h-12 rounded-xl font-semibold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
        >
          Continue
        </Button>
      </div>
    </form>
  );
}
