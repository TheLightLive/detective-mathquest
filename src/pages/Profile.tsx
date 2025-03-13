
import React from 'react';
import NavBar from "@/components/NavBar";
import UserProfile from "@/components/UserProfile";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Profile = () => {
  const { user, loading } = useFirebaseAuth();
  const { t } = useTranslation();
  
  // Redirect to sign in if not authenticated
  if (!loading && !user) {
    return <Navigate to="/signin" replace />;
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-noir flex flex-col">
        <NavBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="flex space-x-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-neon-cyan animate-bounce" style={{ animationDelay: "0s" }}></div>
              <div className="w-3 h-3 rounded-full bg-neon-purple animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              <div className="w-3 h-3 rounded-full bg-neon-pink animate-bounce" style={{ animationDelay: "0.4s" }}></div>
            </div>
            <p className="text-gray-400">{t("common.loading")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-noir flex flex-col">
      <NavBar />
      <main className="flex-1 container mx-auto py-8">
        <UserProfile />
      </main>
    </div>
  );
};

export default Profile;
