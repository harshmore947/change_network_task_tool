"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function SeedDataPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<any>(null);

  const handleSeedData = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/seed-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error seeding data:", error);
      setResult({
        success: false,
        error: "Failed to seed data. Check console for details.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Database Seeding</h1>
        <p className="text-muted-foreground mb-8">
          Click the button below to add dummy users and tasks to your database.
        </p>

        <Button
          onClick={handleSeedData}
          disabled={isLoading}
          size="lg"
          className="mb-6"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Dummy Data...
            </>
          ) : (
            "Add Dummy Data"
          )}
        </Button>

        {result && (
          <div
            className={`p-4 rounded-lg ${
              result.success
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            {result.success ? (
              <div>
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  ✅ Success!
                </h3>
                <p className="text-green-700 mb-4">{result.message}</p>

                {result.users && (
                  <div className="text-left">
                    <h4 className="font-semibold text-green-800 mb-2">
                      Test Users Created:
                    </h4>
                    <div className="space-y-1 text-sm">
                      {result.users.map((user: any, index: number) => (
                        <div
                          key={index}
                          className="bg-white p-2 rounded border"
                        >
                          <strong>Email:</strong> {user.email}
                          <br />
                          <strong>Password:</strong> {user.password}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  ❌ Error
                </h3>
                <p className="text-red-700">{result.error}</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
          <h3 className="font-semibold text-blue-800 mb-2">
            What this will create:
          </h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• 3 dummy users with different roles</li>
            <li>• 5 sample tasks with various statuses and priorities</li>
            <li>• Tasks assigned to different users</li>
            <li>• Realistic due dates and descriptions</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
