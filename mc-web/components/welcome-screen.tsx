"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, Zap, Users, Target } from "lucide-react";
import Link from "next/link";

export function WelcomeScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Title */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center animate-bounce-in">
            <Trophy className="w-10 h-10 text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground text-balance">
              MindClash
            </h1>
            <p className="text-lg text-muted-foreground text-pretty">
              Master Computer Science while having fun
            </p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-2 gap-4 text-lg">
          <Card className="p-4 text-center border-2 hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 mx-auto bg-primary/10 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold">Daily Streaks</h3>
            <p className="text-sm text-muted-foreground">
              Keep learning every day
            </p>
          </Card>

          <Card className="p-4 text-center border-2 hover:border-secondary/50 transition-colors">
            <div className="w-12 h-12 mx-auto bg-secondary/10 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="font-semibold">1v1 Duels</h3>
            <p className="text-sm text-muted-foreground">Challenge friends</p>
          </Card>

          <Card className="p-4 text-center  border-2 hover:border-accent/50 transition-colors">
            <div className="w-12 h-12 mx-auto bg-accent/10 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-semibold">Smart Quizzes</h3>
            <p className="text-sm text-muted-foreground">Adaptive learning</p>
          </Card>

          <Card className="p-4 text-center border-2 hover:border-success/50 transition-colors">
            <div className="w-12 h-12 mx-auto bg-success/10 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-success" />
            </div>
            <h3 className="font-semibold">Leaderboards</h3>
            <p className="text-sm text-muted-foreground">Compete globally</p>
          </Card>
        </div>

        {/* CTA Button */}
        <div className="space-y-4">
          <Button className="w-full h-13 text-lg font-semibold rounded-2xl bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-300">
            <Link href={"/sign-up"} className="w-full">
              Sign Up
            </Link>
          </Button>
          <Button className="w-full h-13 text-lg font-semibold rounded-2xl bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-300">
            <Link href={"/log-in"} className="w-full">
              Log In
            </Link>
          </Button>
        </div>

        {/* Subject Pills */}
        <div className="flex flex-wrap gap-2 justify-center">
          {[
            "Programming",
            "Algorithms",
            "Networking",
            "AI/ML",
            "Databases",
          ].map((subject) => (
            <span
              key={subject}
              className="px-3 py-1 bg-muted rounded-full text-xs font-medium text-muted-foreground"
            >
              {subject}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
