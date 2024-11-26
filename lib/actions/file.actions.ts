"use server"
import { InputFile } from "node-appwrite/file";
import { createAdminClient } from "../appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { ID, Models, Query  } from "node-appwrite";
import { getFileType } from "../utils";
import { constructFileUrl, parseStringify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./user.actions";

const handleError = (error: unknown, message: string) => {
    console.log(error, message);
    throw error;
  }; 

  export const renameFile = async ({
    fileId,
    name,
    extension,
    path,
  }: RenameFileProps) => {
    const { databases } = await createAdminClient();
  
    try {
      const newName = `${name}.${extension}`;
      const updatedFile = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.filesCollectionId,
        fileId,
        {
          name: newName,
        },
      );
  
      revalidatePath(path);
      return parseStringify(updatedFile);
    } catch (error) {
      handleError(error, "Failed to rename file");
    }
  };


  //sharing with users using their email
  export const updateFileUsers = async ({
    fileId,
    emails,
    path,
  }: UpdateFileUsersProps) => {
    const { databases } = await createAdminClient();
  
    try {
      const updatedFile = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.filesCollectionId,
        fileId,
        {
          //users who have access to the file is updated the email of users
          users: emails,
        },
      );
  
      revalidatePath(path);
      return parseStringify(updatedFile);
    } catch (error) {
      handleError(error, "Failed to rename file");
    }
  };
  
  

  //type is defined inside types folder
  export const uploadFile = async ({
    file,
    ownerId,
    accountId,
    path,
  }: UploadFileProps) => {
    const { storage, databases } = await createAdminClient();
  
    try {
      const inputFile = InputFile.fromBuffer(file, file.name);
  
      const bucketFile = await storage.createFile(
        appwriteConfig.bucketId,
        ID.unique(),
        inputFile,
      );
  
      //also save the details in DB so that we can use the meta data later
      const fileDocument = {
        type: getFileType(bucketFile.name).type,
        name: bucketFile.name,
        url: constructFileUrl(bucketFile.$id),
        extension: getFileType(bucketFile.name).extension,
        size: bucketFile.sizeOriginal,
        owner: ownerId,
        accountId,
        users: [],
        bucketFileId: bucketFile.$id,
      };
  
      //store it in the files collection
      const newFile = await databases
        .createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.filesCollectionId,
          ID.unique(),
          fileDocument,
        )
        .catch(async (error: unknown) => {
          await storage.deleteFile(appwriteConfig.bucketId, bucketFile.$id);
          handleError(error, "Failed to create file document");
        });
  
      revalidatePath(path);
      return parseStringify(newFile);
    } catch (error) {
      handleError(error, "Failed to upload file");
    }
  };
  


//appwrite quesries to filter, sort and get proper results
const createQueries = (
    //Models from appwrite
    currentUser: Models.Document,
    types: string[],
    searchText: string,
    sort: string,
    limit?: number,
  ) => {
    const queries = [

        //if owner field matches with currentUser's id or users field has current users email
      Query.or([
        Query.equal("owner", [currentUser.$id]),
        Query.contains("users", [currentUser.email]),
      ]),
    ];
  
    //if there is any type push it to quries
    //now items will be sorted according to theie type
    if (types.length > 0) queries.push(Query.equal("type", types));

    //find whatever is related to search term in DB
    if (searchText) queries.push(Query.contains("name", searchText));

    //limit to certain no. of results per page
    if (limit) queries.push(Query.limit(limit));
  
    //if sort exists then do this
    if (sort) {
      //there are two things hence we split it
      const [sortBy, orderBy] = sort.split("-");
  
      queries.push(
        orderBy === "asc" ? Query.orderAsc(sortBy) : Query.orderDesc(sortBy),
      );
    }
  
    return queries;
  };
export const getFiles = async ({types = [],
  searchText = "",
  sort = "$createdAt-desc",
  limit,}: GetFilesProps) => {
    const {databases} = await createAdminClient();

    try{
        //only show files of loggedin user
        const currentUser = await getCurrentUser();

        if(!currentUser) throw new Error("No user");

        //query all files
        const queries = createQueries(currentUser,types,searchText,sort,limit);


        //get the files from the DB
        const files = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.filesCollectionId,
            queries,
          );
          console.log({ files });
    return parseStringify(files);


    } catch(error){
        handleError(error, "Failed to get files");
        
    }
}

export const deleteFile = async ({
  fileId,
  bucketFileId,
  path,
}: DeleteFileProps) => {
  const { databases, storage } = await createAdminClient();

  try {
    //delete file from DB
    const deletedFile = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
    );

    //if deleted file exsits delete it from storage
    if (deletedFile) {
      await storage.deleteFile(appwriteConfig.bucketId, bucketFileId);
    }

    revalidatePath(path);
    return parseStringify({ status: "success" });
  } catch (error) {
    handleError(error, "Failed to rename file");
  }
};