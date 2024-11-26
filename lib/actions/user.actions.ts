"use server"

import { createAdminClient, createSessionClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { Query, ID } from "node-appwrite"; 
import { parseStringify } from "../utils";
import { cookies } from "next/headers";
import { avatarPlaceholderUrl } from "@/constants";
import { redirect } from "next/navigation";


const getUserByEmail = async (email: string) => {
    const { databases } = await createAdminClient();
  
    //get the databases from DBid and userCollectionsId
    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal("email", [email])],
    );

    //if there are users return them
    return result.total > 0 ? result.documents[0] : null;
  };

  const handleError = (error: unknown, message: string) => {
    console.log(error, message);
    throw error;
  };

  
  export const sendEmailOTP = async ({ email }: { email: string }) => {
    const { account } = await createAdminClient();
  
    try {
        //send OTP to this email
      const session = await account.createEmailToken(ID.unique(), email);
  
      return session.userId;
    } catch (error) {
      handleError(error, "Failed to send email OTP");
    }
  };

export const createAccount = async ({
    fullName,
    email,
  }: {
    fullName: string;
    email: string;
  }) => {
    //see if user already exists
    const existingUser = await getUserByEmail(email);
  
    const accountId = await sendEmailOTP({ email });
    if (!accountId) throw new Error("Failed to send an OTP");
  
    if (!existingUser) {
      const { databases } = await createAdminClient();

      //create new Document toDB and collections/table with the ID
      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.usersCollectionId,
        ID.unique(),
        {
          fullName,
          email,
          avatar: "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg",
          accountId,
        },
      );
    }
  
    //created in utils file to create object to JSON and strigify it
    console.log(accountId)
    return parseStringify({ accountId });
  };
  
  //verify the OTP
  export const verifySecret = async ({
    accountId,
    password,
  }: {
    accountId: string;
    password: string;
  }) => {
    try {
      const { account } = await createAdminClient();
  
      //create new session
      const session = await account.createSession(accountId, password);

      //set that session to a cookie
      (await cookies()).set("appwrite-session", session.secret, {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: true,
      });

      //return the sessionId
      return parseStringify({ sessionId: session.$id });
    } catch (error) {
      handleError(error, "Failed to verify OTP");
    }
  };

  export const getCurrentUser = async () => {
    try {
        //we can call this server action in global layouts.tsx
      const { databases, account } = await createSessionClient();
  
      const result = await account.get();
  
      const user = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.usersCollectionId,
        [Query.equal("accountId", result.$id)],
      );

      //if no user
      if (user.total <= 0) return null;

      //else return 0th means current active user
      return parseStringify(user.documents[0]);
    } catch (error) {
      console.log(error);
    }
  };

  //logout
  export const signOutUser = async () => {
    const { account } = await createSessionClient();

    try {
      await account.deleteSession("current");
      (await cookies()).delete("appwrite-session");
    } catch (error) {
      handleError(error, "Failed to sign out user");
    } finally {
      redirect("/sign-in");
    }
  }

  export const signInUser = async ({ email }: { email: string }) => {
    try {
      const existingUser = await getUserByEmail(email);
  
      // User exists, send OTP
      if (existingUser) {
        await sendEmailOTP({ email });
        return parseStringify({ accountId: existingUser.accountId });
      }
  
      return parseStringify({ accountId: null, error: "User not found" });
    } catch (error) {
      handleError(error, "Failed to sign in user");
    }
  };