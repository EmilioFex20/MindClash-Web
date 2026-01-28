"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  ChevronRight,
  User,
  Target,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";

const ONBOARDING_STEPS = [
  { id: "welcome", title: "Welcome to CodeQuest!", progress: 25 },
  { id: "profile", title: "Create Your Profile", progress: 50 },
  { id: "goals", title: "Set Your Goals", progress: 75 },
  { id: "ready", title: "Ready to Start!", progress: 100 },
];

const AVATAR_OPTIONS = [
  { id: "robot", emoji: "🤖", name: "Robo Coder" },
  { id: "wizard", emoji: "🧙‍♂️", name: "Code Wizard" },
  { id: "ninja", emoji: "🥷", name: "Bug Ninja" },
  { id: "scientist", emoji: "👩‍🔬", name: "Data Scientist" },
  { id: "astronaut", emoji: "👨‍🚀", name: "Space Explorer" },
  { id: "superhero", emoji: "🦸‍♀️", name: "Code Hero" },
];

const LEARNING_GOALS = [
  {
    id: "beginner",
    title: "Just Starting",
    subtitle: "5-10 min/day",
    icon: "🌱",
  },
  {
    id: "casual",
    title: "Casual Learner",
    subtitle: "10-15 min/day",
    icon: "📚",
  },
  {
    id: "serious",
    title: "Serious Student",
    subtitle: "15-30 min/day",
    icon: "🎯",
  },
  { id: "intense", title: "Code Warrior", subtitle: "30+ min/day", icon: "⚡" },
];

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  //Data to create User profile
  const [userData, setUserData] = useState({
    username: "",
    selectedAvatar: "",
    learningGoal: "",
  });
  const router = useRouter();
  const currentStepData = ONBOARDING_STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push("/dashboard");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return true;
      case 1:
        return userData.username.length >= 3 && userData.selectedAvatar;
      case 2:
        return userData.learningGoal;
      case 3:
        return userData.learningGoal;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center space-y-6 w-full max-w-md">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center animate-bounce-in">
              <Sparkles className="w-12 h-12 text-primary-foreground" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-foreground">
                Welcome to CodeQuest!
              </h2>
              <p className="text-muted-foreground text-pretty">
                Let's set up your learning adventure. This will only take a
                minute!
              </p>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                Create Your Profile
              </h2>
              <p className="text-sm text-muted-foreground">
                Choose a username and avatar
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Username
                </label>
                <Input
                  placeholder="Enter your username"
                  value={userData.username}
                  onChange={(e) =>
                    setUserData({ ...userData, username: e.target.value })
                  }
                  className="h-12 rounded-xl"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">
                  Choose Your Avatar
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {AVATAR_OPTIONS.map((avatar) => (
                    <Card
                      key={avatar.id}
                      className={`p-4 text-center cursor-pointer transition-all hover:scale-105 ${
                        userData.selectedAvatar === avatar.id
                          ? "border-2 border-primary bg-primary/5"
                          : "border-2 border-transparent hover:border-primary/30"
                      }`}
                      onClick={() =>
                        setUserData({ ...userData, selectedAvatar: avatar.id })
                      }
                    >
                      <div className="text-2xl mb-1">{avatar.emoji}</div>
                      <div className="text-xs font-medium">{avatar.name}</div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto bg-secondary/10 rounded-2xl flex items-center justify-center">
                <Target className="w-8 h-8 text-secondary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                Set Your Goals
              </h2>
              <p className="text-sm text-muted-foreground">
                How much time can you dedicate daily?
              </p>
            </div>

            <div className="space-y-3">
              {LEARNING_GOALS.map((goal) => (
                <Card
                  key={goal.id}
                  className={`p-4 cursor-pointer transition-all hover:scale-[1.02] ${
                    userData.learningGoal === goal.id
                      ? "border-2 border-secondary bg-secondary/5"
                      : "border-2 border-transparent hover:border-secondary/30"
                  }`}
                  onClick={() =>
                    setUserData({ ...userData, learningGoal: goal.id })
                  }
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{goal.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {goal.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {goal.subtitle}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-success to-accent rounded-3xl flex items-center justify-center animate-bounce-in">
              <div className="text-3xl">
                {AVATAR_OPTIONS.find((a) => a.id === userData.selectedAvatar)
                  ?.emoji || "🎉"}
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-foreground">
                You're All Set, {userData.username}!
              </h2>
              <p className="text-muted-foreground text-pretty">
                Ready to start your coding adventure? Let's begin with your
                first lesson!
              </p>
            </div>
            <div className="bg-muted/50 rounded-xl p-4 space-y-2">
              <div className="text-sm font-medium text-foreground">
                Your Profile:
              </div>
              <div className="text-sm text-muted-foreground">
                {
                  AVATAR_OPTIONS.find((a) => a.id === userData.selectedAvatar)
                    ?.name
                }{" "}
                •{" "}
                {
                  LEARNING_GOALS.find((g) => g.id === userData.learningGoal)
                    ?.title
                }
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col max-w-md w-full mx-auto">
      {/* Header */}
      <div className="p-4 space-y-4 ">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="rounded-xl"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="text-sm font-medium text-muted-foreground">
            {currentStep + 1} of {ONBOARDING_STEPS.length}
          </div>
        </div>

        <div className="space-y-2">
          <Progress value={currentStepData.progress} className="h-2" />
          <h1 className="text-lg font-semibold text-foreground">
            {currentStepData.title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="p-6">{renderStepContent()}</Card>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4">
        <Button
          onClick={handleNext}
          disabled={!canProceed()}
          className="w-full h-12 rounded-xl font-semibold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
        >
          {currentStep === ONBOARDING_STEPS.length - 1
            ? "Start Learning!"
            : "Continue"}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
